// ─── Speakers ────────────────────────────────────────────────────────────────

const SPEAKERS = {
  leo:    { name: 'Leo',    color: '#f4a843' },
  walter: { name: 'Walter', color: '#4fc3f7' },
  james:  { name: 'James',  color: '#81c784' },
  moth:   { name: 'Moth',   color: '#c4a882' },  // before James names her
  dusty:  { name: 'Dusty',  color: '#c4a882' },  // after
};

// ─── Scenes ──────────────────────────────────────────────────────────────────
// speaker: null  → narrator (no name shown, text in italics)
// speaker: 'key' → character name + color from SPEAKERS

const SCENES = {

  prologue: [
    // The frozen moment
    { speaker: null,     text: 'The kitchen is exactly as it was a second ago. Toast hanging in the air. Dad mid-sentence. Mom reaching for her coffee. The dog\'s back leg frozen mid-scratch.' },
    { speaker: null,     text: 'Nothing is moving. Not the clock. Not the curtains. Not the birds outside the window.' },
    { speaker: null,     text: 'Nothing, except the three of them.' },
    { speaker: 'james',  text: '...is the toast just floating?' },
    { speaker: 'leo',    text: 'Something\'s wrong.' },
    { speaker: 'walter', text: 'Something is <b>significantly</b> wrong.' },

    // They explore
    { speaker: null,     text: 'They check every room. They check the street. A leaf is hanging in the air three feet off the ground. A car is stopped mid-turn. No wind. No sound at all.' },
    { speaker: 'james',  text: 'This is the coolest thing that has ever happened to us.' },
    { speaker: 'leo',    text: 'James, this is not cool.' },
    { speaker: 'james',  text: 'It\'s a little cool.' },
    { speaker: 'walter', text: 'It\'s quite cool, actually. Structurally speaking.' },
    { speaker: 'leo',    text: 'It is not — we are not doing this right now.' },

    // Dusty appears
    { speaker: null,     text: 'Back in the kitchen, something moves. A small moth, picking its way across the table with the careful air of something that has been waiting for a very long time.' },
    { speaker: 'moth',   text: 'I have been on this table for eleven minutes. I am only now getting your attention.' },
    { speaker: 'james',  text: 'THE MOTH IS TALKING.' },
    { speaker: 'moth',   text: 'Yes. I am aware.' },
    { speaker: 'walter', text: 'How are you doing that.' },
    { speaker: 'moth',   text: 'I was sent. Before you were born — before your father was born — I was sent, because something was coming and someone had to carry the message. That someone was me. I have been carrying it since. Would you like to hear it, or shall we continue with the shouting?' },

    // The message
    { speaker: null,     text: 'They listen.' },
    { speaker: 'moth',   text: 'The Dreamer has been taken. He has been dreaming the world\'s dreams since before anyone can remember. While he dreams, the world wakes. Without him, it freezes — exactly as you see. You have until sunrise.' },
    { speaker: 'leo',    text: 'Who took him?' },
    { speaker: 'moth',   text: 'The Nightmare King. He lives in the space between sleeping and waking. He has been patient. He chose his moment.' },
    { speaker: 'walter', text: 'And we\'re supposed to do what, exactly.' },
    { speaker: 'moth',   text: 'Get him back. You can cross because you are children, and children still remember how. That is not a metaphor. It is simply true.' },
    { speaker: 'leo',    text: 'How do we get in?' },
    { speaker: 'moth',   text: 'I can open the door. I have been waiting to open the door for a very long time.' },

    // James names her
    { speaker: 'james',  text: 'What\'s your name?' },
    { speaker: 'moth',   text: 'I have carried this message through—' },
    { speaker: 'james',  text: 'Dusty.' },
    { speaker: 'moth',   text: 'That is not my name.' },
    { speaker: 'james',  text: 'Okay, Dusty. Where\'s the door?' },
    { speaker: 'dusty',  text: '...' },

    // The dream door
    { speaker: null,     text: 'Dusty leads them to the closet at the back of the hall. She lands on the handle. The door opens onto somewhere else — not the coats and boots, but a dim amber light and the smell of old leaves.' },
    { speaker: 'leo',    text: 'Is it safe?' },
    { speaker: 'dusty',  text: 'No. But you are needed. Those are different things.' },
    { speaker: null,     text: 'Leo looks at his brothers. Walter has his notebook out already. James is halfway through the door.' },
    { speaker: null,     text: 'They go through. The door closes behind them.' },
    { speaker: null,     text: 'The closet is just a closet again.' },
  ],

};
