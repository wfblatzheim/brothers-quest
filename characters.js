const CHARACTERS = {
  leo: {
    name: 'Leo',
    class: 'Paladin',
    tagline: '"Lead the charge."',
    maxHp: 55,
    might: 14,   // hits hard up front
    guard: 6,    // ~23% damage reduction — he's the tank
    speed: 6,    // slow and deliberate
    cunning: 6,  // straightforward; stun chance modest
    color: '#f4a843',
    portrait: 'pictures/paladinwarrior.png',
    abilities: [
      {
        id: 'shield_bash',
        name: '⚔ Shield Bash',
        desc: 'Big hit — chance to stun',
      },
      {
        id: 'rally',
        name: '📯 Rally Brothers',
        desc: "Boosts the whole party's next attack",
      },
      {
        id: 'take_hit',
        name: '🛡 Take the Hit',
        desc: 'Intercept the next attack aimed at a brother',
      },
    ],
  },
  walter: {
    name: 'Walter',
    class: 'Inventor',
    tagline: '"Build smarter."',
    maxHp: 42,
    might: 8,    // throws things — output is low but scan/gadgets are the real weapon
    guard: 3,    // ~13% reduction — smarter positioning than Leo, lighter armor
    speed: 10,   // quick enough to act before slow enemies, set up combos
    cunning: 16, // scan multiplier, heal amount, gadget reliability all scale from here
    color: '#4fc3f7',
    portrait: 'pictures/inventor.png',
    abilities: [
      {
        id: 'repair',
        name: '🔧 Field Repair',
        desc: 'Walter patches up whoever is hurting most',
      },
      {
        id: 'throw_thing',
        name: '🎯 Throw the Thing!',
        desc: "Walter hurls whatever's closest. It's always something.",
      },
      {
        id: 'scan',
        name: '🔬 Scan',
        desc: 'Walter finds the weak point — next hit deals double damage',
      },
    ],
  },
  james: {
    name: 'James',
    class: 'Trickster',
    tagline: '"Fair fights? Never."',
    maxHp: 38,
    might: 12,   // sneak attacks hit hard; Wild Card big rolls scale well
    guard: 2,    // ~9% reduction — glass cannon, goes down fast if caught
    speed: 16,   // 16% passive dodge; Mock is highly reliable
    cunning: 12, // Wild Card skews toward better outcomes; stun on throws
    color: '#81c784',
    portrait: 'pictures/trickster.png',
    abilities: [
      {
        id: 'sneak',
        name: '🗡 Sneak Attack',
        desc: 'Hits hard when enemies least expect it',
      },
      {
        id: 'mock',
        name: '😏 Mock Enemy',
        desc: 'Enemy rages at James, who dodges',
      },
      {
        id: 'wild_card',
        name: '🎲 Wild Card',
        desc: "James does something. Nobody knows what. James might not even know.",
      },
    ],
  },
};
