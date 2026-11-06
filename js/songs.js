// Vaste categorieën. Elk nummer is "Artiest — Titel".
// Het audiofragment wordt in de browser opgezocht via de iTunes-API,
// dus je kunt hier vrij nummers toevoegen of weghalen.
const CATEGORIES = [
  {
    id: "nl",
    name: "Nederlandstalig",
    emoji: "🇳🇱",
    color: "#ff7a1a",
    songs: `
André Hazes — Zij gelooft in mij
Marco Borsato — Dromen zijn bedrog
Marco Borsato — Rood
Frans Bauer — Heb je even voor mij
Doe Maar — Is dit alles
Doe Maar — De bom
Guus Meeuwis — Het is een nacht (Levensecht)
Guus Meeuwis — Brabant
BLØF — Zoutelande
BLØF — Aan de kust
Acda en De Munnik — Het regent zonnestralen
Volumia! — Afscheid
De Dijk — Als het golft
Snollebollekes — Links rechts
Kenny B — Parijs
Suzan & Freek — Als het avond is
Nielson — Beauty & de brains
Lil' Kleine & Ronnie Flex — Drank & Drugs
Boef — Habiba
Claudia de Breij — Mag ik dan bij jou
Jan Smit — Als de morgen is gekomen
Rob de Nijs — Malle Babbe
Herman van Veen — Opzij
Ramses Shaffy — Laat me
Normaal — Oerend hard
Van Dik Hout — Stil in mij
Clouseau — Daar gaat ze
K3 — Oya lélé
André van Duin — Er staat een paard in de gang
Wim Sonneveld — Het dorp
3JS — Wat is dromen
Snelle — Smoorverliefd
Jeroen van der Boom — Jij bent zo
Gers Pardoel — Ik neem je mee
Lange Frans & Baas B — Het land van
Ali B & Marco Borsato — Wat zou je doen
Paul de Leeuw — Ik wil niet dat je liegt
`,
  },
  {
    id: "80s",
    name: "Jaren 80",
    emoji: "📼",
    color: "#ff4fa3",
    songs: `
Michael Jackson — Billie Jean
Michael Jackson — Beat It
Madonna — Like a Prayer
Madonna — Like a Virgin
a-ha — Take On Me
Queen — Another One Bites the Dust
Bon Jovi — Livin' on a Prayer
Toto — Africa
Journey — Don't Stop Believin'
Cyndi Lauper — Girls Just Want to Have Fun
Whitney Houston — I Wanna Dance with Somebody (Who Loves Me)
Wham! — Wake Me Up Before You Go-Go
Duran Duran — Hungry Like the Wolf
Tears for Fears — Everybody Wants to Rule the World
Europe — The Final Countdown
Rick Astley — Never Gonna Give You Up
Prince — Purple Rain
Kim Wilde — Kids in America
Dire Straits — Money for Nothing
Simple Minds — Don't You (Forget About Me)
The Police — Every Breath You Take
Eurythmics — Sweet Dreams (Are Made of This)
Survivor — Eye of the Tiger
Kenny Loggins — Footloose
Irene Cara — Flashdance... What a Feeling
Lionel Richie — All Night Long (All Night)
Phil Collins — In the Air Tonight
U2 — With or Without You
Guns N' Roses — Sweet Child o' Mine
Def Leppard — Pour Some Sugar on Me
Soft Cell — Tainted Love
Dexys Midnight Runners — Come On Eileen
Pet Shop Boys — West End Girls
Bananarama — Venus
Belinda Carlisle — Heaven Is a Place on Earth
George Michael — Faith
Huey Lewis & The News — The Power of Love
`,
  },
  {
    id: "90s",
    name: "Jaren 90",
    emoji: "💿",
    color: "#38bdf8",
    songs: `
Nirvana — Smells Like Teen Spirit
Spice Girls — Wannabe
Backstreet Boys — I Want It That Way
Britney Spears — ...Baby One More Time
Oasis — Wonderwall
R.E.M. — Losing My Religion
TLC — No Scrubs
Coolio — Gangsta's Paradise
Haddaway — What Is Love
Vengaboys — Boom, Boom, Boom, Boom!!
Aqua — Barbie Girl
Celine Dion — My Heart Will Go On
Alanis Morissette — Ironic
Whitney Houston — I Will Always Love You
2 Unlimited — No Limit
Snap! — Rhythm Is a Dancer
Ace of Base — All That She Wants
Red Hot Chili Peppers — Under the Bridge
No Doubt — Don't Speak
Eagle-Eye Cherry — Save Tonight
Fugees — Killing Me Softly With His Song
Will Smith — Men in Black
Los Del Rio — Macarena
Shania Twain — Man! I Feel Like a Woman!
The Cranberries — Zombie
Blur — Song 2
Radiohead — Creep
Eiffel 65 — Blue (Da Ba Dee)
Ricky Martin — Livin' la Vida Loca
Lou Bega — Mambo No. 5 (A Little Bit of...)
Savage Garden — Truly Madly Deeply
The Verve — Bitter Sweet Symphony
Robbie Williams — Angels
Hanson — MMMBop
Natalie Imbruglia — Torn
Chumbawamba — Tubthumping
`,
  },
  {
    id: "00s",
    name: "Jaren 00",
    emoji: "📱",
    color: "#a3e635",
    songs: `
Outkast — Hey Ya!
Beyoncé — Crazy in Love
Eminem — Without Me
Eminem — Lose Yourself
The Killers — Mr. Brightside
Shakira — Hips Don't Lie
Britney Spears — Toxic
Rihanna — Umbrella
Gnarls Barkley — Crazy
Coldplay — Viva la Vida
Coldplay — Clocks
Lady Gaga — Poker Face
Lady Gaga — Bad Romance
Black Eyed Peas — I Gotta Feeling
Nelly Furtado — Promiscuous
Amy Winehouse — Rehab
Kelly Clarkson — Since U Been Gone
Avril Lavigne — Complicated
Linkin Park — In the End
Kanye West — Gold Digger
Daft Punk — One More Time
Justin Timberlake — SexyBack
Katy Perry — I Kissed a Girl
Leona Lewis — Bleeding Love
James Blunt — You're Beautiful
Nickelback — How You Remind Me
Kylie Minogue — Can't Get You Out of My Head
Las Ketchup — The Ketchup Song (Aserejé)
Shaggy — It Wasn't Me
Snow Patrol — Chasing Cars
Green Day — Boulevard of Broken Dreams
The White Stripes — Seven Nation Army
Alicia Keys — Fallin'
Destiny's Child — Survivor
Arctic Monkeys — I Bet You Look Good on the Dancefloor
`,
  },
  {
    id: "10s",
    name: "Jaren 10",
    emoji: "🎧",
    color: "#f472b6",
    songs: `
Adele — Rolling in the Deep
Adele — Someone Like You
Ed Sheeran — Shape of You
Mark Ronson & Bruno Mars — Uptown Funk
Pharrell Williams — Happy
Gotye — Somebody That I Used to Know
Carly Rae Jepsen — Call Me Maybe
PSY — Gangnam Style
Avicii — Wake Me Up
Luis Fonsi & Daddy Yankee — Despacito
Taylor Swift — Shake It Off
Bruno Mars — Locked Out of Heaven
Daft Punk — Get Lucky
Lorde — Royals
Imagine Dragons — Radioactive
Justin Bieber — Sorry
The Weeknd — Can't Feel My Face
Katy Perry — Roar
Sia — Chandelier
Rihanna — We Found Love
LMFAO — Party Rock Anthem
Maroon 5 — Moves Like Jagger
Clean Bandit — Rather Be
Hozier — Take Me to Church
OneRepublic — Counting Stars
Major Lazer & DJ Snake — Lean On
Lady Gaga & Bradley Cooper — Shallow
Billie Eilish — bad guy
Lil Nas X — Old Town Road
Drake — Hotline Bling
Dua Lipa — New Rules
Camila Cabello — Havana
Foster the People — Pumped Up Kicks
Ellie Goulding — Burn
Calvin Harris — Summer
`,
  },
  {
    id: "now",
    name: "Hits van nu",
    emoji: "🔥",
    color: "#facc15",
    songs: `
The Weeknd — Blinding Lights
Dua Lipa — Levitating
Harry Styles — As It Was
Harry Styles — Watermelon Sugar
Miley Cyrus — Flowers
Olivia Rodrigo — drivers license
Olivia Rodrigo — good 4 u
Glass Animals — Heat Waves
Måneskin — Beggin'
Sabrina Carpenter — Espresso
Sabrina Carpenter — Please Please Please
Chappell Roan — Good Luck, Babe!
Billie Eilish — BIRDS OF A FEATHER
Lady Gaga & Bruno Mars — Die With A Smile
Taylor Swift — Anti-Hero
Benson Boone — Beautiful Things
Teddy Swims — Lose Control
Hozier — Too Sweet
Doja Cat — Say So
Kenya Grace — Strangers
Tate McRae — greedy
Noah Kahan — Stick Season
SZA — Kill Bill
ROSÉ & Bruno Mars — APT.
Ed Sheeran — Bad Habits
Elton John & Dua Lipa — Cold Heart
The Kid LAROI & Justin Bieber — STAY
Shaboozey — A Bar Song (Tipsy)
Gracie Abrams — That's So True
Alex Warren — Ordinary
Myles Smith — Stargazing
Djo — End of Beginning
Kendrick Lamar — Not Like Us
Tommy Richman — MILLION DOLLAR BABY
RAYE — Escapism.
`,
  },
  {
    id: "rock",
    name: "Rock klassiekers",
    emoji: "🎸",
    color: "#ef4444",
    songs: `
Queen — Bohemian Rhapsody
Queen — Don't Stop Me Now
Led Zeppelin — Whole Lotta Love
AC/DC — Highway to Hell
AC/DC — Back in Black
Deep Purple — Smoke on the Water
The Rolling Stones — Paint It Black
The Beatles — Hey Jude
The Beatles — Here Comes the Sun
Eagles — Hotel California
Lynyrd Skynyrd — Sweet Home Alabama
Pink Floyd — Another Brick in the Wall, Pt. 2
Golden Earring — Radar Love
Guns N' Roses — Welcome to the Jungle
Metallica — Enter Sandman
Metallica — Nothing Else Matters
Bon Jovi — It's My Life
Aerosmith — Dream On
Kiss — I Was Made for Lovin' You
The Who — Baba O'Riley
Fleetwood Mac — Go Your Own Way
Dire Straits — Sultans of Swing
Bruce Springsteen — Born in the U.S.A.
David Bowie — Heroes
The Doors — Light My Fire
Creedence Clearwater Revival — Fortunate Son
Toto — Hold the Line
Boston — More Than a Feeling
Van Halen — Jump
Foo Fighters — Everlong
Red Hot Chili Peppers — Californication
Muse — Uprising
The Clash — Should I Stay or Should I Go
Scorpions — Wind of Change
Status Quo — Rockin' All Over the World
`,
  },
  {
    id: "hiphop",
    name: "Hip-hop & R&B",
    emoji: "🎤",
    color: "#c084fc",
    songs: `
Dr. Dre — Still D.R.E.
2Pac — California Love
The Notorious B.I.G. — Juicy
Eminem — The Real Slim Shady
50 Cent — In da Club
Snoop Dogg — Drop It Like It's Hot
Outkast — Ms. Jackson
JAY-Z & Alicia Keys — Empire State of Mind
Kanye West — Stronger
Nelly — Hot in Herre
Missy Elliott — Get Ur Freak On
Usher — Yeah!
Beyoncé — Single Ladies (Put a Ring on It)
Drake — God's Plan
Kendrick Lamar — HUMBLE.
Travis Scott — SICKO MODE
Cardi B — Bodak Yellow
Post Malone — rockstar
Juice WRLD — Lucid Dreams
Run-D.M.C. & Aerosmith — Walk This Way
House of Pain — Jump Around
Salt-N-Pepa — Push It
Cypress Hill — Insane in the Brain
Lauryn Hill — Doo Wop (That Thing)
Destiny's Child — Bills, Bills, Bills
The Weeknd — Starboy
Lil Wayne — Lollipop
Warren G — Regulate
Coolio — Gangsta's Paradise
Black Eyed Peas — Where Is the Love?
Nelly & Kelly Rowland — Dilemma
Akon — Smack That
`,
  },
  {
    id: "dance",
    name: "Dance & EDM",
    emoji: "🪩",
    color: "#22d3ee",
    songs: `
Avicii — Levels
Swedish House Mafia — Don't You Worry Child
David Guetta — Titanium
Calvin Harris — Feel So Close
Martin Garrix — Animals
Tiësto — The Business
Armin van Buuren — This Is What It Feels Like
Afrojack — Take Over Control
Darude — Sandstorm
Alice Deejay — Better Off Alone
Robin Schulz — Prayer in C
Kygo — Firestone
Faithless — Insomnia
Stardust — Music Sounds Better With You
Daft Punk — Around the World
Fatboy Slim — Praise You
The Prodigy — Firestarter
Basshunter — Boten Anna
Eric Prydz — Call on Me
Bob Sinclar — Love Generation
Benny Benassi — Satisfaction
Mr. Probz — Waves
Lost Frequencies — Are You With Me
Duke Dumont — Ocean Drive
Disclosure — Latch
Zedd — Clarity
DJ Snake & Lil Jon — Turn Down for What
The Chainsmokers — Closer
Fred again.. — Delilah (pull me out of this)
Cascada — Everytime We Touch
Sash! — Ecuador
ATB — 9 PM (Till I Come)
Gigi D'Agostino — L'Amour Toujours
Peggy Gou — (It Goes Like) Nanana
`,
  },
];
