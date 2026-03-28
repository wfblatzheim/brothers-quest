# Brothers Quest — Roadmap
*The Sleeping World*

A browser-based party RPG for Leo (11), Walter (9), and James (6).
Built in plain HTML/CSS/JS. Playable by opening `index.html` in a browser.

---

## Done ✅

### Core Engine
- [x] State machine with `render()` loop
- [x] Event delegation via `data-action` attributes
- [x] Typewriter animation for battle log lines
- [x] localStorage save/load (version 1)
- [x] Per-battle lead rotation — `battleLeadIndex` cycles through brothers each win (Leo → Walter → James → repeat); the lead brother is highlighted in battle UI

### Characters
- [x] Leo (Paladin) — Shield Bash, Rally Brothers, Take the Hit
- [x] Walter (Inventor) — Field Repair, Throw the Thing!, Scan
- [x] James (Trickster) — Sneak Attack, Mock Enemy, Wild Card
- [x] 4-stat system (might / guard / speed / cunning) fully wired into ability formulas and damage/dodge resolution
- [x] Per-character color, portrait, HP, class, tagline

### Battles
- [x] Three demo enemies: Goblin Raider (Darkwood Trail), Cave Troll (Mountain Pass), Giant Spider (Spider Hollow)
- [x] Status effects: stunned, weakened, buffed, scanned (double damage)
- [x] `applyDamage()` helper handles scan bonus
- [x] Enemy turn resolution with `mock` dodge and `take_hit` intercept
- [x] Victory / Defeat / Retry screens
- [x] Flavor text: enemy attack lines, defeat lines, intro text

### Prologue & Dialogue
- [x] Full prologue written and playable (the frozen kitchen, Dusty, the dream door)
- [x] Dialogue system with speaker portraits, typewriter animation
- [x] Moth → Dusty naming transition mid-scene
- [x] `prologueSeen` flag prevents prologue from looping

### Art & Presentation
- [x] Dark RPG color scheme
- [x] Character portraits in battle (Leo, Walter, James)
- [x] Active-turn portrait highlight (colored border on current character's portrait)
- [x] Portrait stands in dialogue (character shown outside the text box)
- [x] Leo has a "normal clothes" portrait for prologue (`warriornormal.png`)

### World & Story
- [x] STORY_BIBLE.md — full story structure, dreamscapes, characters, tone guide

### Infrastructure
- [x] GitHub repo: https://github.com/wfblatzheim/brothers-quest
- [x] Netlify deployment (live on the web)

---

## Up Next 🔨

### Art fixes
- [ ] Get transparent-background versions of `trickster.png` and `warriornormal.png` (currently white bg)
- [ ] Normal/civilian portraits for Walter and James (like Leo's hoodie portrait)
- [ ] Add portraits to the Who's Playing character selection cards

### Dreamscape 1 — Eternal Autumn Forest
*Walter leads. Theme: things that look alive but aren't.*
- [ ] Write forest exploration screen (location, narration, choices)
- [ ] New enemies: Shadow Fox, Hollow Stag, Flock of Hollow Starlings
- [ ] Hollow Stag mini-boss — scan mechanic highlighted (Walter's moment)
- [ ] Looping forest puzzle (the boys keep arriving at the same clearing)
- [ ] Scene/dialogue: Walter figures out the pattern
- [ ] Victory payoff: the forest stills, a path opens

### Quality of Life
- [ ] Show active status effects somewhere in battle UI (scanned, stunned, buffed)
- [ ] Sound effects (optional — even simple beeps would land with kids)

---

## Someday 💭
*From the Story Bible — bigger swings for later.*

### Dreamscape 2 — Upside-Down City
*James leads. Theme: rules don't apply here.*
- [ ] Gravity-defying layout
- [ ] Enemies: Mirror Soldiers, Laughing Gargoyles
- [ ] James's trickster abilities are especially powerful here
- [ ] Puzzle: something only James's illogic can solve

### Dreamscape 3 — Dry Ocean
*Leo leads. Theme: things lost and waiting.*
- [ ] Sunken ships, coral ghosts, bioluminescent creatures
- [ ] Leo's leadership and protection abilities shine
- [ ] Mini-boss: something big and sad

### Dreamscape 4 — Palace of Mirrors
*All three together. The finale.*
- [ ] Each brother faces a reflection of themselves
- [ ] The Nightmare King — dissolved, not defeated (the nihilist reveal)
- [ ] The Dreamer — imprisoned as an act of love, not cruelty
- [ ] Emotional ending: the world wakes up, the kitchen unfreezes

### Mechanical Ideas (not yet designed)
- [ ] Multi-enemy battles (e.g. Goblin + Goblin, or Starling Flock as one entity)
- [ ] Items / inventory (found during exploration)
- [ ] XP or progression between sessions
- [ ] More exploration choices — branching paths, optional fights
- [ ] Dusty appears mid-adventure with hints or flavor lines

---

## Known Issues / Tech Debt
- [ ] White backgrounds on `trickster.png` and `warriornormal.png`
- [ ] No error handling if save data is from a future version
- [ ] Battle log can get long — no cap on total lines stored in `state.battleLog`

---

*Last updated: March 28, 2026*
