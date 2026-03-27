const ENEMIES = {
  goblin: {
    id: 'goblin',
    name: 'Goblin Raider',
    hp: 45,
    maxHp: 45,
    attack: 8,
    intro: 'A goblin wearing a dented pot as a helmet. It waves a rusty sword.',
    attackLines: [
      'The goblin swings wildly.',
      'The goblin lunges forward.',
      'The goblin shrieks and attacks!',
      'The goblin pokes aggressively.',
    ],
    defeatLine: 'The goblin yelps, drops its sword, and runs.',
  },
  troll: {
    id: 'troll',
    name: 'Cave Troll',
    hp: 90,
    maxHp: 90,
    attack: 14,
    intro: 'A cave troll blocks the path. Enormous. Smells terrible. Snorts at the sight of three kids.',
    attackLines: [
      'The troll slams the ground with its fist.',
      'The troll swings a massive arm.',
      'The troll ROARS and charges.',
      'The troll throws a rock.',
    ],
    defeatLine: 'The troll staggers, sits down hard, and starts crying.',
  },
};

// Returns a random integer between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Resolve an ability use. Returns { log: string[], stateChanges: {} }
// stateChanges are applied to the battle state by game.js
function resolveAbility(abilityId, battleState) {
  const party = battleState.party;
  const enemy = battleState.enemy;
  const logs = [];

  switch (abilityId) {

    // ── LEO ──────────────────────────────────────────────
    case 'shield_bash': {
      const dmg = rand(14, 20);
      enemy.hp = Math.max(0, enemy.hp - dmg);
      logs.push(`Leo slams the enemy with his shield. <b>${dmg} damage!</b>`);
      if (Math.random() < 0.4) {
        enemy.stunned = true;
        logs.push(`The ${enemy.name} is stunned!`);
      }
      break;
    }

    case 'rally': {
      party.leo.buffed = true;
      party.walter.buffed = true;
      party.james.buffed = true;
      logs.push(`Leo shouts: "Come on, brothers!" <b>The whole party is fired up — next attack hits harder.</b>`);
      break;
    }

    case 'take_hit': {
      battleState.takeHitActive = true;
      logs.push(`Leo plants his feet. <b>He'll take the next hit aimed at his brothers.</b>`);
      break;
    }

    // ── WALTER ───────────────────────────────────────────
    case 'repair': {
      // Find the most injured party member by HP percentage
      const members = ['leo', 'walter', 'james'].filter(k => party[k].hp > 0);
      const target = members.reduce((worst, k) =>
        (party[k].hp / party[k].maxHp) < (party[worst].hp / party[worst].maxHp) ? k : worst
      );
      const heal = rand(15, 22);
      party[target].hp = Math.min(party[target].maxHp, party[target].hp + heal);
      const targetName = CHARACTERS[target].name;
      logs.push(`Walter digs through his pack. "Hold still." <b>${targetName} recovers ${heal} HP.</b>`);
      break;
    }

    case 'throw_thing': {
      const items = [
        'his wrench', 'a gear', 'his notebook', 'a spare bolt',
        'a small spring', 'his pencil case', 'a prototype (unfinished)',
        'what appears to be a battery', 'his lunch',
      ];
      const item = pick(items);
      const dmg = rand(11, 19);
      const stunned = Math.random() < 0.25;
      logs.push(`Walter grabs ${item} and hurls it at the ${enemy.name}. <b>${dmg} damage!</b>`);
      if (stunned) {
        enemy.stunned = true;
        logs.push(`Direct hit to the face. The ${enemy.name} is stunned!`);
      }
      enemy.hp = Math.max(0, enemy.hp - dmg);
      break;
    }

    case 'overclock': {
      // Caller sets awaitingOverclockTarget — this case handled separately
      break;
    }

    case 'overclock_leo': {
      party.leo.overclocked = true;
      logs.push(`Walter points at Leo. "You're up." <b>Leo's next attack deals double damage.</b>`);
      break;
    }

    case 'overclock_james': {
      party.james.overclocked = true;
      logs.push(`Walter points at James. "You're up." James grins. <b>James's next attack deals double damage.</b>`);
      break;
    }

    // ── JAMES ─────────────────────────────────────────────
    case 'sneak': {
      const baseDmg = rand(16, 22);
      const boosted = party.james.overclocked || party.james.buffed;
      const finalDmg = boosted ? Math.round(baseDmg * 1.75) : baseDmg;
      enemy.hp = Math.max(0, enemy.hp - finalDmg);
      party.james.overclocked = false;
      party.james.buffed = false;
      logs.push(`James appears from nowhere and hits for <b>${finalDmg} damage!</b>`);
      break;
    }

    case 'mock': {
      battleState.mockActive = true;
      const mockLines = [
        `James points at the ${enemy.name}. "Nice outfit. Did you pick that yourself?"`,
        `James says: "I've seen scarier things in my lunchbox."`,
        `James looks the ${enemy.name} up and down. "Wow. Just... wow."`,
      ];
      logs.push(pick(mockLines));
      logs.push(`<b>The ${enemy.name} is furious — it'll waste its attack on James, who plans to dodge.</b>`);
      break;
    }

    case 'wild_card': {
      const roll = rand(1, 5);
      if (roll === 1) {
        const dmg = rand(22, 32);
        enemy.hp = Math.max(0, enemy.hp - dmg);
        logs.push(`James fake-faints. The ${enemy.name} celebrates.`);
        logs.push(`James attacks from behind. <b>${dmg} damage!!</b>`);
      } else if (roll === 2) {
        enemy.stunned = true;
        logs.push(`James throws a handful of dirt directly into the ${enemy.name}'s face.`);
        logs.push(`The ${enemy.name} can't see anything. <b>It skips its next turn.</b>`);
      } else if (roll === 3) {
        // Enemy attacks itself
        const selfDmg = rand(Math.floor(enemy.attack * 0.6), enemy.attack);
        enemy.hp = Math.max(0, enemy.hp - selfDmg);
        logs.push(`James says something so confusing to the ${enemy.name} that it punches itself.`);
        logs.push(`<b>${selfDmg} damage to the ${enemy.name}.</b>`);
      } else if (roll === 4) {
        // Steal — heals the party a bit
        const steal = 10;
        ['leo', 'walter', 'james'].forEach(k => {
          party[k].hp = Math.min(party[k].maxHp, party[k].hp + steal);
        });
        logs.push(`James quietly pickpockets the ${enemy.name} mid-battle.`);
        logs.push(`Finds a snack. Shares it. <b>Everyone recovers ${steal} HP.</b>`);
      } else {
        // Embarrass — weakens enemy
        enemy.weakened = true;
        logs.push(`James gives the ${enemy.name} a very specific, very personal insult.`);
        logs.push(`The ${enemy.name} is too embarrassed to fight properly. <b>Its attacks are weakened.</b>`);
      }
      break;
    }

    default:
      logs.push('Nothing happened.');
  }

  return logs;
}

// Resolve the enemy's attack. Returns log strings.
function resolveEnemyAttack(battleState) {
  const enemy = battleState.enemy;
  const party = battleState.party;
  const logs = [];

  if (enemy.stunned) {
    logs.push(`The ${enemy.name} is still stunned — it stumbles and does nothing.`);
    enemy.stunned = false;
    return logs;
  }

  // Pick a living target
  const living = ['leo', 'walter', 'james'].filter(k => party[k].hp > 0);
  if (living.length === 0) return logs;

  let target;
  if (battleState.mockActive) {
    target = 'james';
    battleState.mockActive = false;
    if (Math.random() < 0.8) {
      logs.push(pick(enemy.attackLines));
      logs.push(`The ${enemy.name} lunges at James — James sidesteps at the last second. <b>Miss!</b>`);
      return logs;
    }
    // 20% chance mock fails
    logs.push(`James tries to dodge but trips. Oops.`);
  } else {
    target = pick(living);
  }

  let dmg = rand(Math.floor(enemy.attack * 0.7), Math.ceil(enemy.attack * 1.3));
  if (enemy.weakened) {
    dmg = Math.floor(dmg * 0.6);
    logs.push(`The ${enemy.name}'s gadget wound slows it down.`);
    enemy.weakened = false;
  }
  if (battleState.shieldWallActive) {
    dmg = Math.floor(dmg / 2);
    battleState.shieldWallActive = false;
  }

  if (battleState.takeHitActive && target !== 'leo') {
    logs.push(pick(enemy.attackLines));
    logs.push(`Leo steps in front of ${CHARACTERS[target].name}! <b>Leo takes ${dmg} damage instead.</b>`);
    party.leo.hp = Math.max(0, party.leo.hp - dmg);
    battleState.takeHitActive = false;
  } else {
    battleState.takeHitActive = false;
    logs.push(pick(enemy.attackLines));
    logs.push(`<b>${CHARACTERS[target].name} takes ${dmg} damage.</b>`);
    party[target].hp = Math.max(0, party[target].hp - dmg);
  }

  return logs;
}

// Check if battle is over. Returns 'victory', 'defeat', or null.
function checkBattleEnd(battleState) {
  if (battleState.enemy.hp <= 0) return 'victory';
  const allDown = ['leo', 'walter', 'james'].every(k => battleState.party[k].hp <= 0);
  if (allDown) return 'defeat';
  return null;
}
