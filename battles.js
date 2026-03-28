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
  spider: {
    id: 'spider',
    name: 'Giant Spider',
    hp: 65,
    maxHp: 65,
    attack: 11,
    intro: 'Something drops from the canopy. Eight eyes. Too many legs. It clacks its mandibles and waits.',
    attackLines: [
      'The spider lunges with its fangs.',
      'The spider fires a strand of sticky web.',
      'The spider skitters sideways and bites.',
      'The spider rears back and strikes.',
    ],
    defeatLine: 'The spider shudders, curls its legs inward, and retreats into the dark trees.',
  },
};

// Returns a random integer between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Apply damage to enemy, applying scan multiplier if active
function applyDamage(enemy, dmg) {
  let final = dmg;
  if (enemy.scanned) {
    final = Math.round(final * (enemy.scanMultiplier || 2));
    enemy.scanned = false;
    enemy.scanMultiplier = 1;
  }
  enemy.hp = Math.max(0, enemy.hp - final);
  return final;
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
      const { might, cunning } = CHARACTERS.leo;
      const dmg = applyDamage(enemy, rand(might, might + 6));
      logs.push(`Leo slams the enemy with his shield. <b>${dmg} damage!</b>`);
      if (Math.random() < 0.3 + cunning * 0.015) {
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
      const { cunning } = CHARACTERS.walter;
      const healBonus = Math.floor(cunning / 2);
      const heal = rand(8 + healBonus, 14 + healBonus);
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
      const { might, cunning } = CHARACTERS.walter;
      const dmg = applyDamage(enemy, rand(might + 3, might + 11));
      logs.push(`Walter grabs ${item} and hurls it at the ${enemy.name}. <b>${dmg} damage!</b>`);
      if (Math.random() < 0.1 + cunning * 0.015) {
        enemy.stunned = true;
        logs.push(`Direct hit to the face. The ${enemy.name} is stunned!`);
      }
      break;
    }

    case 'scan': {
      const scanMult = 1.5 + CHARACTERS.walter.cunning * 0.05;
      enemy.scanned = true;
      enemy.scanMultiplier = scanMult;
      logs.push(`Walter studies the ${enemy.name} carefully. "There. I see it."`);
      logs.push(`<b>The next hit will deal ${scanMult.toFixed(1)}× damage.</b>`);
      break;
    }

    // ── JAMES ─────────────────────────────────────────────
    case 'sneak': {
      const { might } = CHARACTERS.james;
      const base = rand(might + 4, might + 10);
      const boosted = party.james.buffed;
      const finalDmg = applyDamage(enemy, boosted ? Math.round(base * 1.75) : base);
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
      const { might, cunning } = CHARACTERS.james;
      // Higher cunning skews toward better outcomes (rolls 1-3)
      let roll = rand(1, 5);
      if (roll >= 4 && Math.random() < cunning * 0.02) roll = rand(1, 3);
      if (roll === 1) {
        const dmg = applyDamage(enemy, rand(might + 10, might + 20));
        logs.push(`James fake-faints. The ${enemy.name} celebrates.`);
        logs.push(`James attacks from behind. <b>${dmg} damage!!</b>`);
      } else if (roll === 2) {
        enemy.stunned = true;
        logs.push(`James throws a handful of dirt directly into the ${enemy.name}'s face.`);
        logs.push(`The ${enemy.name} can't see anything. <b>It skips its next turn.</b>`);
      } else if (roll === 3) {
        // Enemy attacks itself — scan bonus doesn't apply here (it punched itself)
        const selfDmg = rand(Math.floor(enemy.attack * 0.6), enemy.attack);
        enemy.hp = Math.max(0, enemy.hp - selfDmg);
        enemy.scanned = false;
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
    // Guard reduction applies to Leo (the one actually taking the hit)
    const leoGuard = CHARACTERS.leo.guard;
    const leoReduction = leoGuard / (leoGuard + 20);
    const leoDmg = Math.max(1, Math.floor(dmg * (1 - leoReduction)));
    logs.push(pick(enemy.attackLines));
    logs.push(`Leo steps in front of ${CHARACTERS[target].name}! <b>Leo takes ${leoDmg} damage instead.</b>`);
    party.leo.hp = Math.max(0, party.leo.hp - leoDmg);
    battleState.takeHitActive = false;
  } else {
    battleState.takeHitActive = false;
    logs.push(pick(enemy.attackLines));

    // Speed-based passive dodge before applying damage
    const targetSpeed = CHARACTERS[target].speed;
    if (Math.random() < targetSpeed * 0.01) {
      logs.push(`${CHARACTERS[target].name} sidesteps at the last second — <b>miss!</b>`);
      return logs;
    }

    // Guard-based damage reduction
    const targetGuard = CHARACTERS[target].guard;
    const guardReduction = targetGuard / (targetGuard + 20);
    dmg = Math.max(1, Math.floor(dmg * (1 - guardReduction)));

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
