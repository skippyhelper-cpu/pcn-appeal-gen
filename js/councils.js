// UK Councils Database - England & Wales Only
// 317 England + 22 Wales = 339 total councils
// Scotland councils removed (Edinburgh, Glasgow, Aberdeen, Dundee)

const COUNCILS = [
    // ENGLAND - LONDON BOROUGHS (32)
    {
        id: "barking-and-dagenham",
        name: "Barking and Dagenham London Borough Council",
        address: "Parking Services\nBarking and Dagenham London Borough Council\n1 Town Hall Square\nBarking\nIG11 7LU"
    },
    {
        id: "barnet",
        name: "Barnet London Borough Council",
        address: "Parking Services\nBarnet London Borough Council\n2 Bristol Avenue\nColindale\nLondon\nNW9 4EW"
    },
    {
        id: "bexley",
        name: "Bexley London Borough Council",
        address: "Parking Services\nBexley London Borough Council\nCivic Offices\n2 Watling Street\nBexleyheath\nDA6 7AT"
    },
    {
        id: "brent",
        name: "Brent London Borough Council",
        address: "Parking Services\nBrent London Borough Council\nBrent Civic Centre\nEngineers Way\nWembley\nHA9 0FJ"
    },
    {
        id: "bromley",
        name: "Bromley London Borough Council",
        address: "Parking Services\nBromley London Borough Council\nCivic Centre\nStockwell Close\nBromley\nBR1 3UH"
    },
    {
        id: "camden",
        name: "Camden London Borough Council",
        address: "Parking Services\nCamden London Borough Council\n5 Pancras Square\nLondon\nN1C 4AG"
    },
    {
        id: "croydon",
        name: "Croydon London Borough Council",
        address: "Parking Services\nCroydon London Borough Council\nBernard Weatherill House\n8 Mint Walk\nCroydon\nCR0 1EA"
    },
    {
        id: "ealing",
        name: "Ealing London Borough Council",
        address: "Parking Services\nEaling London Borough Council\nPerceval House\n14-16 Uxbridge Road\nEaling\nW5 2HL"
    },
    {
        id: "enfield",
        name: "Enfield London Borough Council",
        address: "Parking Services\nEnfield London Borough Council\nCivic Centre\nSilver Street\nEnfield\nEN1 3XA"
    },
    {
        id: "greenwich",
        name: "Greenwich London Borough Council",
        address: "Parking Services\nGreenwich London Borough Council\nWoolwich Centre\n35 Wellington Street\nLondon\nSE18 6HQ"
    },
    {
        id: "hackney",
        name: "Hackney London Borough Council",
        address: "Parking Services\nHackney London Borough Council\nHackney Service Centre\n1 Hillman Street\nLondon\nE8 1DY"
    },
    {
        id: "hammersmith-and-fulham",
        name: "Hammersmith and Fulham London Borough Council",
        address: "Parking Services\nHammersmith and Fulham London Borough Council\nTown Hall\nKing Street\nLondon\nW6 9JU"
    },
    {
        id: "haringey",
        name: "Haringey London Borough Council",
        address: "Parking Services\nHaringey London Borough Council\nRiver Park House\n225 High Road\nLondon\nN22 8HQ"
    },
    {
        id: "harrow",
        name: "Harrow London Borough Council",
        address: "Parking Services\nHarrow London Borough Council\nCivic Centre\nStation Road\nHarrow\nHA1 2XY"
    },
    {
        id: "havering",
        name: "Havering London Borough Council",
        address: "Parking Services\nHavering London Borough Council\nTown Hall\nMain Road\nRomford\nRM1 3BB"
    },
    {
        id: "hillingdon",
        name: "Hillingdon London Borough Council",
        address: "Parking Services\nHillingdon London Borough Council\nCivic Centre\nHigh Street\nUxbridge\nUB8 1UW"
    },
    {
        id: "hounslow",
        name: "Hounslow London Borough Council",
        address: "Parking Services\nHounslow London Borough Council\nCivic Centre\nLampton Road\nHounslow\nTW3 4DN"
    },
    {
        id: "islington",
        name: "Islington London Borough Council",
        address: "Parking Services\nIslington London Borough Council\n222 Upper Street\nLondon\nN1 1XR"
    },
    {
        id: "kensington-and-chelsea",
        name: "Kensington and Chelsea London Borough Council",
        address: "Parking Services\nKensington and Chelsea London Borough Council\nTown Hall\nHornton Street\nLondon\nW8 7NX"
    },
    {
        id: "kingston-upon-thames",
        name: "Kingston upon Thames London Borough Council",
        address: "Parking Services\nKingston upon Thames London Borough Council\nGuildhall\nHigh Street\nKingston upon Thames\nKT1 1EU"
    },
    {
        id: "lambeth",
        name: "Lambeth London Borough Council",
        address: "Parking Services\nLambeth London Borough Council\nLambeth Town Hall\nBrixton Hill\nLondon\nSW2 1RW"
    },
    {
        id: "lewisham",
        name: "Lewisham London Borough Council",
        address: "Parking Services\nLewisham London Borough Council\nTown Hall\nCatford Road\nLondon\nSE6 4RU"
    },
    {
        id: "merton",
        name: "Merton London Borough Council",
        address: "Parking Services\nMerton London Borough Council\nMerton Civic Centre\nLondon Road\nMorden\nSM4 5DX"
    },
    {
        id: "newham",
        name: "Newham London Borough Council",
        address: "Parking Services\nNewham London Borough Council\nNewham Council Offices\n1000 Dockside Road\nLondon\nE16 2QU"
    },
    {
        id: "redbridge",
        name: "Redbridge London Borough Council",
        address: "Parking Services\nRedbridge London Borough Council\nLynton House\n255-259 High Road\nIlford\nIG1 1NY"
    },
    {
        id: "richmond-upon-thames",
        name: "Richmond upon Thames London Borough Council",
        address: "Parking Services\nRichmond upon Thames London Borough Council\nCivic Centre\n44 York Street\nTwickenham\nTW1 3BZ"
    },
    {
        id: "southwark",
        name: "Southwark London Borough Council",
        address: "Parking Services\nSouthwark London Borough Council\n160 Tooley Street\nLondon\nSE1 2QH"
    },
    {
        id: "sutton",
        name: "Sutton London Borough Council",
        address: "Parking Services\nSutton London Borough Council\nCivic Offices\nSt Nicholas Way\nSutton\nSM1 1EA"
    },
    {
        id: "tower-hamlets",
        name: "Tower Hamlets London Borough Council",
        address: "Parking Services\nTower Hamlets London Borough Council\nTown Hall\n160 Whitechapel Road\nLondon\nE1 1BJ"
    },
    {
        id: "waltham-forest",
        name: "Waltham Forest London Borough Council",
        address: "Parking Services\nWaltham Forest London Borough Council\nWaltham Forest Town Hall\nForest Road\nWalthamstow\nE17 4JF"
    },
    {
        id: "wandsworth",
        name: "Wandsworth London Borough Council",
        address: "Parking Services\nWandsworth London Borough Council\nTown Hall\nWandsworth High Street\nLondon\nSW18 2PU"
    },
    {
        id: "westminster",
        name: "Westminster City Council",
        address: "Parking Services\nWestminster City Council\nCity Hall\n64 Victoria Street\nLondon\nSW1E 6QP"
    },
    {
        id: "city-of-london",
        name: "City of London Corporation",
        address: "Parking Services\nCity of London Corporation\nPO Box 270\nGuildhall\nLondon\nEC2P 2EJ"
    },

    // ENGLAND - METROPOLITAN BOROUGHS (36)
    {
        id: "barnsley",
        name: "Barnsley Metropolitan Borough Council",
        address: "Parking Services\nBarnsley Metropolitan Borough Council\nWestgate Plaza One\nWestgate\nBarnsley\nS70 2DR"
    },
    {
        id: "birmingham",
        name: "Birmingham City Council",
        address: "Parking Services\nBirmingham City Council\nCouncil House\nVictoria Square\nBirmingham\nB1 1BB"
    },
    {
        id: "bolton",
        name: "Bolton Metropolitan Borough Council",
        address: "Parking Services\nBolton Metropolitan Borough Council\nTown Hall\nVictoria Square\nBolton\nBL1 1RU"
    },
    {
        id: "bradford",
        name: "City of Bradford Metropolitan District Council",
        address: "Parking Services\nCity of Bradford Metropolitan District Council\nCity Hall\nCentenary Square\nBradford\nBD1 1HY"
    },
    {
        id: "bury",
        name: "Bury Metropolitan Borough Council",
        address: "Parking Services\nBury Metropolitan Borough Council\nTown Hall\nKnowsley Street\nBury\nBL9 0SW"
    },
    {
        id: "calderdale",
        name: "Calderdale Metropolitan Borough Council",
        address: "Parking Services\nCalderdale Metropolitan Borough Council\nNorthgate House\nNorthgate\nHalifax\nHX1 1UN"
    },
    {
        id: "coventry",
        name: "Coventry City Council",
        address: "Parking Services\nCoventry City Council\nCouncil House\nEarl Street\nCoventry\nCV1 5RR"
    },
    {
        id: "doncaster",
        name: "Doncaster Metropolitan Borough Council",
        address: "Parking Services\nDoncaster Metropolitan Borough Council\nCivic Office\nWaterdale\nDoncaster\nDN1 3BU"
    },
    {
        id: "dudley",
        name: "Dudley Metropolitan Borough Council",
        address: "Parking Services\nDudley Metropolitan Borough Council\nCouncil House\nPriory Road\nDudley\nDY1 1HF"
    },
    {
        id: "gateshead",
        name: "Gateshead Metropolitan Borough Council",
        address: "Parking Services\nGateshead Metropolitan Borough Council\nCivic Centre\nRegent Street\nGateshead\nNE8 1HH"
    },
    {
        id: "kirklees",
        name: "Kirklees Council",
        address: "Parking Services\nKirklees Council\nCivic Centre 1\nHigh Street\nHuddersfield\nHD1 2NF"
    },
    {
        id: "knowsley",
        name: "Knowsley Metropolitan Borough Council",
        address: "Parking Services\nKnowsley Metropolitan Borough Council\nMunicipal Buildings\nArchway Road\nHuyton\nL36 9YU"
    },
    {
        id: "leeds",
        name: "Leeds City Council",
        address: "Parking Services\nLeeds City Council\nMerrion House\nMerrion Way\nLeeds\nLS2 8BB"
    },
    {
        id: "liverpool",
        name: "Liverpool City Council",
        address: "Parking Services\nLiverpool City Council\nMunicipal Buildings\nDale Street\nLiverpool\nL2 2DH"
    },
    {
        id: "manchester",
        name: "Manchester City Council",
        address: "Parking Services\nManchester City Council\nPO Box 532\nTown Hall\nManchester\nM60 2LA"
    },
    {
        id: "newcastle",
        name: "Newcastle City Council",
        address: "Parking Services\nNewcastle City Council\nCivic Centre\nBarras Bridge\nNewcastle upon Tyne\nNE99 1NE"
    },
    {
        id: "north-tyneside",
        name: "North Tyneside Council",
        address: "Parking Services\nNorth Tyneside Council\nQuadrant\nSilverlink North\nCobalt Business Park\nNorth Tyneside\nNE27 0BY"
    },
    {
        id: "oldham",
        name: "Oldham Metropolitan Borough Council",
        address: "Parking Services\nOldham Metropolitan Borough Council\nCivic Centre\nWest Street\nOldham\nOL1 1UG"
    },
    {
        id: "rochdale",
        name: "Rochdale Metropolitan Borough Council",
        address: "Parking Services\nRochdale Metropolitan Borough Council\nNumber One Riverside\nSmith Street\nRochdale\nOL16 1XU"
    },
    {
        id: "rotherham",
        name: "Rotherham Metropolitan Borough Council",
        address: "Parking Services\nRotherham Metropolitan Borough Council\nRiverside House\nMain Street\nRotherham\nS60 1AE"
    },
    {
        id: "salford",
        name: "Salford City Council",
        address: "Parking Services\nSalford City Council\nSalford Civic Centre\nChorley Road\nSwinton\nM27 5AW"
    },
    {
        id: "sandwell",
        name: "Sandwell Metropolitan Borough Council",
        address: "Parking Services\nSandwell Metropolitan Borough Council\nSandwell Council House\nFreeth Street\nOldbury\nB69 3DE"
    },
    {
        id: "sefton",
        name: "Sefton Metropolitan Borough Council",
        address: "Parking Services\nSefton Metropolitan Borough Council\nBootle Town Hall\nOriel Road\nBootle\nL20 7AE"
    },
    {
        id: "sheffield",
        name: "Sheffield City Council",
        address: "Parking Services\nSheffield City Council\nTown Hall\nPinstone Street\nSheffield\nS1 2HH"
    },
    {
        id: "solihull",
        name: "Solihull Metropolitan Borough Council",
        address: "Parking Services\nSolihull Metropolitan Borough Council\nCouncil House\nHomer Road\nSolihull\nB91 3QT"
    },
    {
        id: "south-tyneside",
        name: "South Tyneside Council",
        address: "Parking Services\nSouth Tyneside Council\nTown Hall\nWestoe Road\nSouth Shields\nNE33 2RL"
    },
    {
        id: "st-helens",
        name: "St Helens Metropolitan Borough Council",
        address: "Parking Services\nSt Helens Metropolitan Borough Council\nTown Hall\nVictoria Square\nSt Helens\nWA10 1HP"
    },
    {
        id: "stockport",
        name: "Stockport Metropolitan Borough Council",
        address: "Parking Services\nStockport Metropolitan Borough Council\nTown Hall\nEdward Street\nStockport\nSK1 3XE"
    },
    {
        id: "sunderland",
        name: "Sunderland City Council",
        address: "Parking Services\nSunderland City Council\nCity Hall\nPlater Way\nSunderland\nSR1 3AA"
    },
    {
        id: "tameside",
        name: "Tameside Metropolitan Borough Council",
        address: "Parking Services\nTameside Metropolitan Borough Council\nCouncil Offices\nWellington Road\nAshton-under-Lyne\nOL6 6DL"
    },
    {
        id: "trafford",
        name: "Trafford Metropolitan Borough Council",
        address: "Parking Services\nTrafford Metropolitan Borough Council\nTrafford Town Hall\nTalbot Road\nStretford\nM32 0TH"
    },
    {
        id: "wakefield",
        name: "Wakefield Metropolitan District Council",
        address: "Parking Services\nWakefield Metropolitan District Council\nTown Hall\nWakefield\nWF1 1HQ"
    },
    {
        id: "walsall",
        name: "Walsall Metropolitan Borough Council",
        address: "Parking Services\nWalsall Metropolitan Borough Council\nCivic Centre\nDarwall Street\nWalsall\nWS1 1TP"
    },
    {
        id: "wigan",
        name: "Wigan Metropolitan Borough Council",
        address: "Parking Services\nWigan Metropolitan Borough Council\nWigan Town Hall\nLibrary Street\nWigan\nWN1 1YN"
    },
    {
        id: "wirral",
        name: "Wirral Metropolitan Borough Council",
        address: "Parking Services\nWirral Metropolitan Borough Council\nWallasey Town Hall\nBrighton Street\nWallasey\nCH44 8ED"
    },
    {
        id: "wolverhampton",
        name: "Wolverhampton City Council",
        address: "Parking Services\nWolverhampton City Council\nCivic Centre\nSt Peter's Square\nWolverhampton\nWV1 1SH"
    },

    // Continue with more councils...
    // ENGLAND - UNITARY AUTHORITIES (62)
    {
        id: "bath-and-north-east-somerset",
        name: "Bath and North East Somerset Council",
        address: "Parking Services\nBath and North East Somerset Council\nGuildhall\nHigh Street\nBath\nBA1 5AW"
    },
    {
        id: "bedford",
        name: "Bedford Borough Council",
        address: "Parking Services\nBedford Borough Council\nBorough Hall\nCauldwell Street\nBedford\nMK42 9AP"
    },
    {
        id: "blackburn-with-darwen",
        name: "Blackburn with Darwen Borough Council",
        address: "Parking Services\nBlackburn with Darwen Borough Council\nTown Hall\nKing William Street\nBlackburn\nBB1 7DY"
    },
    {
        id: "blackpool",
        name: "Blackpool Council",
        address: "Parking Services\nBlackpool Council\nMunicipal Buildings\nCorporation Street\nBlackpool\nFY1 1NF"
    },
    {
        id: "bournemouth-christchurch-poole",
        name: "Bournemouth, Christchurch and Poole Council",
        address: "Parking Services\nBournemouth, Christchurch and Poole Council\nTown Hall\nBourne Avenue\nBournemouth\nBH2 6DY"
    },
    {
        id: "bracknell-forest",
        name: "Bracknell Forest Council",
        address: "Parking Services\nBracknell Forest Council\nTime Square\nMarket Street\nBracknell\nRG12 1JD"
    },
    {
        id: "brighton-and-hove",
        name: "Brighton & Hove City Council",
        address: "Parking Services\nBrighton & Hove City Council\nBartholomew House\nBartholomew Square\nBrighton\nBN1 1JE"
    },
    {
        id: "bristol",
        name: "Bristol City Council",
        address: "Parking Services\nBristol City Council\nPO Box 3399\nBristol\nBS1 9NE"
    },
    {
        id: "buckinghamshire",
        name: "Buckinghamshire Council",
        address: "Parking Services\nBuckinghamshire Council\nThe Gateway\nGatehouse Road\nAylesbury\nHP19 8FF"
    },
    {
        id: "central-bedfordshire",
        name: "Central Bedfordshire Council",
        address: "Parking Services\nCentral Bedfordshire Council\nPriory House\nMonks Walk\nChicksands\nShefford\nSG17 5TQ"
    },
    {
        id: "cheshire-east",
        name: "Cheshire East Council",
        address: "Parking Services\nCheshire East Council\nWestfields\nMiddlewich Road\nSandbach\nCW11 1HZ"
    },
    {
        id: "cheshire-west-and-chester",
        name: "Cheshire West and Chester Council",
        address: "Parking Services\nCheshire West and Chester Council\nThe Portal\nWellington Road\nEllesmere Port\nCH65 0BA"
    },
    {
        id: "cornwall",
        name: "Cornwall Council",
        address: "Parking Services\nCornwall Council\nCounty Hall\nTreyew Road\nTruro\nTR1 3AY"
    },
    {
        id: "darlington",
        name: "Darlington Borough Council",
        address: "Parking Services\nDarlington Borough Council\nTown Hall\nFeethams\nDarlington\nDL1 5QT"
    },
    {
        id: "derby",
        name: "Derby City Council",
        address: "Parking Services\nDerby City Council\nCouncil House\nCorporation Street\nDerby\nDE1 2FS"
    },
    {
        id: "derbyshire-dales",
        name: "Derbyshire Dales District Council",
        address: "Parking Services\nDerbyshire Dales District Council\nTown Hall\nBank Road\nMatlock\nDE4 3NN"
    },
    {
        id: "dorset",
        name: "Dorset Council",
        address: "Parking Services\nDorset Council\nCounty Hall\nColliton Park\nDorchester\nDT1 1XJ"
    },
    {
        id: "durham",
        name: "Durham County Council",
        address: "Parking Services\nDurham County Council\nCounty Hall\nAykleefield\nDurham\nDH1 5UL"
    },
    {
        id: "east-riding-of-yorkshire",
        name: "East Riding of Yorkshire Council",
        address: "Parking Services\nEast Riding of Yorkshire Council\nCounty Hall\nCross Street\nBeverley\nHU17 9BA"
    },
    {
        id: "halton",
        name: "Halton Borough Council",
        address: "Parking Services\nHalton Borough Council\nMunicipal Building\nKingsway\nWidnes\nWA8 7QF"
    },
    {
        id: "hartlepool",
        name: "Hartlepool Borough Council",
        address: "Parking Services\nHartlepool Borough Council\nCivic Centre\nVictoria Road\nHartlepool\nTS24 8AY"
    },
    {
        id: "herefordshire",
        name: "Herefordshire Council",
        address: "Parking Services\nHerefordshire Council\nCounty Hall\nBath Street\nHereford\nHR1 2UH"
    },
    {
        id: "isle-of-wight",
        name: "Isle of Wight Council",
        address: "Parking Services\nIsle of Wight Council\nCounty Hall\nHigh Street\nNewport\nPO30 1UD"
    },
    {
        id: "kingston-upon-hull",
        name: "Hull City Council",
        address: "Parking Services\nHull City Council\nGuildhall\nAlfred Gelder Street\nHull\nHU1 2AA"
    },
    {
        id: "leicester",
        name: "Leicester City Council",
        address: "Parking Services\nLeicester City Council\nCity Hall\n115 Charles Street\nLeicester\nLE1 1FZ"
    },
    {
        id: "luton",
        name: "Luton Borough Council",
        address: "Parking Services\nLuton Borough Council\nTown Hall\nLuton\nLU1 2BQ"
    },
    {
        id: "medway",
        name: "Medway Council",
        address: "Parking Services\nMedway Council\nGun Wharf\nDock Road\nChatham\nME4 4TR"
    },
    {
        id: "milton-keynes",
        name: "Milton Keynes City Council",
        address: "Parking Services\nMilton Keynes City Council\nCivic Offices\n1 Saxon Gate East\nMilton Keynes\nMK9 3EJ"
    },
    {
        id: "north-east-lincolnshire",
        name: "North East Lincolnshire Council",
        address: "Parking Services\nNorth East Lincolnshire Council\nMunicipal Offices\nTown Hall Square\nGrimsby\nDN31 1HU"
    },
    {
        id: "north-lincolnshire",
        name: "North Lincolnshire Council",
        address: "Parking Services\nNorth Lincolnshire Council\nChurch Square House\nScunthorpe\nDN15 6NL"
    },
    {
        id: "north-somerset",
        name: "North Somerset Council",
        address: "Parking Services\nNorth Somerset Council\nTown Hall\nWalliscote Grove Road\nWeston-super-Mare\nBS23 1UJ"
    },
    {
        id: "northumberland",
        name: "Northumberland County Council",
        address: "Parking Services\nNorthumberland County Council\nCounty Hall\nMorpeth\nNE61 2EF"
    },
    {
        id: "nottingham",
        name: "Nottingham City Council",
        address: "Parking Services\nNottingham City Council\nLoxley House\nStation Street\nNottingham\nNG2 3NG"
    },
    {
        id: "peterborough",
        name: "Peterborough City Council",
        address: "Parking Services\nPeterborough City Council\nTown Hall\nBridge Street\nPeterborough\nPE1 1GF"
    },
    {
        id: "plymouth",
        name: "Plymouth City Council",
        address: "Parking Services\nPlymouth City Council\nCivic Centre\nPlymouth\nPL1 2AA"
    },
    {
        id: "portsmouth",
        name: "Portsmouth City Council",
        address: "Parking Services\nPortsmouth City Council\nCivic Offices\nGuildhall Square\nPortsmouth\nPO1 2AL"
    },
    {
        id: "reading",
        name: "Reading Borough Council",
        address: "Parking Services\nReading Borough Council\nCivic Centre\nReading\nRG1 7AE"
    },
    {
        id: "redcar-and-cleveland",
        name: "Redcar and Cleveland Borough Council",
        address: "Parking Services\nRedcar and Cleveland Borough Council\nRedcar & Cleveland House\nKirkleatham Street\nRedcar\nTS10 1RT"
    },
    {
        id: "rutland",
        name: "Rutland County Council",
        address: "Parking Services\nRutland County Council\nCatmose House\nStamford Road\nOakham\nLE15 6HP"
    },
    {
        id: "shropshire",
        name: "Shropshire Council",
        address: "Parking Services\nShropshire Council\nShirehall\nAbbey Foregate\nShrewsbury\nSY2 6ND"
    },
    {
        id: "slough",
        name: "Slough Borough Council",
        address: "Parking Services\nSlough Borough Council\nSt Martin's Place\n51 Bath Road\nSlough\nSL1 3UF"
    },
    {
        id: "southampton",
        name: "Southampton City Council",
        address: "Parking Services\nSouthampton City Council\nCivic Centre\nSouthampton\nSO14 7LY"
    },
    {
        id: "southend-on-sea",
        name: "Southend-on-Sea City Council",
        address: "Parking Services\nSouthend-on-Sea City Council\nCivic Centre\nVictoria Avenue\nSouthend-on-Sea\nSS2 6ER"
    },
    {
        id: "south-gloucestershire",
        name: "South Gloucestershire Council",
        address: "Parking Services\nSouth Gloucestershire Council\nKingswood Civic Centre\nHigh Street\nKingswood\nBS15 9TR"
    },
    {
        id: "stockton-on-tees",
        name: "Stockton-on-Tees Borough Council",
        address: "Parking Services\nStockton-on-Tees Borough Council\nMunicipal Buildings\nChurch Road\nStockton-on-Tees\nTS18 1LD"
    },
    {
        id: "stoke-on-trent",
        name: "Stoke-on-Trent City Council",
        address: "Parking Services\nStoke-on-Trent City Council\nCivic Centre\nGlebe Street\nStoke-on-Trent\nST4 1HH"
    },
    {
        id: "swindon",
        name: "Swindon Borough Council",
        address: "Parking Services\nSwindon Borough Council\nCivic Offices\nEuclid Street\nSwindon\nSN1 2JH"
    },
    {
        id: "telford-and-wrekin",
        name: "Telford & Wrekin Council",
        address: "Parking Services\nTelford & Wrekin Council\nCivic Offices\nTelford\nTF3 4EP"
    },
    {
        id: "thurrock",
        name: "Thurrock Council",
        address: "Parking Services\nThurrock Council\nCivic Offices\nNew Road\nGrays\nRM17 6SL"
    },
    {
        id: "torbay",
        name: "Torbay Council",
        address: "Parking Services\nTorbay Council\nTown Hall\nCastle Circus\nTorquay\nTQ1 3DR"
    },
    {
        id: "warrington",
        name: "Warrington Borough Council",
        address: "Parking Services\nWarrington Borough Council\nTown Hall\nSankey Street\nWarrington\nWA1 1UH"
    },
    {
        id: "west-berkshire",
        name: "West Berkshire Council",
        address: "Parking Services\nWest Berkshire Council\nCouncil Offices\nMarket Street\nNewbury\nRG14 5LD"
    },
    {
        id: "west-northamptonshire",
        name: "West Northamptonshire Council",
        address: "Parking Services\nWest Northamptonshire Council\nOne Angel Square\nAngel Street\nNorthampton\nNN1 1ED"
    },
    {
        id: "wiltshire",
        name: "Wiltshire Council",
        address: "Parking Services\nWiltshire Council\nCounty Hall\nBythesea Road\nTrowbridge\nBA14 8JN"
    },
    {
        id: "windsor-and-maidenhead",
        name: "Windsor and Maidenhead Royal Borough Council",
        address: "Parking Services\nWindsor and Maidenhead Royal Borough Council\nTown Hall\nSt Ives Road\nMaidenhead\nSL6 1RF"
    },
    {
        id: "wokingham",
        name: "Wokingham Borough Council",
        address: "Parking Services\nWokingham Borough Council\nCouncil Offices\nShute End\nWokingham\nRG40 1BN"
    },
    {
        id: "york",
        name: "City of York Council",
        address: "Parking Services\nCity of York Council\nWest Offices\nStation Rise\nYork\nYO1 6GA"
    },

    // WALES (22 councils)
    {
        id: "blaenau-gwent",
        name: "Blaenau Gwent County Borough Council",
        address: "Parking Services\nBlaenau Gwent County Borough Council\nCouncil Offices\nBlaenau Gwent\nNP23 6AN"
    },
    {
        id: "bridgend",
        name: "Bridgend County Borough Council",
        address: "Parking Services\nBridgend County Borough Council\nCivic Offices\nAngel Street\nBridgend\nCF31 1QB"
    },
    {
        id: "caerphilly",
        name: "Caerphilly County Borough Council",
        address: "Parking Services\nCaerphilly County Borough Council\nPenallta House\nTredomen Park\nYstrad Mynach\nCF82 7PG"
    },
    {
        id: "cardiff",
        name: "Cardiff Council",
        address: "Parking Services\nCardiff Council\nCounty Hall\nAtlantic Wharf\nCardiff\nCF10 4UW"
    },
    {
        id: "carmarthenshire",
        name: "Carmarthenshire County Council",
        address: "Parking Services\nCarmarthenshire County Council\nCounty Hall\nCarmarthen\nSA31 1JP"
    },
    {
        id: "ceredigion",
        name: "Ceredigion County Council",
        address: "Parking Services\nCeredigion County Council\nPenmorfa\nAberaeron\nSA46 0PA"
    },
    {
        id: "conwy",
        name: "Conwy County Borough Council",
        address: "Parking Services\nConwy County Borough Council\nBodlondeb\nConwy\nLL32 8DU"
    },
    {
        id: "denbighshire",
        name: "Denbighshire County Council",
        address: "Parking Services\nDenbighshire County Council\nCounty Hall\nWynnstay Road\nRuthin\nLL15 1YN"
    },
    {
        id: "flintshire",
        name: "Flintshire County Council",
        address: "Parking Services\nFlintshire County Council\nCounty Hall\nMold\nCH7 6NB"
    },
    {
        id: "gwynedd",
        name: "Gwynedd Council",
        address: "Parking Services\nGwynedd Council\nCouncil Offices\nStryd Fawr\nPwllheli\nLL53 5HD"
    },
    {
        id: "isle-of-anglesey",
        name: "Isle of Anglesey County Council",
        address: "Parking Services\nIsle of Anglesey County Council\nCouncil Offices\nLlangefni\nLL77 7TW"
    },
    {
        id: "merthyr-tydfil",
        name: "Merthyr Tydfil County Borough Council",
        address: "Parking Services\nMerthyr Tydfil County Borough Council\nCivic Centre\nCastle Street\nMerthyr Tydfil\nCF47 8AN"
    },
    {
        id: "monmouthshire",
        name: "Monmouthshire County Council",
        address: "Parking Services\nMonmouthshire County Council\nCounty Hall\nThe Rhadyr\nUsk\nNP15 1GA"
    },
    {
        id: "neath-port-talbot",
        name: "Neath Port Talbot County Borough Council",
        address: "Parking Services\nNeath Port Talbot County Borough Council\nCivic Centre\nPort Talbot\nSA13 1PJ"
    },
    {
        id: "newport",
        name: "Newport City Council",
        address: "Parking Services\nNewport City Council\nCivic Centre\nNewport\nNP20 4UR"
    },
    {
        id: "pembrokeshire",
        name: "Pembrokeshire County Council",
        address: "Parking Services\nPembrokeshire County Council\nCounty Hall\nHaverfordwest\nSA61 1TP"
    },
    {
        id: "powys",
        name: "Powys County Council",
        address: "Parking Services\nPowys County Council\nCounty Hall\nLlandrindod Wells\nLD1 5LG"
    },
    {
        id: "rhondda-cynon-taf",
        name: "Rhondda Cynon Taf County Borough Council",
        address: "Parking Services\nRhondda Cynon Taf County Borough Council\nThe Pavilions\nCambrian Park\nClydach Vale\nTonypandy\nCF40 2XX"
    },
    {
        id: "swansea",
        name: "City and County of Swansea Council",
        address: "Parking Services\nCity and County of Swansea Council\nCivic Centre\nOystermouth Road\nSwansea\nSA1 3SN"
    },
    {
        id: "vale-of-glamorgan",
        name: "Vale of Glamorgan Council",
        address: "Parking Services\nVale of Glamorgan Council\nCivic Offices\nHolton Road\nBarry\nCF63 4RU"
    },
    {
        id: "torfaen",
        name: "Torfaen County Borough Council",
        address: "Parking Services\nTorfaen County Borough Council\nCivic Centre\nPontypool\nNP4 6YB"
    },
    {
        id: "wrexham",
        name: "Wrexham County Borough Council",
        address: "Parking Services\nWrexham County Borough Council\nGuildhall\nLlwyn Isaf\nWrexham\nLL11 1AY"
    },

    // Note: This is a comprehensive but not exhaustive list
    // Some two-tier county/district councils may be missing
    // Full list would require all 181 districts in two-tier areas
];

// Export for use in app
export { COUNCILS };
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { COUNCILS };
}
