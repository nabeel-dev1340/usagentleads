export interface SampleContact {
  name: string
  email: string
  phone: string
}

// Real contacts pulled from the leads table — one per state, hardcoded to
// avoid a DB roundtrip on every state page render. See app/states/[state]/page.tsx.
export const STATE_SAMPLE_CONTACTS: Record<string, SampleContact> = {
  alabama: { name: "Priscilla Morgan", email: "priscilla@joysullivanrealty.com", phone: "(251) 271-5020" },
  alaska: { name: "Bob Brock", email: "brockra@alaska.net", phone: "(907) 261-7603" },
  arizona: { name: "Joseph Sjoberg", email: "AZHomesbyJoe@gmail.com", phone: "(402) 578-5639" },
  arkansas: { name: "Shina Olatunji", email: "shina.olatunji@gmail.com", phone: "(479) 313-6863" },
  california: { name: "Sevan Baroni", email: "sean@nhluxe.com", phone: "(818) 441-1871" },
  colorado: { name: "Jarrod Ridnour", email: "jarrodridnour@outlook.com", phone: "(970) 412-7685" },
  connecticut: { name: "Mike Gregor", email: "mike@sellitmike.com", phone: "(860) 866-7470" },
  delaware: { name: "Dana Sterlachini", email: "dayna.sterlachini@compass.com", phone: "(484) 410-9406" },
  florida: { name: "Charles Collins", email: "ccollins@ellisonrealty.com", phone: "(352) 484-8867" },
  georgia: { name: "Ginny Rushing", email: "ginny.rushing@homevestors.com", phone: "(954) 545-5583" },
  hawaii: { name: "Keiko Miyanaga", email: "Keiko@LuxuryHm.com", phone: "(808) 387-9892" },
  idaho: { name: "Jeanette Hendricks", email: "reloinfo4u@aol.com", phone: "(208) 521-3514" },
  illinois: { name: "Twy Moore-Callaway", email: "twy.callaway@cbexchange.com", phone: "(708) 655-5326" },
  indiana: { name: "Deanna Whitlow", email: "dynamicdimensionrealty@gmail.com", phone: "(317) 334-5899" },
  iowa: { name: "Marshelle Fatino", email: "marshelle@VIARealtors.com", phone: "(515) 710-1124" },
  kansas: { name: "Jennifer May", email: "jennmay@kw.com", phone: "(913) 825-4007" },
  kentucky: { name: "Heather McPeek", email: "heatherjmcpeek@yahoo.com", phone: "(606) 454-5104" },
  louisiana: { name: "Doug Adams", email: "doug.adams@kw.com", phone: "(337) 552-3815" },
  maine: { name: "Tim Fortin", email: "info@fortinmacdonald.com", phone: "(207) 441-0320" },
  maryland: { name: "Marco Novillo", email: "mnovillo@springhillres.com", phone: "(571) 316-9745" },
  massachusetts: { name: "Robert Dugan", email: "robbobdug@aol.com", phone: "(508) 548-4093" },
  michigan: { name: "Tamara Dunn", email: "tldunn@kw.com", phone: "(810) 515-1503" },
  minnesota: { name: "Shanna Perez-Davis", email: "shannapd@gmail.com", phone: "(218) 820-4426" },
  mississippi: { name: "Chase Grayson", email: "chase@rogprime.com", phone: "(601) 500-0035" },
  missouri: { name: "Fairoz Akbar", email: "Fairoz.akbar@kw.com", phone: "(314) 677-6000" },
  montana: { name: "Ryan Connelly", email: "ryanundertrees@gmail.com", phone: "(406) 579-4977" },
  nebraska: { name: "Alicia Giles", email: "aliciagiles8@gmail.com", phone: "(402) 297-7519" },
  nevada: { name: "Kelly Raia", email: "misskellyraia@gmail.com", phone: "(888) 461-0101" },
  "new-hampshire": { name: "Gwen Timbas", email: "gwen.timbas@verani.com", phone: "(603) 434-2377" },
  "new-jersey": { name: "Edwin Lora", email: "EdwinLoraDiaz@gmail.com", phone: "(888) 501-6953" },
  "new-mexico": { name: "Jeremy Spence", email: "spencedefinesrealty@gmail.com", phone: "(505) 883-9400" },
  "new-york": { name: "Lawrence Wong", email: "lwong@mesothebysrealty.com", phone: "(718) 232-1004" },
  "north-carolina": { name: "Belinda Faulkner", email: "bgfaulkner1949@gmail.com", phone: "(252) 904-2558" },
  "north-dakota": { name: "Kevin Osborne", email: "Kevin.osborne97@yahoo.com", phone: "(701) 230-3174" },
  ohio: { name: "Ines Vidic", email: "inesvidic@kw.com", phone: "(330) 686-1644" },
  oklahoma: { name: "Lori Fulton", email: "lori.fulton@kw.com", phone: "(918) 637-7068" },
  oregon: { name: "Larry Litberg", email: "larry.litberg@coldwellbanker.com", phone: "(503) 538-0468" },
  pennsylvania: { name: "Hannah Ventura", email: "hannah.ventura@cbrealty.com", phone: "(412) 363-4000" },
  "rhode-island": { name: "Kory Blythe", email: "koryblythesilva@gmail.com", phone: "(508) 642-9054" },
  "south-carolina": { name: "Mykal Moore", email: "m.moore@adamtaylorteam.com", phone: "(888) 440-2798" },
  "south-dakota": { name: "Susie Crist", email: "susie.crist@coldwellbanker.com", phone: "(937) 890-2200" },
  tennessee: { name: "Beth Barker", email: "barkerlistings@gmail.com", phone: "(901) 438-8334" },
  texas: { name: "Linda Mitchell", email: "lindacmitchell@gmail.com", phone: "(214) 794-0743" },
  utah: { name: "Cristina Zavala-Vargas", email: "zavarconnections@gmail.com", phone: "(435) 772-8463" },
  vermont: { name: "Xander Paumgarten", email: "xander.paumgarten@pallspera.com", phone: "(802) 253-9771" },
  virginia: { name: "Mukta Mehra", email: "tomukta@hotmail.com", phone: "(703) 888-5100" },
  washington: { name: "Jemima Crosby", email: "jcrosby@cbt-tc.com", phone: "(509) 380-1920" },
  "west-virginia": { name: "Robert Wilkinson", email: "soldbywilkinson@gmail.com", phone: "(304) 373-9602" },
  wisconsin: { name: "Sandy Armstrong", email: "Sandy.Armstrong@century21.com", phone: "(920) 540-6087" },
  wyoming: { name: "Tim Miracle", email: "timm@actionc21.com", phone: "(307) 237-4819" },
}

export function getStateSampleContact(slug: string): SampleContact | undefined {
  return STATE_SAMPLE_CONTACTS[slug]
}
