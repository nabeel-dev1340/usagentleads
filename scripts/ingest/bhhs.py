"""Berkshire Hathaway HomeServices agent directory -> normalized CSV.

bhhs.com sits behind Cloudflare, so unlike the other adapters this one cannot be
a plain .mjs fetch script. It drives a real browser with pydoll (which solves the
Cloudflare interstitial), then calls the site's own Solr servlet from *inside*
the cleared page so the request inherits the clearance cookies:

    /bin/bhhs/solrAgentSearchServlet?state=TX&resultSize=100&sortType=3&page=N

The servlet answers with OData-shaped JSON: `@odata.count` plus a `value` array
whose records carry MemberFullName / MemberEmail / MemberMobilePhone /
MemberOfficePhone / MemberStateOrProvince — everything we ingest.

Output is a `name,state,email,phone` CSV for `import-csv.mjs`, which owns the
upsert so there is only one implementation of the dedup rules.

    python3 scripts/ingest/bhhs.py --out /tmp/bhhs.csv [--states TX,CA] [--limit N]

Notes:
  * resultSize is capped near 100 server-side; asking for 500 still yields ~100.
  * Pages return slightly fewer rows than requested (hidden/undisplayed members),
    so paging stops on an empty page rather than on a short one.
  * The page load event never fires (third-party trackers hang), so navigation
    timeouts are expected and ignored.
"""

import argparse
import asyncio
import csv
import json
import re
import sys

from pydoll.browser import Chrome
from pydoll.browser.options import ChromiumOptions

SEED_URL = "https://www.bhhs.com/agent-search-results?city=Houston%2C+TX%2C+USA"
SERVLET = "/bin/bhhs/solrAgentSearchServlet"
PAGE_SIZE = 100

STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
    "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan",
    "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota",
    "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania",
    "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee",
    "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}

EMAIL_RE = re.compile(r"^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$")
JUNK_EMAIL = re.compile(r"noemail|nomail|none@|@none\.|no@no|donotemail|test@test")


def clean_email(raw):
    e = str(raw or "").strip().lower()
    if not e or len(e) > 254 or not EMAIL_RE.match(e) or JUNK_EMAIL.search(e):
        return ""
    return e


def clean_phone(raw):
    d = re.sub(r"\D", "", str(raw or ""))
    if len(d) == 10:
        return d
    if len(d) == 11 and d.startswith("1"):
        return d[1:]
    return ""


def title_case(raw):
    s = re.sub(r"\s+", " ", str(raw or "")).strip()
    if not s:
        return ""
    return re.sub(r"(^|[\s\-'.])([a-z])", lambda m: m.group(1) + m.group(2).upper(), s.lower())


async def _value(tab, expr):
    r = await tab.execute_script(expr)
    return r["result"]["result"].get("value")


async def fetch_page(tab, qs, tries=3):
    """Run the servlet call inside the page and wait for the parked result."""
    for _ in range(tries):
        await tab.execute_script(
            f"""
            window.__bhhs = null;
            fetch('{SERVLET}?{qs}', {{headers: {{'X-Requested-With': 'XMLHttpRequest'}}}})
              .then(r => r.text().then(t => window.__bhhs = JSON.stringify({{s: r.status, b: t}})))
              .catch(e => window.__bhhs = JSON.stringify({{s: 'ERR', b: String(e)}}));
            """
        )
        for _ in range(30):
            await asyncio.sleep(1)
            out = await _value(tab, "window.__bhhs")
            if out:
                try:
                    payload = json.loads(out)
                    return json.loads(payload["b"])
                except Exception:
                    break  # non-JSON (Cloudflare page) -> retry
        await asyncio.sleep(3)
    return None


def normalize(rec):
    name = title_case(rec.get("MemberFullName"))
    state = STATES.get(str(rec.get("MemberStateOrProvince") or "").strip().upper(), "")
    email = clean_email(rec.get("MemberEmail"))
    phone = clean_phone(rec.get("MemberMobilePhone")) or clean_phone(rec.get("MemberOfficePhone"))
    if not name or not state:
        return None
    if not email and not phone:
        return None
    return {"name": name, "state": state, "email": email, "phone": phone}


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--states", help="comma-separated codes, default all")
    ap.add_argument("--limit", type=int, default=0, help="stop after N rows (testing)")
    args = ap.parse_args()

    codes = [c.strip().upper() for c in args.states.split(",")] if args.states else list(STATES)

    rows = []
    seen_keys = set()

    opts = ChromiumOptions()
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")

    async with Chrome(options=opts) as browser:
        tab = await browser.start()
        await tab.enable_auto_solve_cloudflare_captcha()
        try:
            await tab.go_to(SEED_URL, timeout=45)
        except Exception:
            pass  # load event never fires; the page is still usable
        await asyncio.sleep(15)

        for code in codes:
            state_rows = 0
            page = 1
            while True:
                data = await fetch_page(tab, f"state={code}&resultSize={PAGE_SIZE}&sortType=3&page={page}")
                if data is None:
                    print(f"  ! {code} page {page} failed — partial", file=sys.stderr)
                    break
                batch = data.get("value") or []
                if not batch:
                    break
                for rec in batch:
                    key = rec.get("MemberKey")
                    if key and key in seen_keys:
                        continue
                    if key:
                        seen_keys.add(key)
                    lead = normalize(rec)
                    if lead:
                        rows.append(lead)
                        state_rows += 1
                page += 1
                if args.limit and len(rows) >= args.limit:
                    break
                await asyncio.sleep(0.4)

            total = data.get("@odata.count") if data else "?"
            print(f"  {code}: {state_rows} agents (reported {total}, running total {len(rows)})")
            if args.limit and len(rows) >= args.limit:
                break

    with open(args.out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["name", "state", "email", "phone"])
        w.writeheader()
        w.writerows(rows)

    with_email = sum(1 for r in rows if r["email"])
    with_phone = sum(1 for r in rows if r["phone"])
    print(f"\nwrote {len(rows)} rows to {args.out}")
    print(f"  with email: {with_email}  with phone: {with_phone}  unique members: {len(seen_keys)}")


asyncio.run(main())
