"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Code2, Key, BarChart3, Zap, ArrowRight, Copy, Check } from "lucide-react"

const codeExamples = {
  curl: {
    label: "cURL",
    code: `curl -H "X-API-Key: sk_live_abc123..." \\
  "https://usagentleads.com/api/v1/agents?state=CA&page=1&pageSize=25"`,
  },
  javascript: {
    label: "JavaScript",
    code: `const res = await fetch(
  "https://usagentleads.com/api/v1/agents?state=CA",
  { headers: { "X-API-Key": "sk_live_abc123..." } }
);

const { data, count, quota } = await res.json();
// data: [{ id, name, email, phone, state }, ...]`,
  },
  python: {
    label: "Python",
    code: `import requests

res = requests.get(
    "https://usagentleads.com/api/v1/agents",
    params={"state": "CA", "page": 1, "pageSize": 25},
    headers={"X-API-Key": "sk_live_abc123..."}
)

agents = res.json()["data"]`,
  },
}

type Lang = keyof typeof codeExamples

const features = [
  {
    icon: Key,
    title: "API Key Auth",
    desc: "SHA-256 hashed keys with instant revocation. Up to 3 active keys per account.",
  },
  {
    icon: Zap,
    title: "60 req/min",
    desc: "Per-key rate limiting with clear headers. Designed for production workloads.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    desc: "Real-time dashboard showing daily usage, monthly quota, and per-key activity.",
  },
  {
    icon: Code2,
    title: "Simple REST",
    desc: "One endpoint, clean JSON responses. Filter by state, search by name or email.",
  },
]

export function ApiSection() {
  const [lang, setLang] = useState<Lang>("curl")
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[lang].code)
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="bg-white py-28 max-sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center flex flex-col items-center">
          <p className="label-eyebrow">API Access</p>
          <h2 className="section-heading">Build With Our Data</h2>
          <p className="section-sub max-w-xl">
            Integrate 500K+ real estate agent contacts directly into your CRM,
            marketing platform, or custom application via our REST API.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto items-start">
          {/* Code example */}
          <div className="reveal min-w-0">
            <div className="rounded-xl bg-ink overflow-hidden shadow-xl">
              {/* Tab bar */}
              <div className="flex items-center justify-between border-b border-dark-border px-4">
                <div className="flex gap-1" role="tablist" aria-label="Code examples">
                  {(Object.keys(codeExamples) as Lang[]).map((key) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={lang === key}
                      aria-controls="code-tabpanel"
                      onClick={() => setLang(key)}
                      className={`px-3 py-2.5 text-[13px] font-mono font-medium transition-colors border-b-2 -mb-px ${
                        lang === key
                          ? "text-white border-accent"
                          : "text-tertiary border-transparent hover:text-muted"
                      }`}
                    >
                      {codeExamples[key].label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 text-[12px] font-mono text-tertiary hover:text-white transition-colors py-2"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              {/* Code */}
              <pre id="code-tabpanel" role="tabpanel" aria-label={`${codeExamples[lang].label} code example`} className="p-4 sm:p-5 text-[12px] sm:text-[13px] font-mono text-code-text leading-relaxed overflow-x-auto whitespace-pre-wrap break-all sm:break-normal">
                {codeExamples[lang].code}
              </pre>
              {/* Response preview */}
              <div className="border-t border-dark-border px-5 py-4">
                <p className="text-[11px] font-mono uppercase tracking-wider text-tertiary mb-2">
                  Response
                </p>
                <pre className="text-[11px] sm:text-[12px] font-mono text-muted leading-relaxed overflow-x-auto whitespace-pre-wrap break-all sm:break-normal">{`{
  "data": [
    { "name": "Jane Smith", "email": "jane@...", "phone": "(310) 555-...", "state": "California" }
  ],
  "count": 42318,
  "page": 1,
  "totalPages": 1693,
  "quota": { "used": 147, "limit": 10000 }
}`}</pre>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reveal-stagger">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl border border-border bg-white hover:border-border-strong hover:shadow-sm transition-all duration-200"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light mb-3">
                  <f.icon size={18} className="text-accent" />
                </div>
                <p className="text-[15px] font-semibold text-ink mb-1">{f.title}</p>
                <p className="text-[14px] text-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link href="/docs" className="btn-primary text-[15px] px-6 py-3">
            Read API Docs <ArrowRight size={14} />
          </Link>
          <Link href="/pricing" className="btn-outline text-[15px] px-6 py-3">
            Start Free Trial — 100 API calls included
          </Link>
        </div>
      </div>
    </section>
  )
}
