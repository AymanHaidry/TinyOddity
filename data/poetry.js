/* =========================================================
   TINYODDITY v2.0 — POETIC LANGUAGE SYSTEM
   The cosmos speaks through every pixel
   ========================================================= */

const POETRY = {
  greetings: [
    "The cosmos has been waiting for you.",
    "Your attention builds worlds.",
    "Every task is a star being born.",
    "The universe notices your effort.",
    "Stardust organizing itself.",
    "You are the architect of your own cosmos.",
    "The void whispers your name.",
    "Light bends around your determination."
  ],

  empty: {
    tasks: [
      "The cosmos is patient. Create a task to begin.",
      "No missions yet. The stars are waiting for your signal.",
      "The void holds its breath. Give it something to witness."
    ],
    collection: [
      "The universe holds its breath. Complete a task to breathe life into it.",
      "Nothing discovered yet. But the cosmos has already chosen your first gift.",
      "Your collection is a blank canvas. Paint it with completed tasks."
    ],
    universe: [
      "Your cosmos is empty. Add discoveries from your collection.",
      "A universe without stars is just darkness. Place your first object.",
      "Drag items from your tray to build your world."
    ]
  },

  discovery: {
    label: "✦ Discovery Found ✦",
    addButton: "Claim for Your Universe",
    particles: [
      "The cosmos shimmers.",
      "Reality bends slightly.",
      "Something impossible arrives.",
      "The void delivers a gift."
    ]
  },

  task: {
    create: "Summon a Mission",
    complete: "The cosmos acknowledges your effort.",
    timer: "The universe asks for more of your attention.",
    minTime: (remaining) => `The cosmos asks for ${remaining} more of your attention.`
  },

  footer: "Things waiting to be discovered across the multiverse",

  profile: {
    title: "Your Identity Across the Multiverse",
    subtitle: "You are stardust, organizing itself.",
    stats: {
      tasks: "Missions Completed",
      items: "Cosmic Objects",
      rare: "Rare & Above",
      time: "Hours of Focus"
    }
  },

  collection: {
    title: "Your Collection",
    subtitle: "Everything you've discovered. Each object remembers you.",
    filters: {
      all: "All Things",
      buildings: "Structures",
      oddities: "Oddities",
      media: "Media",
      tinyhumans: "Beings",
      worlds: "Worlds",
      objects: "Objects"
    }
  },

  universe: {
    title: "Your Universe",
    subtitle: "This is your world. Arrange it as you dream.",
    hint: "Click tray items to place · Drag to move · Double-click to remove"
  },

  discover: {
    title: "Discover",
    subtitle: "Every explorer leaves a trail of light.",
    searchPlaceholder: "Search explorers, objects, or lore..."
  },

  study: {
    title: "Study",
    subtitle: "Complete missions to receive gifts from the cosmos.",
    difficulty: {
      easy: "A gentle orbit",
      medium: "A steady journey", 
      hard: "A deep dive into the unknown"
    }
  },

  loreWhispers: [
    "The cosmos placed this in your hands.",
    "This object chose you.",
    "You are now part of its story.",
    "It will remember you forever.",
    "A fragment of infinity, yours to keep."
  ],

  toast: {
    taskCreated: "A new star has been charted.",
    taskDeleted: "A star fades from the map.",
    taskCompleted: "The cosmos acknowledges your effort.",
    dataExported: "Your universe has been archived.",
    dataImported: "A parallel universe merges with yours.",
    reset: "The big bang begins again."
  }
};

function randomPoem(key) {
  const keys = key.split('.');
  let arr = POETRY;
  for (const k of keys) {
    arr = arr?.[k];
    if (arr === undefined) return '';
  }
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
}
