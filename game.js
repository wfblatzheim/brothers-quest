// ─── Constants ────────────────────────────────────────────────────────────────

const SAVE_KEY   = 'brothers_quest_save';
const LEAD_ORDER = ['leo', 'walter', 'james'];

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  screen: 'who_playing',
  activePlayer: null,      // set per-battle from battleLeadIndex
  party: {},
  enemy: null,
  battleLog: [],
  pendingLogLines: [],
  currentTurn: 'leo',
  turnOrder: ['leo', 'walter', 'james'],
  turnIndex: 0,
  takeHitActive: false,
  mockActive: false,
  shieldWallActive: false,
  location: '',
  battlesWon: [],
  totalWins: { leo: 0, walter: 0, james: 0 },
  battleLeadIndex: 0,      // 0=leo, 1=walter, 2=james — cycles on each win
  prologueSeen: false,
  // ── Dialogue ──
  dialogueScene: null,
  dialogueLine: 0,
  dialogueDone: false,
  dialogueNext: null,
};

function initParty() {
  state.party = {};
  ['leo', 'walter', 'james'].forEach(k => {
    state.party[k] = {
      hp: CHARACTERS[k].maxHp,
      maxHp: CHARACTERS[k].maxHp,
      stunned: false,
      buffed: false,
    };
  });
}

// ─── Save / Load ──────────────────────────────────────────────────────────────

function saveGame() {
  const save = {
    version: 1,
    battlesWon: state.battlesWon,
    totalWins: state.totalWins,
    prologueSeen: state.prologueSeen,
    battleLeadIndex: state.battleLeadIndex,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const save = JSON.parse(raw);
    if (save.version !== 1) return;
    state.battlesWon      = save.battlesWon      || [];
    state.totalWins       = save.totalWins       || { leo: 0, walter: 0, james: 0 };
    state.prologueSeen    = save.prologueSeen    || false;
    state.battleLeadIndex = save.battleLeadIndex || 0;
  } catch (e) {}
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  state.battlesWon      = [];
  state.totalWins       = { leo: 0, walter: 0, james: 0 };
  state.prologueSeen    = false;
  state.battleLeadIndex = 0;
}

// ─── Animation ────────────────────────────────────────────────────────────────

let animCancel = false;

// Split HTML string into segments for typewriter (handles <b> tags only)
function parseSegments(html) {
  const segments = [];
  const regex = /<b>(.*?)<\/b>/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ bold: false, text: html.slice(lastIndex, match.index) });
    }
    segments.push({ bold: true, text: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < html.length) {
    segments.push({ bold: false, text: html.slice(lastIndex) });
  }
  return segments;
}

function typewriteLine(p, html) {
  return new Promise(resolve => {
    const segments = parseSegments(html);
    p.innerHTML = '';
    let segIdx = 0;
    let charIdx = 0;

    function tick() {
      if (animCancel) { p.innerHTML = html; resolve(); return; }
      if (segIdx >= segments.length) { resolve(); return; }

      const seg = segments[segIdx];
      if (seg.bold) {
        // Insert entire bold chunk at once for emphasis
        const b = document.createElement('b');
        b.textContent = seg.text;
        p.appendChild(b);
        segIdx++;
        charIdx = 0;
        setTimeout(tick, 18);
      } else {
        if (charIdx < seg.text.length) {
          p.appendChild(document.createTextNode(seg.text[charIdx]));
          charIdx++;
          // Scroll log as we type
          const log = document.getElementById('battle-log');
          if (log) log.scrollTop = log.scrollHeight;
          setTimeout(tick, 18);
        } else {
          segIdx++;
          charIdx = 0;
          setTimeout(tick, 18);
        }
      }
    }
    tick();
  });
}

async function animateLog() {
  const log = document.getElementById('battle-log');
  if (!log) return;
  const newLines = [...log.querySelectorAll('p[data-new]')];
  if (!newLines.length) return;

  for (const p of newLines) {
    if (animCancel) { p.innerHTML = p.dataset.html; p.removeAttribute('data-new'); continue; }
    const html = p.dataset.html;
    p.removeAttribute('data-new');
    await typewriteLine(p, html);
    // Brief pause between lines
    await new Promise(r => setTimeout(r, 80));
  }

  state.pendingLogLines = [];
}

// ─── Dialogue helpers ─────────────────────────────────────────────────────────

function startDialogue(sceneKey, nextScreen) {
  state.dialogueScene = sceneKey;
  state.dialogueLine  = 0;
  state.dialogueDone  = false;
  state.dialogueNext  = nextScreen;
  state.screen = 'dialogue';
  render();
}

async function animDialogueLine() {
  const el = document.getElementById('dialogue-text');
  if (!el) return;
  const line = SCENES[state.dialogueScene][state.dialogueLine];
  animCancel = false;
  await typewriteLine(el, line.text);
  if (!animCancel) {
    state.dialogueDone = true;
    const caret = document.querySelector('.dialogue-continue');
    if (caret) caret.classList.add('visible');
  }
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function render() {
  animCancel = true; // stop any running typewriter
  const app = document.getElementById('app');
  switch (state.screen) {
    case 'who_playing':  app.innerHTML = renderWhoPlaying(); break;
    case 'exploration':  app.innerHTML = renderExploration(); break;
    case 'battle_intro': app.innerHTML = renderBattleIntro(); break;
    case 'battle':       app.innerHTML = renderBattle(); break;
    case 'victory':      app.innerHTML = renderVictory(); break;
    case 'defeat':       app.innerHTML = renderDefeat(); break;
    case 'win':          app.innerHTML = renderWin(); break;
    case 'dialogue':     app.innerHTML = renderDialogue(); break;
  }
  const log = document.getElementById('battle-log');
  if (log) log.scrollTop = log.scrollHeight;

  if (state.screen === 'battle' && state.pendingLogLines.length > 0) {
    animCancel = false;
    animateLog();
  }
  if (state.screen === 'dialogue') {
    animDialogueLine();
  }
}

function hpBar(hp, maxHp) {
  const pct = Math.max(0, Math.round((hp / maxHp) * 100));
  const barColor = pct > 50 ? '#4caf50' : pct > 25 ? '#ff9800' : '#f44336';
  return `
    <div class="hp-bar-wrap">
      <div class="hp-bar-fill" style="width:${pct}%;background:${barColor}"></div>
    </div>
    <span class="hp-text">${hp}/${maxHp}</span>
  `;
}

function renderWhoPlaying() {
  const hasSave = state.prologueSeen || state.battlesWon.length > 0 || Object.values(state.totalWins).some(v => v > 0);
  return `
    <div class="screen who-playing">
      <h1 class="title">BROTHERS<br>QUEST</h1>
      <p class="subtitle">A quest for three brothers.</p>
      ${hasSave ? `
        <button class="btn-main" data-action="continue-game">Continue →</button>
        <button class="btn-small" data-action="new-game" style="margin-top:1rem">↩ Start over (watch intro)</button>
      ` : `
        <button class="btn-main" data-action="new-game">Begin the Quest →</button>
      `}
    </div>
  `;
}

function renderBattleIntro() {
  const c = CHARACTERS[LEAD_ORDER[state.battleLeadIndex]];
  return `
    <div class="screen battle-intro">
      <p class="battle-intro-loc">⚔ ${state.location}</p>
      <div class="battle-intro-body">
        <img class="battle-intro-portrait" src="${c.portrait}" alt="${c.name}"
             style="filter: drop-shadow(0 0 28px ${c.color}77)">
        <h2 class="battle-intro-name" style="color:${c.color}">${c.name.toUpperCase()}'S BATTLE</h2>
        <p class="battle-intro-class" style="color:${c.color}">${c.class}</p>
        <p class="battle-intro-tagline">${c.tagline}</p>
        <p class="battle-intro-prompt">${c.name}, you're in charge.<br>Take the controls.</p>
        <button class="btn-main" data-action="start-battle">Ready →</button>
      </div>
    </div>
  `;
}

function renderDialogue() {
  const scene   = SCENES[state.dialogueScene];
  const line    = scene[state.dialogueLine];
  const spk     = line.speaker ? SPEAKERS[line.speaker] : null;
  const isLast  = state.dialogueLine === scene.length - 1;
  const portrait = spk?.portrait;

  return `
    <div class="dialogue-screen" data-action="advance-dialogue">
      <div class="dialogue-outer">
        ${portrait ? `
          <div class="dialogue-portrait-stand">
            <img src="${portrait}" alt="${spk.name}"
                 style="filter: drop-shadow(0 0 18px ${spk.color}55)">
          </div>
        ` : ''}
        <div class="dialogue-box">
          <div class="dialogue-speaker-row">
            ${spk
              ? `<span class="dialogue-speaker" style="color:${spk.color}">${spk.name}</span>`
              : `<span class="dialogue-speaker narrator">—</span>`
            }
            <span class="dialogue-progress">${state.dialogueLine + 1} / ${scene.length}</span>
          </div>
          <div id="dialogue-text" class="dialogue-text ${!spk ? 'narrator' : ''}"></div>
          <div class="dialogue-continue">${isLast ? 'Begin →' : '▶'}</div>
        </div>
      </div>
    </div>
  `;
}

function renderExploration() {
  const allWon = ['goblin', 'troll', 'spider'].every(e => state.battlesWon.includes(e));

  if (allWon) {
    setTimeout(() => { state.screen = 'win'; render(); }, 100);
    return `<div class="screen"><p>Loading...</p></div>`;
  }

  const locations = [
    {
      id: 'goblin',
      label: '🌲 Darkwood Trail',
      desc: 'A trail winding into dark trees. Something rustles nearby.',
      disabled: state.battlesWon.includes('goblin'),
      doneText: '✓ Trail cleared',
    },
    {
      id: 'troll',
      label: '🏔 Mountain Pass',
      desc: 'A rocky path north. Something big is blocking the road.',
      disabled: state.battlesWon.includes('troll'),
      doneText: '✓ Pass cleared',
    },
    {
      id: 'spider',
      label: '🕷 Spider Hollow',
      desc: 'Old forest road, east of the village. Nobody goes there anymore.',
      disabled: state.battlesWon.includes('spider'),
      doneText: '✓ Hollow cleared',
    },
  ];

  return `
    <div class="screen exploration">
      <div class="explore-header">
        <span class="location-tag">📍 Millbrook Village</span>
      </div>
      <div class="explore-body">
        <p class="narration">
          Three brothers at the edge of the village. Walter has a map.
          James is already walking toward the forest without asking anyone.
        </p>
        <p class="narration">
          Walter checks his notes: "Three problems to deal with before we can move on."
        </p>
      </div>
      <div class="explore-choices">
        ${locations.map(loc => `
          <button
            class="explore-btn ${loc.disabled ? 'done' : ''}"
            data-action="enter-battle"
            data-value="${loc.id}"
            ${loc.disabled ? 'disabled' : ''}
          >
            <span class="explore-label">${loc.disabled ? loc.doneText : loc.label}</span>
            ${!loc.disabled ? `<span class="explore-desc">${loc.desc}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderBattle() {
  const enemy = state.enemy;
  const party = state.party;
  const turn = state.currentTurn;
  const c = CHARACTERS[turn];
  const member = party[turn];
  const isAlive = member.hp > 0;

  // Build party HP rows
  const partyRows = ['leo','walter','james'].map(k => {
    const ch = CHARACTERS[k];
    const m = party[k];
    const isLead = k === state.activePlayer;
    const isTurn = k === turn;
    return `
      <div class="party-row ${m.hp <= 0 ? 'knocked-out' : ''} ${isTurn ? 'active-turn' : ''}">
        <img class="party-portrait" src="${ch.portrait}" alt="${ch.name}" style="border-color:${isTurn ? ch.color : 'transparent'}">
        <span class="party-name" style="color:${ch.color}">${ch.name}${isLead ? ' ★' : ''}</span>
        ${hpBar(m.hp, m.maxHp)}
      </div>
    `;
  }).join('');

  // Build ability buttons
  let actionArea = '';
  if (!isAlive) {
    // Skip knocked-out characters automatically
    actionArea = `<p class="turn-label">${c.name} is knocked out. Skipping...</p>`;
    setTimeout(() => advanceTurn(), 600);
  } else {
    const abilities = CHARACTERS[turn].abilities;
    actionArea = `
      <p class="turn-label" style="color:${c.color}">★ ${c.name}'s turn</p>
      <div class="ability-grid">
        ${abilities.map(ab => `
          <button class="ability-btn" data-action="use-ability" data-value="${ab.id}">
            <span class="ability-name">${ab.name}</span>
            <span class="ability-desc">${ab.desc}</span>
          </button>
        `).join('')}
        <button class="ability-btn secondary" data-action="flee">🏃 Flee</button>
      </div>
    `;
  }

  return `
    <div class="screen battle">
      <div class="battle-header">
        <span class="battle-loc">⚔ BATTLE — ${state.location}</span>
      </div>

      <div class="battle-main">
        <div class="enemy-panel">
          <div class="enemy-name">${enemy.name}</div>
          ${hpBar(enemy.hp, enemy.maxHp)}
        </div>
        <div class="party-panel">
          ${partyRows}
        </div>
      </div>

      <div class="battle-log-wrap">
        <div id="battle-log" class="battle-log">
          ${state.battleLog.map((line, i) => {
            const isNew = i >= state.battleLog.length - state.pendingLogLines.length;
            return isNew
              ? `<p class="log-new" data-new="true" data-html="${line.replace(/"/g, '&quot;')}"></p>`
              : `<p class="log-old">${line}</p>`;
          }).join('')}
        </div>
      </div>

      <div class="battle-actions">
        ${actionArea}
      </div>
    </div>
  `;
}

function renderVictory() {
  const enemy = state.enemy;
  return `
    <div class="screen victory">
      <h2 class="victory-title">VICTORY!</h2>
      <p class="victory-flavor">${enemy.defeatLine}</p>
      <p class="victory-sub">The brothers win the battle.</p>
      <div class="battle-log-wrap small">
        <div class="battle-log">
          ${state.battleLog.slice(-6).map(l => `<p>${l}</p>`).join('')}
        </div>
      </div>
      <button class="btn-main" data-action="back-to-explore">Continue →</button>
    </div>
  `;
}

function renderDefeat() {
  return `
    <div class="screen defeat">
      <h2 class="defeat-title">KNOCKED OUT</h2>
      <p class="defeat-sub">The brothers fall. But heroes don't stay down.</p>
      <button class="btn-main" data-action="retry-battle">Try Again</button>
      <button class="btn-small" data-action="back-to-explore" style="margin-top:0.5rem">Back to map</button>
    </div>
  `;
}

function renderWin() {
  return `
    <div class="screen victory">
      <h2 class="victory-title">QUEST COMPLETE!</h2>
      <p class="victory-flavor">
        The trail is clear. The pass is open. The hollow is safe.<br>
        The brothers head back to the village together.
      </p>
      <p style="margin-top:1.5rem;color:#aaa;font-size:0.85rem;text-align:center">
        James is already planning the next adventure.<br>
        Walter is taking notes.<br>
        Leo is talking to everyone in town.
      </p>
      <p style="margin-top:2rem;color:#f4a843;font-size:0.75rem;text-align:center;letter-spacing:0.1em">
        — TO BE CONTINUED —
      </p>
      <button class="btn-main" data-action="new-game" style="margin-top:2rem">Play again</button>
    </div>
  `;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function handleAction(action, value) {
  switch (action) {

    case 'continue-game': {
      initParty();
      state.screen = 'exploration';
      render();
      break;
    }

    case 'enter-battle': {
      state.activePlayer = LEAD_ORDER[state.battleLeadIndex];
      const enemyTemplate = ENEMIES[value];
      state.enemy = {
        ...enemyTemplate,
        hp: enemyTemplate.hp,
        stunned: false,
        weakened: false,
      };
      state.location = value === 'goblin' ? 'Darkwood Trail'
                     : value === 'troll'  ? 'Mountain Pass'
                     : 'Spider Hollow';
      state.battleLog = [enemyTemplate.intro];
      state.pendingLogLines = [enemyTemplate.intro];
      state.currentTurn = 'leo';
      state.turnIndex = 0;
      state.takeHitActive = false;
      state.mockActive = false;
      state.shieldWallActive = false;
      state.screen = 'battle_intro';
      render();
      break;
    }

    case 'start-battle': {
      state.screen = 'battle';
      render();
      break;
    }

    case 'use-ability': {
      state.pendingLogLines = [];  // reset at start of each new user action
      const battleState = getBattleState();
      const logs = resolveAbility(value, battleState);
      applyBattleState(battleState);
      logs.forEach(l => { state.battleLog.push(l); state.pendingLogLines.push(l); });

      const result = checkBattleEnd(battleState);
      if (result === 'victory') {
        recordWin();
        state.screen = 'victory';
        render();
        break;
      }
      if (result === 'defeat') {
        state.screen = 'defeat';
        render();
        break;
      }

      advanceTurn();
      break;
    }

    case 'flee': {
      state.screen = 'exploration';
      render();
      break;
    }

    case 'back-to-explore': {
      state.screen = 'exploration';
      render();
      break;
    }

    case 'new-game': {
      clearSave();
      initParty();
      startDialogue('prologue', 'exploration');
      break;
    }

    case 'advance-dialogue': {
      if (!state.dialogueDone) {
        // Snap current line to full text immediately
        animCancel = true;
        const line = SCENES[state.dialogueScene][state.dialogueLine];
        const el = document.getElementById('dialogue-text');
        if (el) {
          el.innerHTML = line.text;
          el.className = 'dialogue-text' + (line.speaker ? '' : ' narrator');
        }
        state.dialogueDone = true;
        const caret = document.querySelector('.dialogue-continue');
        if (caret) caret.classList.add('visible');
        break;
      }
      // Advance to next line
      const nextLine = state.dialogueLine + 1;
      if (nextLine >= SCENES[state.dialogueScene].length) {
        if (state.dialogueScene === 'prologue') {
          state.prologueSeen = true;
          saveGame();
        }
        state.dialogueScene = null;
        state.dialogueLine  = 0;
        state.dialogueDone  = false;
        state.screen = state.dialogueNext;
        render();
      } else {
        state.dialogueLine = nextLine;
        state.dialogueDone = false;
        render();
      }
      break;
    }

    case 'retry-battle': {
      // Re-enter same battle with reset party
      initParty();
      const enemyTemplate = ENEMIES[state.enemy.id];
      state.enemy = { ...enemyTemplate, hp: enemyTemplate.hp, stunned: false, weakened: false };
      state.battleLog = [enemyTemplate.intro];
      state.pendingLogLines = [enemyTemplate.intro];
      state.currentTurn = 'leo';
      state.turnIndex = 0;
      state.takeHitActive = false;
      state.mockActive = false;
      state.shieldWallActive = false;
      state.screen = 'battle';
      render();
      break;
    }
  }
}

function recordWin() {
  state.battlesWon.push(state.enemy.id);
  state.totalWins[state.activePlayer]++;
  state.battleLeadIndex = (state.battleLeadIndex + 1) % 3;
  saveGame();
}

// ─── Battle turn management ───────────────────────────────────────────────────

// Pack shared battle flags into a plain object for battles.js functions
function getBattleState() {
  return {
    party: state.party,
    enemy: state.enemy,
    takeHitActive: state.takeHitActive,
    mockActive: state.mockActive,
    shieldWallActive: state.shieldWallActive,
  };
}

// Write shared flags back from battle state result
function applyBattleState(bs) {
  state.takeHitActive = bs.takeHitActive;
  state.mockActive = bs.mockActive;
  state.shieldWallActive = bs.shieldWallActive;
  state.party = bs.party;
  state.enemy = bs.enemy;
}

function advanceTurn() {
  // Move to next living character, or enemy
  const order = state.turnOrder; // ['leo','walter','james']
  let next = (state.turnIndex + 1) % 4; // 0,1,2 = characters, 3 = enemy

  if (next === 3) {
    // Enemy's turn
    state.turnIndex = 3;
    doEnemyTurn();
    return;
  }

  // Skip knocked-out characters
  let attempts = 0;
  while (state.party[order[next]]?.hp <= 0 && attempts < 3) {
    next = (next + 1) % 4;
    attempts++;
  }

  if (next === 3 || attempts >= 3) {
    state.turnIndex = 3;
    doEnemyTurn();
    return;
  }

  state.turnIndex = next;
  state.currentTurn = order[next];
  render();
}

function doEnemyTurn() {
  const battleState = getBattleState();
  const logs = resolveEnemyAttack(battleState);
  applyBattleState(battleState);
  logs.forEach(l => { state.battleLog.push(l); state.pendingLogLines.push(l); });

  const result = checkBattleEnd(battleState);
  if (result === 'victory') {
    recordWin();
    state.screen = 'victory';
    render();
    return;
  }
  if (result === 'defeat') {
    state.screen = 'defeat';
    render();
    return;
  }

  // Back to Leo
  state.turnIndex = 0;
  state.currentTurn = 'leo';

  render();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadGame();  // restore progress from localStorage

  document.getElementById('app').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    handleAction(btn.dataset.action, btn.dataset.value);
  });
  render();
});
