# Brothers Quest — Project Brief

## What we're building

A browser-based party RPG for three brothers to play together on the family Windows PC.
Inspired by Knights of Pen and Paper, Dragon Quest, and Zelda — but built as a
menu-driven HTML/CSS/JavaScript game (no game engine, no install required).

The game runs by opening `index.html` in Chrome or Edge. No setup on the Windows PC.
Built and edited on a Mac in VS Code, copied to Windows when ready to play.

---

## The core mechanic

Any of the three boys can sit down and play. A "Who's playing?" screen lets them pick
their character. Whoever picks becomes the **main character** (addressed by NPCs, leads
the party). The other two brothers are party members controlled by whoever is at the
keyboard that session.

Each battle rotates which brother **leads** — Leo first, then Walter, then James, then
back to Leo. The lead is highlighted in the battle UI. This naturally passes the spotlight
without prompting.

One shared save file — all progress is shared. When Walter plays and wins a battle,
all three characters gain XP. This rewards whoever plays most while keeping things fair.

---

## The characters

### Leo — Age 11 — Paladin
Natural leader, Gryffindor energy, big personality, loves books, friends with everyone.

| Ability | Effect |
|---|---|
| Shield Bash | Big hit, chance to stun |
| Rally Brothers | Boosts the whole party's next attack |
| Take the Hit | Intercepts an attack aimed at a brother |

Leo is addressed first by NPCs. He feels like the hero because he is one.

---

### Walter — Age 9 — Inventor
Super smart, mercurial, wears emotions on his sleeve, future engineer, takes everything
apart and rebuilds it better.

| Ability | Effect |
|---|---|
| Field Repair | Patches up whoever is hurting most |
| Throw the Thing! | Walter hurls whatever's closest — always something different |
| Scan | Finds the weak point — next hit deals scaled bonus damage |

Walter doesn't cast spells — he *builds* things. His abilities feel clever.

---

### James — Age 6 — Trickster
Funny, witty, teases his brothers constantly, was reading at 4, loves Minecraft,
hates being left behind.

| Ability | Effect |
|---|---|
| Sneak Attack | Hits hard when enemies aren't expecting it |
| Mock Enemy | Taunts enemy so hard they waste their turn attacking James, who dodges |
| Wild Card | James does something. Nobody knows what. Always spectacular, never predictable |

James's ability descriptions should have attitude. Example: *"James mocks the goblin's
hat. The goblin is furious."*

---

## Game loop

```
WHO'S PLAYING? screen
        ↓
EXPLORATION screen (text description + 2-3 choices)
        ↓  (enter dangerous area or trigger encounter)
BATTLE screen (turn-based, menu-driven)
        ↓  (win)
Back to EXPLORATION
        ↓  (reach a town)
TOWN screen (rest/heal, shop, NPC dialogue)
```

The world is navigated through **text descriptions and button choices** — no tile map,
no top-down movement. Think Choose Your Own Adventure meets JRPG combat. This keeps
the build simple and puts storytelling front and center.

---

## UI sketches

### Who's Playing?
```
┌─────────────────────────────────────────────────────────┐
│                   BROTHERS  QUEST                       │
│               Who's at the keyboard?                    │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │     LEO     │  │   WALTER    │  │    JAMES    │   │
│   │   Paladin   │  │  Inventor   │  │  Trickster  │   │
│   │ "Lead the   │  │ "Build      │  │ "Fair       │   │
│   │  charge."   │  │  smarter."  │  │  fights?    │   │
│   │             │  │             │  │  Never."    │   │
│   └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Battle screen
```
┌─────────────────────────────────────────────────────────┐
│  ⚔ BATTLE  —  Darkwood Trail                           │
├───────────────────────┬─────────────────────────────────┤
│                       │  LEO     ████████░░   42/50 HP  │
│     CAVE TROLL        │  WALTER  ██████░░░░   28/40 HP  │
│     HP: ██████░░░░    │  JAMES   ██████████   35/35 HP  │
│         61 / 100      │                                  │
├───────────────────────┴─────────────────────────────────┤
│  The troll snorts. "Three little boys? Ha!"             │
│  James mutters: "Three little boys about to ruin        │
│  your Tuesday."                                         │
├─────────────────────────────────────────────────────────┤
│  ★ LEO's turn                                           │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ ⚔ Shield Bash │ │ 📯 Rally Bros │ │ 🛡 Take Hit   │  │
│  └───────────────┘ └───────────────┘ └───────────────┘  │
│                          ┌──────────┐  ┌─────────────┐  │
│                          │ 💊 Item  │  │  🏃 Flee    │  │
│                          └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Exploration screen
```
┌─────────────────────────────────────────────────────────┐
│  THE WORLD MAP                          Day 3 · Morning │
├─────────────────────────────────────────────────────────┤
│   You stand at the edge of Millbrook Village.           │
│   A mountain road stretches to the north.               │
│   A dark forest path winds to the east.                 │
│                                                         │
│   Walter studies his notes. "If the Big Bad is up in   │
│   those mountains, we should gear up first."            │
│   James is already halfway to the forest.               │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ 🏔 Head North │ │ 🌲 Go East    │ │ 🏘 Millbrook  │  │
│  │   (Mountain)  │ │   (Forest)    │ │   Village     │  │
│  └───────────────┘ └───────────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech stack

- **HTML + CSS + JavaScript** — no framework, no build tools, no install
- Six core files: `index.html`, `style.css`, `game.js`, `characters.js`, `battles.js`, `dialogue.js`
- Open `index.html` in Chrome/Edge to play
- Copy the whole folder to Windows PC to play there
- Story/world content lives in `STORY_BIBLE.md` — the dreamscape structure, big bad, and arc are sketched out there

---

## Still to decide

- Game name (Brothers Quest is a working title — "The Sleeping World" appears as subtitle in ROADMAP)
- Whether the boys help build it or it's a surprise
- Visual style: pixel art portraits for each character, final color palette
