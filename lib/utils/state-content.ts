import type { USState } from "@/types"

interface StateContent {
  description: string
  cities: string[]
}

export const STATE_CONTENT: Record<string, StateContent> = {
  alabama: {
    description:
      "Alabama's real estate market spans vibrant urban hubs like Birmingham and Huntsville alongside Gulf Coast destinations such as Mobile and Orange Beach. With steady population growth in metro areas, Alabama agents serve a diverse mix of residential, commercial, and vacation property buyers.",
    cities: ["Birmingham", "Huntsville", "Montgomery", "Mobile", "Tuscaloosa"],
  },
  alaska: {
    description:
      "Alaska's unique real estate landscape covers everything from Anchorage's urban housing market to remote rural properties across the largest state by area. Agents here specialize in a mix of residential, land, and investment opportunities shaped by the state's distinctive geography and climate.",
    cities: ["Anchorage", "Fairbanks", "Juneau", "Wasilla", "Sitka"],
  },
  arizona: {
    description:
      "Arizona is one of the fastest-growing real estate markets in the US, driven by rapid population growth in the Phoenix metro area, Tucson, and Scottsdale. With over 61,000 licensed agents, the state offers a highly competitive market spanning luxury desert homes, retirement communities, and new construction.",
    cities: ["Phoenix", "Tucson", "Scottsdale", "Mesa", "Chandler"],
  },
  arkansas: {
    description:
      "Arkansas offers an affordable real estate market centered around Little Rock, Fayetteville, and the fast-growing Northwest Arkansas corridor. Agents here serve first-time buyers, investors, and families drawn to the state's low cost of living and natural beauty.",
    cities: ["Little Rock", "Fayetteville", "Fort Smith", "Bentonville", "Jonesboro"],
  },
  california: {
    description:
      "California has the largest real estate market in the United States, with over 481,000 licensed agents across major metro areas including Los Angeles, San Francisco, San Diego, and Sacramento. Whether you're targeting luxury agents in Beverly Hills or commercial specialists in the Bay Area, this dataset provides direct access to verified contacts statewide.",
    cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
  },
  colorado: {
    description:
      "Colorado's booming real estate market is anchored by the Denver metro area, with strong activity in Colorado Springs, Fort Collins, and Boulder. The state's outdoor lifestyle and tech industry growth continue to drive demand for both residential and commercial real estate agents.",
    cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"],
  },
  connecticut: {
    description:
      "Connecticut's real estate market bridges New York City commuter communities with charming New England towns. Agents in Hartford, Stamford, New Haven, and the Fairfield County corridor serve a mix of luxury buyers, families, and professionals seeking proximity to NYC.",
    cities: ["Hartford", "Stamford", "New Haven", "Bridgeport", "Greenwich"],
  },
  delaware: {
    description:
      "Delaware's compact but active real estate market serves the Wilmington metro area, beach communities like Rehoboth, and suburban neighborhoods attracting Philadelphia-area commuters. Despite its small size, the state has a dedicated agent base spanning residential and commercial sectors.",
    cities: ["Wilmington", "Dover", "Newark", "Rehoboth Beach", "Middletown"],
  },
  florida: {
    description:
      "Florida is the second-largest real estate market in the US with over 327,000 licensed agents. The state's massive market covers Miami luxury condos, Orlando family homes, Tampa Bay developments, and retirement communities across the Gulf Coast. Strong population growth and no state income tax fuel continued demand.",
    cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
  },
  georgia: {
    description:
      "Georgia's real estate market is dominated by the Atlanta metropolitan area, one of the fastest-growing metros in the US. With over 62,000 agents statewide, the market extends to Savannah's historic homes, Augusta's suburban developments, and Athens' college-town rentals.",
    cities: ["Atlanta", "Savannah", "Augusta", "Athens", "Marietta"],
  },
  hawaii: {
    description:
      "Hawaii's real estate market is defined by its island geography, luxury beachfront properties, and strong vacation rental demand. Agents in Honolulu, Maui, and the Big Island serve a unique mix of local residents, mainland investors, and international buyers seeking paradise properties.",
    cities: ["Honolulu", "Maui", "Hilo", "Kailua", "Kapolei"],
  },
  idaho: {
    description:
      "Idaho has emerged as one of the hottest real estate markets in the US, with Boise leading explosive growth alongside Meridian, Nampa, and Coeur d'Alene. Agents serve a surge of relocations from higher-cost West Coast states seeking affordable homes and outdoor lifestyles.",
    cities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Coeur d'Alene"],
  },
  illinois: {
    description:
      "Illinois' real estate market centers on the Chicago metropolitan area, the third-largest in the US. With over 54,000 agents, the state covers everything from downtown Chicago luxury condos to suburban family homes in Naperville, Schaumburg, and Springfield's capital-region properties.",
    cities: ["Chicago", "Aurora", "Naperville", "Springfield", "Rockford"],
  },
  indiana: {
    description:
      "Indiana offers an affordable Midwest real estate market anchored by Indianapolis, with growing demand in Fort Wayne, Evansville, and the South Bend area. Agents serve a mix of first-time buyers, investors attracted to rental yields, and families seeking value in suburban communities.",
    cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel"],
  },
  iowa: {
    description:
      "Iowa's real estate market features steady growth in Des Moines, Cedar Rapids, and Iowa City. With an affordable cost of living and strong job market, agents here serve a consistent stream of first-time buyers, families, and agricultural property investors across both urban and rural markets.",
    cities: ["Des Moines", "Cedar Rapids", "Iowa City", "Davenport", "Sioux City"],
  },
  kansas: {
    description:
      "Kansas' real estate market spans the Kansas City metro area (shared with Missouri), Wichita, and Topeka. Agents serve a market known for affordability and steady appreciation, attracting first-time buyers, military families near Fort Riley, and investors seeking Midwest rental properties.",
    cities: ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe"],
  },
  kentucky: {
    description:
      "Kentucky's real estate market is anchored by Louisville and Lexington, with growing activity in Bowling Green and Northern Kentucky's Cincinnati suburbs. Agents serve buyers attracted to the state's affordable housing, bourbon country estates, and horse farm properties in the Bluegrass region.",
    cities: ["Louisville", "Lexington", "Bowling Green", "Covington", "Owensboro"],
  },
  louisiana: {
    description:
      "Louisiana's real estate market blends the cultural richness of New Orleans with growing suburban markets in Baton Rouge, Shreveport, and Lafayette. Agents navigate a unique landscape of historic French Quarter properties, Garden District homes, and modern developments across the state's diverse parishes.",
    cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"],
  },
  maine: {
    description:
      "Maine's real estate market combines Portland's thriving urban scene with coastal properties, lakefront retreats, and rural New England charm. Agents serve a growing number of remote workers relocating from Boston and New York, plus vacation home buyers drawn to Acadia and the Maine coast.",
    cities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"],
  },
  maryland: {
    description:
      "Maryland's real estate market benefits from its proximity to Washington D.C. and Baltimore, creating strong demand for suburban and commuter properties. With over 31,000 agents, the state covers everything from Montgomery County luxury homes to Eastern Shore waterfront properties and Annapolis sailing communities.",
    cities: ["Baltimore", "Rockville", "Bethesda", "Silver Spring", "Annapolis"],
  },
  massachusetts: {
    description:
      "Massachusetts' real estate market centers on the greater Boston area, one of the most competitive markets in the US. With over 27,000 agents, the state covers Boston's luxury condos, Cambridge's academic community, Cape Cod vacation homes, and the growing Pioneer Valley region.",
    cities: ["Boston", "Cambridge", "Worcester", "Springfield", "Plymouth"],
  },
  michigan: {
    description:
      "Michigan's real estate market spans the Detroit metro area's ongoing revitalization, Grand Rapids' booming growth, and the scenic properties of Traverse City and the Upper Peninsula. Agents serve a diverse market from urban redevelopment to lakefront vacation homes across the Great Lakes State.",
    cities: ["Detroit", "Grand Rapids", "Ann Arbor", "Traverse City", "Lansing"],
  },
  minnesota: {
    description:
      "Minnesota's real estate market is anchored by the Minneapolis-St. Paul Twin Cities metro, with additional activity in Rochester, Duluth, and St. Cloud. Agents serve a strong market driven by the state's corporate headquarters, healthcare sector, and quality of life that attracts families and professionals.",
    cities: ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington"],
  },
  mississippi: {
    description:
      "Mississippi offers some of the most affordable real estate in the US, with active markets in Jackson, the Gulf Coast, and the Oxford college-town area. Agents serve first-time buyers, investors seeking cash-flow properties, and retirees attracted to the state's low cost of living and Southern charm.",
    cities: ["Jackson", "Gulfport", "Biloxi", "Hattiesburg", "Oxford"],
  },
  missouri: {
    description:
      "Missouri's real estate market spans two major metros — Kansas City and St. Louis — along with growing markets in Springfield and Columbia. Agents serve a diverse buyer base drawn to the state's central location, affordable housing, and strong rental investment opportunities in both urban and suburban areas.",
    cities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence"],
  },
  montana: {
    description:
      "Montana's real estate market has seen dramatic growth as remote workers and lifestyle buyers discover Bozeman, Missoula, and Whitefish. Agents serve a premium market of ranch properties, mountain retreats, and growing suburban developments in a state known for its natural beauty and outdoor recreation.",
    cities: ["Billings", "Missoula", "Bozeman", "Great Falls", "Whitefish"],
  },
  nebraska: {
    description:
      "Nebraska's real estate market is centered on Omaha and Lincoln, with both cities experiencing steady growth and development. Agents serve a stable market known for affordability, strong schools, and a growing tech sector that's attracting young professionals and families to the state.",
    cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
  },
  nevada: {
    description:
      "Nevada's real estate market is driven by Las Vegas, one of the fastest-growing metros in the US, alongside Reno's tech-fueled expansion. With over 31,000 agents, the state serves a dynamic mix of residential buyers, investors, luxury property seekers, and newcomers relocating from California.",
    cities: ["Las Vegas", "Reno", "Henderson", "North Las Vegas", "Sparks"],
  },
  "new-hampshire": {
    description:
      "New Hampshire's real estate market attracts Boston commuters, remote workers, and lifestyle buyers seeking the Granite State's tax advantages and natural beauty. Agents in Nashua, Manchester, and the Lakes Region serve buyers drawn by no state income tax, no sales tax, and proximity to both mountains and the coast.",
    cities: ["Manchester", "Nashua", "Concord", "Dover", "Portsmouth"],
  },
  "new-jersey": {
    description:
      "New Jersey's real estate market is one of the most active in the Northeast, with over 51,000 agents serving the state's dense suburban communities between New York City and Philadelphia. From Jersey Shore beach towns to Bergen County luxury homes, agents cover a high-value, fast-moving market.",
    cities: ["Newark", "Jersey City", "Princeton", "Hoboken", "Morristown"],
  },
  "new-mexico": {
    description:
      "New Mexico's real estate market combines Albuquerque's growing metro area with Santa Fe's luxury arts community and Las Cruces' Sun Belt appeal. Agents serve a unique market blending Southwest culture, retirement destinations, and increasingly popular remote-work relocations.",
    cities: ["Albuquerque", "Santa Fe", "Las Cruces", "Rio Rancho", "Roswell"],
  },
  "new-york": {
    description:
      "New York has one of the largest real estate markets in the world, with over 71,000 licensed agents across New York City, Long Island, Westchester, and Upstate markets. From Manhattan luxury apartments to Hudson Valley estates and Buffalo's revitalizing neighborhoods, agents cover every segment of the market.",
    cities: ["New York City", "Buffalo", "Albany", "Rochester", "Westchester"],
  },
  "north-carolina": {
    description:
      "North Carolina is one of the fastest-growing states in the US, with booming real estate markets in Charlotte, Raleigh-Durham's Research Triangle, and Asheville's mountain community. Over 55,000 agents serve a diverse market of tech workers, retirees, and families relocating from higher-cost states.",
    cities: ["Charlotte", "Raleigh", "Durham", "Asheville", "Wilmington"],
  },
  "north-dakota": {
    description:
      "North Dakota's real estate market centers on Fargo, Bismarck, and Grand Forks, with activity influenced by the state's energy sector and agricultural economy. Agents serve a stable market with affordable housing prices and steady demand from families, professionals, and energy industry workers.",
    cities: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"],
  },
  ohio: {
    description:
      "Ohio's real estate market spans multiple major metros — Columbus, Cleveland, Cincinnati, and Dayton — making it one of the most diverse Midwest markets. With over 46,000 agents, the state offers affordable urban living, strong rental markets, and growing suburban developments across its major corridors.",
    cities: ["Columbus", "Cleveland", "Cincinnati", "Dayton", "Toledo"],
  },
  oklahoma: {
    description:
      "Oklahoma's real estate market is anchored by Oklahoma City and Tulsa, both experiencing steady growth and development. Agents serve a highly affordable market that attracts first-time buyers, investors seeking rental income, and families looking for spacious homes at prices well below the national average.",
    cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"],
  },
  oregon: {
    description:
      "Oregon's real estate market is led by Portland's urban market, with growing demand in Bend, Eugene, and Salem. Agents serve a mix of tech industry professionals, outdoor enthusiasts, and California transplants seeking Oregon's quality of life and more affordable home prices.",
    cities: ["Portland", "Eugene", "Salem", "Bend", "Medford"],
  },
  pennsylvania: {
    description:
      "Pennsylvania's real estate market spans Philadelphia's historic urban core and Pittsburgh's revitalizing tech scene, with suburban markets throughout the Lehigh Valley and Lancaster County. Over 47,000 agents serve a state that blends East Coast urban living with affordable Rust Belt revival neighborhoods.",
    cities: ["Philadelphia", "Pittsburgh", "Allentown", "Lancaster", "Reading"],
  },
  "rhode-island": {
    description:
      "Rhode Island's compact real estate market packs coastal charm, historic architecture, and urban living into the nation's smallest state. Agents in Providence, Newport, and Warwick serve buyers drawn to waterfront properties, Brown University's academic community, and easy access to Boston and New York.",
    cities: ["Providence", "Warwick", "Newport", "Cranston", "Pawtucket"],
  },
  "south-carolina": {
    description:
      "South Carolina's real estate market is booming, with Charleston, Myrtle Beach, and Greenville leading growth across the state. Over 31,000 agents serve a market of relocating retirees, vacation home buyers, and young professionals attracted to the state's affordability, warm climate, and coastal lifestyle.",
    cities: ["Charleston", "Myrtle Beach", "Greenville", "Columbia", "Hilton Head"],
  },
  "south-dakota": {
    description:
      "South Dakota's real estate market centers on Sioux Falls and Rapid City, with the state's no-income-tax policy and low cost of living attracting steady migration. Agents serve a growing market of families, retirees, and remote workers seeking affordable Midwest living with Black Hills recreation access.",
    cities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"],
  },
  tennessee: {
    description:
      "Tennessee's real estate market is driven by Nashville's explosive growth, with Memphis, Knoxville, and Chattanooga also seeing strong demand. Over 38,000 agents serve a state with no income tax, a booming music and entertainment industry, and some of the most popular relocation destinations in the Southeast.",
    cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Murfreesboro"],
  },
  texas: {
    description:
      "Texas is the second-largest real estate market in the US, with over 232,000 licensed agents spanning the massive metros of Houston, Dallas-Fort Worth, San Antonio, and Austin. The state's no-income-tax policy, booming tech sector, and rapid population growth create one of the most dynamic agent markets in the country.",
    cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
  },
  utah: {
    description:
      "Utah's real estate market has surged with Salt Lake City's tech boom (Silicon Slopes), outdoor recreation appeal, and family-friendly communities. Agents in Provo, Ogden, and St. George serve a young, fast-growing population seeking everything from mountain condos to suburban family homes.",
    cities: ["Salt Lake City", "Provo", "Ogden", "St. George", "West Jordan"],
  },
  vermont: {
    description:
      "Vermont's real estate market offers a unique blend of ski-town properties, college-town rentals near UVM, and pastoral New England homesteads. Agents in Burlington, Stowe, and Montpelier serve remote workers, vacation home buyers, and newcomers drawn to the state's quality of life and four-season outdoor access.",
    cities: ["Burlington", "Stowe", "Montpelier", "Rutland", "Brattleboro"],
  },
  virginia: {
    description:
      "Virginia's real estate market benefits from the massive Washington D.C. metro economy, with Northern Virginia (Arlington, Fairfax, Alexandria) driving high-value transactions. Over 42,000 agents serve a diverse state that includes Richmond's urban revival, Virginia Beach's coastal market, and Charlottesville's university community.",
    cities: ["Arlington", "Virginia Beach", "Richmond", "Alexandria", "Fairfax"],
  },
  washington: {
    description:
      "Washington state's real estate market is powered by Seattle's tech industry (Amazon, Microsoft), with Tacoma, Bellevue, and Spokane also seeing strong growth. Over 44,000 agents serve a market of tech professionals, outdoor enthusiasts, and Pacific Northwest lifestyle seekers across both urban and rural settings.",
    cities: ["Seattle", "Tacoma", "Bellevue", "Spokane", "Vancouver"],
  },
  "west-virginia": {
    description:
      "West Virginia's real estate market offers some of the most affordable properties in the Eastern US, centered around Charleston, Morgantown, and the Eastern Panhandle's D.C. commuter communities. Agents serve buyers seeking mountain retreats, investment properties, and affordable family homes in the Mountain State.",
    cities: ["Charleston", "Morgantown", "Huntington", "Parkersburg", "Martinsburg"],
  },
  wisconsin: {
    description:
      "Wisconsin's real estate market spans Milwaukee's urban core, Madison's thriving tech and university scene, and Green Bay's steady Midwest market. Agents serve a diverse buyer base of families, investors, and newcomers attracted to the state's affordable housing, strong schools, and Great Lakes recreation.",
    cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
  },
  wyoming: {
    description:
      "Wyoming's real estate market covers Jackson Hole's luxury resort properties, Cheyenne's affordable capital-city homes, and Casper's energy-sector market. Agents serve a niche but active market of ranch buyers, outdoor enthusiasts, and investors attracted by the state's no-income-tax policy and wide-open spaces.",
    cities: ["Cheyenne", "Jackson", "Casper", "Laramie", "Gillette"],
  },
}

export function getStateContent(slug: string): StateContent | undefined {
  return STATE_CONTENT[slug]
}

export function getStateFAQs(
  state: { name: string; code: string },
  agentCount: number
): { question: string; answer: string }[] {
  return [
    {
      question: `How many real estate agents are in ${state.name}?`,
      answer: `Our database contains ${agentCount.toLocaleString()}+ verified real estate agent contacts in ${state.name}, including name, email address, and phone number.`,
    },
    {
      question: `Where can I find a realtor email list for ${state.name}?`,
      answer: `USAgentLeads provides a complete ${state.name} realtor email list with ${agentCount.toLocaleString()}+ verified contacts. Download the full email database instantly as a CSV file for $10 one-time.`,
    },
    {
      question: `How do I find emails and phone numbers of real estate agents in ${state.name}?`,
      answer: `The easiest way to find ${state.name} real estate agent emails and phone numbers is to download our verified database. It includes ${agentCount.toLocaleString()}+ agent contacts with name, email, and phone — sourced from public licensing records and professional directories.`,
    },
    {
      question: `What format is the ${state.name} agent list delivered in?`,
      answer: `The ${state.name} real estate agent email database is delivered as a CSV file immediately after purchase. It's compatible with Excel, Google Sheets, and any CRM that supports CSV import.`,
    },
    {
      question: `How current is the ${state.name} real estate email database?`,
      answer: `The ${state.name} agent contact data is sourced from publicly available state licensing records and professional directories, and is regularly verified for accuracy.`,
    },
    {
      question: `Can I use the ${state.name} realtor email list for email marketing?`,
      answer: `Yes. The data is sourced from public professional directories and business listings. As the sender, you are responsible for complying with CAN-SPAM regulations for commercial email outreach.`,
    },
    {
      question: `Is this the complete list of real estate agents in ${state.name}?`,
      answer: `Our ${state.name} database includes ${agentCount.toLocaleString()}+ licensed real estate agents and realtors. The list is compiled from public state licensing boards and professional directories to provide the most comprehensive coverage available.`,
    },
  ]
}
