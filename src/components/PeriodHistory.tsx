import type { ReactNode } from 'react'

function Source({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4">({children})</a>
}

const history: Record<number, { title: string; content: ReactNode }> = {
  1888: {
    title: 'Founding a place of dignity',
    content: <>
      <p>After the Civil War, Black Atlantans built institutions and communities while confronting racial discrimination. Formerly enslaved Black Atlantans founded South-View in 1886 in response to the treatment of Black families at segregated burial grounds. <Source href="https://www.georgiahistory.com/ghmi_marker_updated/south-view-cemetery/">Georgia Historical Society</Source></p>
      <p>The cemetery’s history describes mourners being made to use back gates and cross swampy ground. It says nine Black businessmen petitioned for a charter in February 1886, including Jacob McKinley, George W. Graham, Robert Grant, Charles H. Morgan, John Render, and Albert Watts. The charter was granted in April. Georgia Tech identifies the six named men as charter signers. <Source href="https://southviewcemetery.com/our-history/">South-View Cemetery Association</Source>; <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source></p>
      <p>A cemetery history tour identifies another catalyst: the poor conditions at the 1885 burial of Sterling Watts, father of co-founder Albert Watts, at segregated Westview Cemetery. <Source href="https://static1.squarespace.com/static/5e6fd72f1f7dae1c021471b9/t/62e2e28cc36da05fea948c4b/1659036304775/Civil%2BRights%2BCemetery%2BTour.pdf">Civil Rights Cemetery Tour</Source></p>
      <p>According to the account shared by Winifred Watts Hemphill, a descendant of Albert Watts and South-View’s president, a Black baby had already been buried on the farmland. White neighbors regarded the land as “tainted,” and Hemphill says this helped the founders secure their charter. This is an account of how racial prejudice shaped the cemetery’s beginnings, not a judgment about the child or the land. <Source href="https://www.cbsnews.com/atlanta/news/south-view-cemetery-ensures-over-a-century-of-black-atlantas-history-isnt-forgotten/">CBS Atlanta</Source>; <Source href="https://saportareport.com/south-river-forest-vision-expands-with-a-look-at-historic-south-view-cemetery/columnists/johnruch/">SaportaReport</Source></p>
      <p>Support came from across the community: workers, business owners, women shareholders, and benevolent organizations all helped sustain the cemetery. <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source></p>
    </>,
  },
  1902: {
    title: 'A growing city under segregation',
    content: <>
      <p>By 1900, Atlanta’s Black population exceeded 35,000. Black residents built communities around churches, schools, colleges, and businesses even as segregation restricted where they could live and participate in public life. <Source href="https://www.georgiaencyclopedia.org/articles/counties-cities-neighborhoods/atlanta/">New Georgia Encyclopedia</Source></p>
      <p>Jim Crow shaped everyday life and burial practices. Georgia’s segregated public spaces included cemeteries, while South-View continued as a Black-controlled place for families to bury and remember their loved ones. <Source href="https://www.georgiaencyclopedia.org/articles/history-archaeology/segregation/">New Georgia Encyclopedia</Source>; <Source href="https://www.georgiahistory.com/ghmi_marker_updated/south-view-cemetery/">Georgia Historical Society</Source></p>
      <p>Community members also challenged segregation: between 1900 and 1906, Black Atlantans and residents of other Georgia cities organized streetcar boycotts. <Source href="https://www.georgiaencyclopedia.org/articles/history-archaeology/segregation/">New Georgia Encyclopedia</Source></p>
    </>,
  },
  1909: {
    title: 'Violence, resistance, and remembrance',
    content: <>
      <p>In September 1906, white mobs attacked Black Atlantans and Black-owned businesses after newspapers circulated unsubstantiated allegations. Estimates of Black deaths vary; the New Georgia Encyclopedia gives a range of 25 to 40. <Source href="https://www.georgiaencyclopedia.org/articles/history-archaeology/atlanta-race-massacre-of-1906/">New Georgia Encyclopedia</Source></p>
      <p>The violence damaged the Black community and economy and was followed by further restrictions on Black voting rights. Some victims of the massacre are buried at South-View, connecting the cemetery directly to this history. <Source href="https://www.georgiaencyclopedia.org/articles/history-archaeology/atlanta-race-massacre-of-1906/">New Georgia Encyclopedia</Source>; <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source></p>
      <p>Despite violence and segregation, Black Atlantans continued to invest in institutions of their own. South-View’s shareholders included working people, business owners, and community organizations. <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source></p>
    </>,
  },
  1944: {
    title: 'A community through war and migration',
    content: <>
      <p>During the Great Migration, Black southerners moved in search of opportunity and relief from racial oppression. Atlanta also drew Black workers, while segregation and discrimination continued to shape life in Georgia. <Source href="https://www.georgiaencyclopedia.org/articles/history-archaeology/great-migration/">New Georgia Encyclopedia</Source></p>
      <p>South-View became a record of many lives, including those of military veterans, teachers, ministers, tradespeople, and civil rights advocates. Its varied monuments reflect families from different economic backgrounds. <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source>; <Source href="https://www.georgiahistory.com/ghmi_marker_updated/south-view-cemetery/">Georgia Historical Society</Source></p>
      <p>Henry O. Flipper, born into slavery and the first Black graduate of West Point, died in 1940 and was buried at South-View. His later reburial and the review of his military record came decades afterward. <Source href="https://www.archives.gov/exhibits/featured-documents/henry-flipper">National Archives</Source>; <Source href="https://www.battlefields.org/learn/biographies/henry-ossian-flipper">American Battlefield Trust</Source></p>
    </>,
  },
  1957: {
    title: 'Expansion amid the civil rights struggle',
    content: <>
      <p>In January 1957, the Rev. William Holmes Borders and other Black ministers challenged segregation on Atlanta’s buses, initiating a legal fight. A federal court ruled in their favor in 1959. <Source href="https://www.georgiaencyclopedia.org/articles/history-archaeology/bus-desegregation-in-atlanta/">New Georgia Encyclopedia</Source></p>
      <p>Atlanta’s Black churches provided meeting places and leadership for political organizing. The Southern Christian Leadership Conference was formed at Ebenezer Baptist Church in 1957. <Source href="https://www.georgiaencyclopedia.org/articles/government-politics/the-black-church-in-atlanta-politics/">New Georgia Encyclopedia</Source>; <Source href="https://parkplanning.nps.gov/showFile.cfm?projectID=83094&sfid=537262">National Park Service</Source></p>
      <p>South-View’s burials document the breadth of Black Atlanta, including veterans, educators, ministers, and business owners. Its grounds continued to grow as the city changed around it. <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source></p>
    </>,
  },
  1977: {
    title: 'Civil rights and a continuing legacy',
    content: <>
      <p>In 1960, Atlanta University Center students began coordinated demonstrations against segregation. Their sit-ins and boycotts helped bring pressure for the desegregation of public accommodations. <Source href="https://home.nps.gov/places/georgia-atlanta-university-center-historic-district.htm">National Park Service</Source></p>
      <p>Martin Luther King Jr. was initially buried at South-View after his assassination in 1968; his crypt was moved to the King Center in 1970. His parents, Martin Luther King Sr. and Alberta Williams King, are buried at South-View. <Source href="https://home.nps.gov/malu/a-strong-and-enduring-acknowledgment.htm">National Park Service</Source>; <Source href="https://www.georgiahistory.com/ghmi_marker_updated/south-view-cemetery/">Georgia Historical Society</Source></p>
      <p>In 1977, Albert H. Watts, grandson of co-founder Albert Watts, became president-treasurer after beginning his cemetery career as a grave digger. He led the association until his death in 2001. <Source href="https://southviewcemetery.com/our-history/">South-View Cemetery Association</Source></p>
      <p>Flipper was reburied in Thomasville in 1978. The Army had granted him an honorable discharge in 1976, and President Clinton pardoned him in 1999. Educator Benjamin E. Mays was buried at South-View in 1984 and later reinterred at Morehouse College. <Source href="https://www.archives.gov/exhibits/featured-documents/henry-flipper">National Archives</Source>; <Source href="https://www.battlefields.org/learn/biographies/henry-ossian-flipper">American Battlefield Trust</Source>; <Source href="https://leading-edge.iac.gatech.edu/building-memories/southview-cemetery/">Georgia Tech</Source></p>
      <p>Today, South-View remains an active cemetery with more than 100 acres. <Source href="https://www.georgiahistory.com/ghmi_marker_updated/south-view-cemetery/">Georgia Historical Society</Source></p>
    </>,
  },
}

export default function PeriodHistory({ year, landNote }: { year: number; landNote: string }) {
  const period = history[year]
  if (!period) return null
  return <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
    <h3 className="font-semibold text-foreground">{period.title}</h3>
    {period.content}
    <div className="border-t pt-4">
      <h3 className="mb-1 font-medium text-foreground">Land at this point in the timeline</h3>
      <p>{landNote}</p>
      <p className="mt-2 text-xs">Land note based on the project’s interpretation of historical plats and deeds; the source images are not included in this project.</p>
    </div>
  </div>
}
