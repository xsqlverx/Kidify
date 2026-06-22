// Daily affirmations for her. One rotates in per day (by day-of-year).
// She can save the ones that land, building a little collection.

export type Affirmation = {
  text: string;
  emoji: string;
};

export const AFFIRMATIONS: Affirmation[] = [
  { emoji: "🌸", text: "you are not too much. you are exactly enough, exactly as you are." },
  { emoji: "🤍", text: "your softness is not a weakness. it is the rarest, bravest thing." },
  { emoji: "✨", text: "you are allowed to take up space. the room is better with you in it." },
  { emoji: "🌷", text: "you do not have to earn rest. you are worthy of it just by breathing." },
  { emoji: "🫧", text: "your feelings are valid. all of them. even the messy, contradictory ones." },
  { emoji: "🌙", text: "you are someone's favourite person. (it's me. hi. it's me.)" },
  { emoji: "🧸", text: "you are allowed to be a work in progress and still be deeply loved." },
  { emoji: "💗", text: "the way you love is not a flaw. it is the whole point of you." },
  { emoji: "☕", text: "you are not behind. you are on your own timeline, and it is beautiful." },
  { emoji: "☁️", text: "you are allowed to change your mind. that's growth, not inconsistency." },
  { emoji: "🩷", text: "your body is not a problem to be solved. it is a home that carries you." },
  { emoji: "🌻", text: "you are the kind of person strangers feel safe around. that means something." },
  { emoji: "🫶", text: "you are not hard to love. you are just loved by someone paying attention." },
  { emoji: "🕯️", text: "you are a soft place in a hard world. don't let anyone make you hard." },
  { emoji: "🌿", text: "you are growing, even on the days you can't see it. roots first." },
];
