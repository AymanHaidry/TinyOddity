/* =========================================================
   TINYODDITY v2.0 — ITEM DATABASE
   Cosmic artifacts with 3D model references
   ========================================================= */

const ITEMS_DB = {
  version: "2.0.0",
  categories: [
    { id: "buildings", name: "Buildings", icon: "bi-building", color: "#FFB76B", desc: "Structures that defy time and gravity" },
    { id: "oddities", name: "Oddities", icon: "bi-bullseye", color: "#C7FF75", desc: "Objects that should not exist, yet do" },
    { id: "media", name: "Media", icon: "bi-disc", color: "#FF5AC8", desc: "Lost transmissions and forgotten formats" },
    { id: "tinyhumans", name: "TinyHumans", icon: "bi-person", color: "#65E9FF", desc: "Beings that inhabit the in-between" },
    { id: "worlds", name: "Worlds", icon: "bi-globe", color: "#B46CFF", desc: "Places orbiting distant suns" },
    { id: "objects", name: "Objects", icon: "bi-box-seam", color: "#7B7CFF", desc: "Tools, artifacts, and impossible things" }
  ],
  rarities: [
    { id: "common", name: "Common", color: "#a7afc1", prob: 0 },
    { id: "uncommon", name: "Uncommon", color: "#65e9ff", prob: 0 },
    { id: "rare", name: "Rare", color: "#7b7cff", prob: 0 },
    { id: "epic", name: "Epic", color: "#b46cff", prob: 0 },
    { id: "legendary", name: "Legendary", color: "#ffb76b", prob: 0 },
    { id: "mythic", name: "Mythic", color: "#ff5ac8", prob: 0 },
    { id: "odd", name: "Odd", color: "#c7ff75", prob: 0 },
    { id: "unknown", name: "???", color: "#ffffff", prob: 0 }
  ],
  items: [
    // BUILDINGS
    { id: "b1", name: "The Louvre", category: "buildings", rarity: "rare", origin: "Paris, France", year: "1793", description: "The world's largest art museum and a historic monument in Paris.", lore: "It once housed kings. Now it houses mysteries.", icon: "bi-building", has3D: true, modelUrl: "./models/louvre.glb", thumbnail: "./thumbnails/louvre.jpg" },
    { id: "b2", name: "Taj Mahal", category: "buildings", rarity: "epic", origin: "Agra, India", year: "1653", description: "An ivory-white marble mausoleum on the right bank of the Yamuna river.", lore: "Built from grief. Standing as love.", icon: "bi-building", has3D: true, modelUrl: "./models/taj_mahal.glb", thumbnail: "./thumbnails/taj_mahal.jpg" },
    { id: "b3", name: "Taipei 101", category: "buildings", rarity: "uncommon", origin: "Taipei, Taiwan", year: "2004", description: "A landmark supertall skyscraper in Taipei, Taiwan.", lore: "It sways in typhoons. It never falls.", icon: "bi-building" },
    { id: "b4", name: "Burj Khalifa", category: "buildings", rarity: "epic", origin: "Dubai, UAE", year: "2010", description: "The tallest structure and building in the world since 2009.", lore: "They built it to touch the sky. No one expected it to reach so far.", icon: "bi-building" },
    { id: "b5", name: "Sagrada Família", category: "buildings", rarity: "legendary", origin: "Barcelona, Spain", year: "1882–present", description: "A large unfinished Roman Catholic minor basilica in Barcelona.", lore: "Gaudí knew he would not see it finished. He built it anyway.", icon: "bi-building" },
    { id: "b6", name: "Empire State Building", category: "buildings", rarity: "rare", origin: "New York, USA", year: "1931", description: "A 102-story Art Deco skyscraper in Midtown Manhattan.", lore: "Built in 410 days during the Great Depression.", icon: "bi-building" },
    { id: "b7", name: "Abraj Al-Bait", category: "buildings", rarity: "rare", origin: "Mecca, Saudi Arabia", year: "2012", description: "A government-owned complex of seven skyscraper hotels in Mecca.", lore: "The clock face is visible from 17 kilometers away.", icon: "bi-building" },
    { id: "b8", name: "Colosseum", category: "buildings", rarity: "epic", origin: "Rome, Italy", year: "80 AD", description: "The largest ancient amphitheatre ever built.", lore: "50,000 people once gathered here to watch the impossible.", icon: "bi-building" },
    { id: "b9", name: "Petra", category: "buildings", rarity: "legendary", origin: "Jordan", year: "5 BC", description: "A historic and archaeological city in southern Jordan.", lore: "Carved directly into vibrant red sandstone cliffs.", icon: "bi-building" },
    { id: "b10", name: "Fallingwater", category: "buildings", rarity: "mythic", origin: "Pennsylvania, USA", year: "1939", description: "A house designed by architect Frank Lloyd Wright.", lore: "Built over a waterfall. Defies every expectation of what a house should be.", icon: "bi-building" },
    { id: "b11", name: "Hagia Sophia", category: "buildings", rarity: "epic", origin: "Istanbul, Turkey", year: "537 AD", description: "A mosque and major cultural and historical site in Istanbul.", lore: "It has been a church, a mosque, a museum, and a mosque again.", icon: "bi-building" },
    { id: "b12", name: "Sodium Research Tower", category: "buildings", rarity: "odd", origin: "Nowhere", year: "????", description: "A building that exists nowhere and everywhere at once.", lore: "The architect insists this floor does not exist. Neither does the architect.", icon: "bi-building" },
    // ODDITIES
    { id: "o1", name: "Tiny Fossil", category: "oddities", rarity: "common", origin: "Earth", year: "65,000,000 BC", description: "A microscopic fossil from an unknown creature.", lore: "Older than your attention span.", icon: "bi-bullseye" },
    { id: "o2", name: "Moon Rock", category: "oddities", rarity: "rare", origin: "The Moon", year: "4.5 BYA", description: "A fragment of lunar basalt collected during the Apollo missions.", lore: "It has seen Earth rise 14,000 times.", icon: "bi-moon-stars" },
    { id: "o3", name: "Amber Mosquito", category: "oddities", rarity: "uncommon", origin: "Dominican Republic", year: "23 MYA", description: "A prehistoric mosquito trapped in golden tree resin.", lore: "It was drinking blood when the tree caught it.", icon: "bi-bug" },
    { id: "o4", name: "Unknown Bone", category: "oddities", rarity: "common", origin: "???", year: "???", description: "A bone fragment that doesn't match any known species.", lore: "The paleontologist who found it stopped being a paleontologist.", icon: "bi-bullseye" },
    { id: "o5", name: "Crystal Skull", category: "oddities", rarity: "mythic", origin: "Unknown", year: "Unknown", description: "A human skull hard-carved from clear quartz.", lore: "Some say it hums when no one is listening.", icon: "bi-emoji-dizzy" },
    { id: "o6", name: "Meteorite Fragment", category: "oddities", rarity: "rare", origin: "Space", year: "4.6 BYA", description: "A piece of iron-nickel meteorite that survived atmospheric entry.", lore: "It traveled 300 million kilometers just to land in your collection.", icon: "bi-meteor" },
    { id: "o7", name: "Fossilized Feather", category: "oddities", rarity: "uncommon", origin: "China", year: "125 MYA", description: "A perfectly preserved feather from a dinosaur.", lore: "Proof that giants once wore soft things.", icon: "bi-feather" },
    { id: "o8", name: "Future Fossil", category: "oddities", rarity: "odd", origin: "The Future", year: "3047", description: "A fossil from a creature that does not exist yet.", lore: "It arrived yesterday. It will be buried tomorrow.", icon: "bi-bullseye" },
    { id: "o9", name: "Void Stone", category: "oddities", rarity: "legendary", origin: "The Void", year: "∞", description: "A stone that absorbs all light that touches it.", lore: "It weighs nothing. It holds everything.", icon: "bi-hexagon-fill" },
    { id: "o10", name: "Strange Artifact", category: "oddities", rarity: "epic", origin: "Deep Ocean", year: "???", description: "An object recovered from 11,000 meters below the surface.", lore: "No one knows who made it. No one knows why it was down there.", icon: "bi-vase" },
    // MEDIA
    { id: "m1", name: "Null Disc", category: "media", rarity: "mythic", origin: "Digital", year: "????", description: "A CD that contains absolutely nothing. Not even silence.", lore: "Contains absolutely nothing. Play it and hear the absence of sound.", icon: "bi-disc" },
    { id: "m2", name: "VHS Tape 1997", category: "media", rarity: "common", origin: "USA", year: "1997", description: "A home-recorded VHS tape with an unknown program.", lore: "The label says 'DO NOT WATCH.' The tape says otherwise.", icon: "bi-film" },
    { id: "m3", name: "The Lost Manuscript", category: "media", rarity: "legendary", origin: "Alexandria", year: "48 BC", description: "A scroll that survived the burning of the Library of Alexandria.", lore: "It contains a recipe for something that no longer exists.", icon: "bi-file-text" },
    { id: "m4", name: "Vinyl Record", category: "media", rarity: "uncommon", origin: "UK", year: "1973", description: "A first pressing of a legendary album.", lore: "The grooves contain frequencies the human ear cannot process.", icon: "bi-music-note-beamed" },
    { id: "m5", name: "Polaroid Void", category: "media", rarity: "rare", origin: "???", year: "???", description: "A polaroid photograph that develops into different images.", lore: "It shows you what you were thinking about. Not what you saw.", icon: "bi-camera" },
    { id: "m6", name: "Channel ∞", category: "media", rarity: "odd", origin: "The Static", year: "Always", description: "A television frequency that exists between channels.", lore: "If you tune to it at 3:33 AM, you can see your other self.", icon: "bi-tv" },
    { id: "m7", name: "Encrypted Floppy", category: "media", rarity: "uncommon", origin: "Switzerland", year: "1987", description: "A 5.25-inch floppy disk with unbreakable encryption.", lore: "CERN found it in a drawer. They still haven't opened it.", icon: "bi-floppy" },
    { id: "m8", name: "The Unwritten Book", category: "media", rarity: "epic", origin: "Imagination", year: "Never", description: "A book with blank pages that tell a story when touched.", lore: "Everyone who reads it sees a different story. No one has finished it.", icon: "bi-journal-bookmark" },
    // TINYHUMANS
    { id: "h1", name: "The Librarian", category: "tinyhumans", rarity: "uncommon", origin: "The Archives", year: "Unknown", description: "A small figure who remembers everything you forget.", lore: "He lives in the space between bookshelves. He knows your favorite page.", icon: "bi-person" },
    { id: "h2", name: "The Cartographer", category: "tinyhumans", rarity: "rare", origin: "Lost Maps", year: "Unknown", description: "Draws maps of places that don't exist yet.", lore: "Her maps are always accurate. Eventually.", icon: "bi-compass" },
    { id: "h3", name: "The Astronomer", category: "tinyhumans", rarity: "epic", origin: "The Observatory", year: "Unknown", description: "Watches stars that haven't been born.", lore: "She named a star after you. It doesn't exist yet. It will.", icon: "bi-binoculars" },
    { id: "h4", name: "The Keeper", category: "tinyhumans", rarity: "legendary", origin: "The Threshold", year: "Unknown", description: "Guards the door between what is and what could be.", lore: "He has never slept. He has never blinked. He has never left.", icon: "bi-key" },
    { id: "h5", name: "The Echo", category: "tinyhumans", rarity: "mythic", origin: "The Hollow", year: "Unknown", description: "A being that repeats your thoughts before you think them.", lore: "It doesn't speak. It remembers your voice before you use it.", icon: "bi-person" },
    { id: "h6", name: "The Gardener", category: "tinyhumans", rarity: "common", origin: "The Greenhouse", year: "Unknown", description: "Tends to plants that grow backwards in time.", lore: "Her flowers bloom at sunset and close at dawn. She finds this normal.", icon: "bi-flower1" },
    { id: "h7", name: "The Architect", category: "tinyhumans", rarity: "rare", origin: "The Drafting Table", year: "Unknown", description: "Designs buildings that construct themselves in dreams.", lore: "Every building you've dreamed of visiting, he designed first.", icon: "bi-rulers" },
    { id: "h8", name: "The Scribe", category: "tinyhumans", rarity: "uncommon", origin: "The Scriptorium", year: "Unknown", description: "Writes down things that haven't happened yet.", lore: "Her handwriting is your handwriting. She started writing before you were born.", icon: "bi-pen" },
    // WORLDS
    { id: "w1", name: "Kepler-186f", category: "worlds", rarity: "rare", origin: "Cygnus Constellation", year: "Discovered 2014", description: "The first validated Earth-size planet in the habitable zone.", lore: "It might have oceans. It might have forests. It might be watching us back.", icon: "bi-globe" },
    { id: "w2", name: "Europa", category: "worlds", rarity: "uncommon", origin: "Jupiter Orbit", year: "Discovered 1610", description: "Jupiter's icy moon with a subsurface ocean.", lore: "Beneath 30 kilometers of ice, something swims in absolute dark.", icon: "bi-moon" },
    { id: "w3", name: "The Glass Planet", category: "worlds", rarity: "mythic", origin: "Unknown System", year: "Unknown", description: "A world made entirely of translucent crystal.", lore: "Light takes 40 years to cross it. The inhabitants have never seen darkness.", icon: "bi-globe" },
    { id: "w4", name: "Proxima Centauri b", category: "worlds", rarity: "epic", origin: "Centaurus", year: "Discovered 2016", description: "The closest known exoplanet to the Solar System.", lore: "4.2 light years away. Close enough to wave at. Too far to touch.", icon: "bi-globe" },
    { id: "w5", name: "Titan", category: "worlds", rarity: "rare", origin: "Saturn Orbit", year: "Discovered 1655", description: "The only moon known to have a dense atmosphere.", lore: "Its rivers are liquid methane. Its rain falls in slow motion.", icon: "bi-moon" },
    { id: "w6", name: "The Hollow World", category: "worlds", rarity: "odd", origin: "The Gap", year: "Never", description: "A planet that is empty on the inside but full on the outside.", lore: "Gravity points outward. The surface is the core. The core is a question.", icon: "bi-globe" },
    { id: "w7", name: "Enceladus", category: "worlds", rarity: "uncommon", origin: "Saturn Orbit", year: "Discovered 1789", description: "A small, bright moon with geysers of water ice.", lore: "It shoots crystals into space. Saturn wears them as rings.", icon: "bi-moon" },
    { id: "w8", name: "The Forgotten Moon", category: "worlds", rarity: "legendary", origin: "The Outer Rim", year: "Forgotten", description: "A moon that orbits nothing and is orbited by nothing.", lore: "It drifts alone. It remembers every star it has ever passed.", icon: "bi-moon-stars" },
    // OBJECTS
    { id: "obj1", name: "Antikythera Mechanism", category: "objects", rarity: "legendary", origin: "Greece", year: "100 BC", description: "An ancient Greek hand-powered orrery.", lore: "The first computer ever built. It took 2,000 years to understand it.", icon: "bi-gear" },
    { id: "obj2", name: "Voyager Golden Record", category: "objects", rarity: "epic", origin: "Earth", year: "1977", description: "A phonograph record containing sounds and images of Earth.", lore: "It has left the solar system. It will outlast humanity.", icon: "bi-broadcast" },
    { id: "obj3", name: "The Impossible Chair", category: "objects", rarity: "odd", origin: "Escher's Studio", year: "????", description: "A chair that can be sat on from four directions at once.", lore: "Everyone who sits in it claims it's comfortable. No one agrees on the direction.", icon: "bi-chair" },
    { id: "obj4", name: "Box 17", category: "objects", rarity: "rare", origin: "The Warehouse", year: "???", description: "A box that is always heavier on the inside.", lore: "It weighs 3 kilograms. It contains something that weighs 300.", icon: "bi-box-seam" },
    { id: "obj5", name: "Pocket Watch", category: "objects", rarity: "common", origin: "Switzerland", year: "1894", description: "A perfectly preserved mechanical pocket watch.", lore: "It still ticks. No one has wound it in 80 years.", icon: "bi-clock-history" },
    { id: "obj6", name: "The Compass", category: "objects", rarity: "uncommon", origin: "Unknown", year: "???", description: "A compass that points to where you need to go, not where you want to.", lore: "It has never pointed north. It has never been wrong.", icon: "bi-compass-fill" },
    { id: "obj7", name: "Obsidian Mirror", category: "objects", rarity: "mythic", origin: "Mesoamerica", year: "1400 AD", description: "A mirror polished from volcanic glass.", lore: "It doesn't reflect light. It reflects possibility.", icon: "bi-mirror" },
    { id: "obj8", name: "The Last Battery", category: "objects", rarity: "epic", origin: "The Future", year: "2089", description: "A power source that never depletes.", lore: "It has powered a clock for 300 years. It is still at 100%.", icon: "bi-battery-charging" },
    { id: "obj9", name: "Folded Map", category: "objects", rarity: "common", origin: "Unknown", year: "???", description: "A map that changes its territory every time you unfold it.", lore: "It has shown 47 different countries. None of them exist. Yet.", icon: "bi-map" },
    { id: "obj10", name: "The Key", category: "objects", rarity: "legendary", origin: "The Lock", year: "Before", description: "A key that opens doors that haven't been built yet.", lore: "It has no teeth. It has never failed to turn.", icon: "bi-key-fill" }
  ]
};

const RARITY_TABLES = {
  easy:   { common: 0.60, uncommon: 0.28, rare: 0.09, epic: 0.025, legendary: 0.005, mythic: 0, odd: 0, unknown: 0 },
  medium: { common: 0.45, uncommon: 0.32, rare: 0.17, epic: 0.05, legendary: 0.006, mythic: 0.002, odd: 0.002, unknown: 0 },
  hard:   { common: 0.35, uncommon: 0.30, rare: 0.22, epic: 0.09, legendary: 0.01, mythic: 0.003, odd: 0.007, unknown: 0 }
};

function getRarityColor(rarity) {
  const r = ITEMS_DB.rarities.find(r => r.id === rarity);
  return r ? r.color : '#a7afc1';
}

function getCategory(id) {
  return ITEMS_DB.categories.find(c => c.id === id);
}

function getItem(id) {
  return ITEMS_DB.items.find(i => i.id === id);
}

function searchItems(query) {
  const q = query.toLowerCase();
  return ITEMS_DB.items.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q) ||
    i.lore.toLowerCase().includes(q) ||
    i.origin.toLowerCase().includes(q) ||
    i.category.toLowerCase().includes(q)
  );
}
