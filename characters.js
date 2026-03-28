const CHARACTERS = {
  leo: {
    name: 'Leo',
    class: 'Paladin',
    tagline: '"Lead the charge."',
    maxHp: 55,
    attack: 12,
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
    attack: 10,
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
        id: 'overclock',
        name: '⚡ Overclock',
        desc: 'Supercharges Leo or James — pick a target',
      },
    ],
  },
  james: {
    name: 'James',
    class: 'Trickster',
    tagline: '"Fair fights? Never."',
    maxHp: 38,
    attack: 14,
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
