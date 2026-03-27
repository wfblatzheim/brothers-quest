// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  screen: 'who_playing',   // who_playing | exploration | battle | victory | defeat
  activePlayer: null,       // 'leo' | 'walter' | 'james'
  party: {},
  enemy: null,
  battleLog: [],
  pendingLogLines: [],      // lines added since last render — get typewriter treatment
  currentTurn: 'leo',       // whose ability buttons are shown
  turnOrder: ['leo', 'walter', 'james'],
  turnIndex: 0,
  awaitingOverclockTarget: false,
  takeHitActive: false,
  mockActive: false,
  shieldWallActive: false,
  location: '',
  battlesWon: [],
};

function initParty() {
  state.party = {};
  ['leo', 'walter', 'james'].forEach(k => {
    state.party[k] = {
      hp: CHARACTERS[k].maxHp,
      maxHp: CHARACTERS[k].maxHp,
      stunned: false,
      buffed: false,
      overclocked: false,
    };
  });
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

// ─── Rendering ────────────────────────────────────────────────────────────────

function render() {
  animCancel = true; // stop any running typewriter
  const app = document.getElementById('app');
  switch (state.screen) {
    case 'who_playing':  app.innerHTML = renderWhoPlaying(); break;
    case 'exploration':  app.innerHTML = renderExploration(); break;
    case 'battle':       app.innerHTML = renderBattle(); break;
    case 'victory':      app.innerHTML = renderVictory(); break;
    case 'defeat':       app.innerHTML = renderDefeat(); break;
    case 'win':          app.innerHTML = renderWin(); break;
  }
  const log = document.getElementById('battle-log');
  if (log) log.scrollTop = log.scrollHeight;

  if (state.screen === 'battle' && state.pendingLogLines.length > 0) {
    animCancel = false;
    animateLog();
  }
}

function hpBar(hp, maxHp, color) {
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
  return `
    <div class="screen who-playing">
      <h1 class="title">BROTHERS<br>QUEST</h1>
      <p class="subtitle">Who's at the keyboard?</p>
      <div class="player-cards">
        ${['leo','walter','james'].map(k => {
          const c = CHARACTERS[k];
          return `
            <button class="player-card" data-action="choose-player" data-value="${k}" style="border-color:${c.color}">
              <div class="card-name" style="color:${c.color}">${c.name.toUpperCase()}</div>
              <div class="card-class">${c.class}</div>
              <div class="card-tagline">${c.tagline}</div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderExploration() {
  const ap = CHARACTERS[state.activePlayer];
  const allWon = ['goblin','troll'].every(e => state.battlesWon.includes(e));

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
  ];

  return `
    <div class="screen exploration">
      <div class="explore-header">
        <span class="location-tag">📍 Millbrook Village</span>
        <button class="btn-small" data-action="back-to-start">Change player</button>
      </div>
      <div class="explore-body">
        <p class="narration">
          ${ap.name} stands at the edge of the village. Walter has a map.
          James is already walking toward the forest without asking anyone.
        </p>
        <p class="narration">
          Walter checks his notes: "Two problems to deal with before we can move on."
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
    const isActive = k === state.activePlayer;
    const isTurn = k === turn;
    return `
      <div class="party-row ${m.hp <= 0 ? 'knocked-out' : ''} ${isTurn ? 'active-turn' : ''}">
        <span class="party-name" style="color:${ch.color}">${ch.name}${isActive ? ' ★' : ''}</span>
        ${hpBar(m.hp, m.maxHp, ch.color)}
      </div>
    `;
  }).join('');

  // Build ability buttons
  let actionArea = '';
  if (state.awaitingOverclockTarget) {
    actionArea = `
      <p class="turn-label">⚡ Who does Walter overclock?</p>
      <div class="ability-grid">
        <button class="ability-btn" data-action="use-ability" data-value="overclock_leo" ${party.leo.hp <= 0 ? 'disabled' : ''}>
          <span class="ability-name">⚔ Leo</span>
        </button>
        <button class="ability-btn" data-action="use-ability" data-value="overclock_james" ${party.james.hp <= 0 ? 'disabled' : ''}>
          <span class="ability-name">🗡 James</span>
        </button>
        <button class="ability-btn secondary" data-action="cancel-overclock">Cancel</button>
      </div>
    `;
  } else if (!isAlive) {
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
          ${hpBar(enemy.hp, enemy.maxHp, '#ef5350')}
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
  const ap = CHARACTERS[state.activePlayer];
  return `
    <div class="screen victory">
      <h2 class="victory-title">QUEST COMPLETE!</h2>
      <p class="victory-flavor">
        The trail is clear. The pass is open.<br>
        ${ap.name} leads the brothers back to the village.
      </p>
      <p style="margin-top:1.5rem;color:#aaa;font-size:0.85rem;text-align:center">
        James is already planning the next adventure.<br>
        Walter is taking notes.<br>
        Leo is talking to everyone in town.
      </p>
      <p style="margin-top:2rem;color:#f4a843;font-size:0.75rem;text-align:center;letter-spacing:0.1em">
        — TO BE CONTINUED —
      </p>
      <button class="btn-small" data-action="back-to-start" style="margin-top:2rem">Play again</button>
    </div>
  `;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function handleAction(action, value) {
  switch (action) {

    case 'choose-player': {
      state.activePlayer = value;
      initParty();
      state.battlesWon = [];
      state.screen = 'exploration';
      render();
      break;
    }

    case 'back-to-start': {
      state.screen = 'who_playing';
      render();
      break;
    }

    case 'enter-battle': {
      const enemyTemplate = ENEMIES[value];
      state.enemy = {
        ...enemyTemplate,
        hp: enemyTemplate.hp,
        stunned: false,
        weakened: false,
      };
      state.location = value === 'goblin' ? 'Darkwood Trail' : 'Mountain Pass';
      state.battleLog = [enemyTemplate.intro];
      state.pendingLogLines = [enemyTemplate.intro];
      state.currentTurn = 'leo';
      state.turnIndex = 0;
      state.awaitingOverclockTarget = false;
      state.takeHitActive = false;
      state.mockActive = false;
      state.shieldWallActive = false;
      state.screen = 'battle';
      render();
      break;
    }

    case 'use-ability': {
      if (value === 'overclock') {
        state.awaitingOverclockTarget = true;
        render();
        break;
      }

      state.awaitingOverclockTarget = false;
      state.pendingLogLines = [];  // reset at start of each new user action
      const battleState = getBattleState();
      const logs = resolveAbility(value, battleState);
      applyBattleState(battleState);
      logs.forEach(l => { state.battleLog.push(l); state.pendingLogLines.push(l); });

      const result = checkBattleEnd(battleState);
      if (result === 'victory') {
        state.battlesWon.push(state.enemy.id);
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

    case 'cancel-overclock': {
      state.awaitingOverclockTarget = false;
      render();
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

    case 'retry-battle': {
      // Re-enter same battle with reset party
      initParty();
      const enemyTemplate = ENEMIES[state.enemy.id];
      state.enemy = { ...enemyTemplate, hp: enemyTemplate.hp, stunned: false, weakened: false };
      state.battleLog = [enemyTemplate.intro];
      state.pendingLogLines = [enemyTemplate.intro];
      state.currentTurn = 'leo';
      state.turnIndex = 0;
      state.awaitingOverclockTarget = false;
      state.takeHitActive = false;
      state.mockActive = false;
      state.shieldWallActive = false;
      state.screen = 'battle';
      render();
      break;
    }
  }
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
    state.battlesWon.push(state.enemy.id);
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

  // Clear round-start buffs
  // (buffs persist until used — handled inside resolveAbility)

  render();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('app').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    handleAction(btn.dataset.action, btn.dataset.value);
  });
  render();
});
