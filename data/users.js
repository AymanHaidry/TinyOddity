/* =========================================================
   TINYODDITY v2.0 — PUBLIC USER DATABASE
   Explorers across the multiverse
   ========================================================= */

const USER_DB = {
  version: "2.0.0",
  users: [
    {
      id: "u1",
      handle: "voidwalker",
      name: "Voidwalker",
      universe: "The Architectural Dream",
      bio: "I collect buildings that should not exist. Every structure in my universe defies at least one law of physics.",
      avatar: "bi-person-workspace",
      accent: "#65e9ff",
      items: 127,
      rarePlus: 34,
      tasksDone: 312,
      studyHours: 89,
      joined: "2024-03-15",
      featured: ["b10", "b5", "b9"],
      collections: ["Impossible Structures", "Floating Architecture", "Doors to Nowhere"],
      lore: "They say Voidwalker once found a staircase that led to the bottom of the ocean. They never came back the same."
    },
    {
      id: "u2",
      handle: "nullpointer",
      name: "NullPointer",
      universe: "Things That Don't Exist",
      bio: "Hunting objects from timelines that never happened. My collection is a museum of the impossible.",
      avatar: "bi-person-gear",
      accent: "#b46cff",
      items: 43,
      rarePlus: 19,
      tasksDone: 156,
      studyHours: 47,
      joined: "2024-06-22",
      featured: ["o8", "m1", "obj3"],
      collections: ["Temporal Artifacts", "Null Objects", "Future Fossils"],
      lore: "NullPointer's universe contains a room where gravity points sideways. They use it as a bookshelf."
    },
    {
      id: "u3",
      handle: "stardust",
      name: "Stardust",
      universe: "Deep Space Oddities",
      bio: "Fossils, meteorites, and things pulled from the ocean floor. I am a curator of cosmic debris.",
      avatar: "bi-person-hearts",
      accent: "#c7ff75",
      items: 89,
      rarePlus: 28,
      tasksDone: 267,
      studyHours: 71,
      joined: "2024-01-08",
      featured: ["o6", "o2", "o9"],
      collections: ["Meteorite Fragments", "Deep Sea Finds", "Crystal Collection"],
      lore: "Stardust claims to have a rock that whispers the names of dying stars. No one has disproved it."
    },
    {
      id: "u4",
      handle: "vhsdreamer",
      name: "VHSdreamer",
      universe: "The Media Graveyard",
      bio: "Lost tapes, unreadable discs, and books with no authors. I archive what the world forgot.",
      avatar: "bi-person-video2",
      accent: "#ffb76b",
      items: 56,
      rarePlus: 15,
      tasksDone: 198,
      studyHours: 53,
      joined: "2024-09-01",
      featured: ["m3", "m6", "m1"],
      collections: ["Lost Tapes", "Unreadable Formats", "Books Without Authors"],
      lore: "VHSdreamer owns a television that shows programs from parallel dimensions. They only watch the commercials."
    },
    {
      id: "u5",
      handle: "aether",
      name: "Aether",
      universe: "The Hollow Collection",
      bio: "I only collect things that weigh nothing. My universe is full of objects you can feel but never hold.",
      avatar: "bi-person-bounding-box",
      accent: "#ff5ac8",
      items: 34,
      rarePlus: 22,
      tasksDone: 134,
      studyHours: 38,
      joined: "2025-01-12",
      featured: ["o9", "w6", "obj7"],
      collections: ["Weightless Objects", "Void Artifacts", "Invisible Things"],
      lore: "Aether's favorite possession is a jar containing the sound of silence. It is their heaviest item."
    },
    {
      id: "u6",
      handle: "chronos",
      name: "Chronos",
      universe: "Temporal Artifacts",
      bio: "Objects that arrived before they were made. I collect the future's past.",
      avatar: "bi-person-video3",
      accent: "#7b7cff",
      items: 71,
      rarePlus: 31,
      tasksDone: 245,
      studyHours: 67,
      joined: "2024-04-30",
      featured: ["o8", "obj8", "w8"],
      collections: ["Future Fossils", "Time Travel Evidence", "Before They Existed"],
      lore: "Chronos owns a calendar from next year. They refuse to check what day they die."
    }
  ],

  getById(id) { return this.users.find(u => u.id === id); },
  getByHandle(handle) { return this.users.find(u => u.handle === handle); },
  search(query) {
    const q = query.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.universe.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );
  }
};
