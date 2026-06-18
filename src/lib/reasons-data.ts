// "Reasons I Love You" — a deck of short, heartfelt reasons.
// One reveals per tap. She can keep flipping through them.
// (Admin-editable later via the backend; for now a fixed curated list.)

export type Reason = {
  emoji: string;
  text: string;
};

export const REASONS: Reason[] = [
  { emoji: "🌅", text: "the way you say 'good morning' like it's a real promise that the day will be okay." },
  { emoji: "🫶", text: "your hands. specifically, the way you hold my face in them when i'm being too much." },
  { emoji: "☕", text: "you make chai the way love is supposed to taste — patient, warm, a little too sweet." },
  { emoji: "🙈", text: "the face you make when you're pretending to be mad but you're already smiling." },
  { emoji: "🌧️", text: "you cry at the right things. that's not weakness, that's a whole superpower." },
  { emoji: "📚", text: "you read the ends of books first because you can't bear not knowing everyone's okay. same." },
  { emoji: "🌙", text: "your voice on the phone at 1am, when the whole world is asleep except us." },
  { emoji: "🧦", text: "you steal my hoodies and then act surprised when i want them back. keep them. they're yours." },
  { emoji: "✨", text: "you laugh at your own jokes before you even finish telling them. it's my favourite sound." },
  { emoji: "🌷", text: "you notice when a stranger looks sad. you always notice. most people never do." },
  { emoji: "📞", text: "you call your mother back. every single time. even when you're tired." },
  { emoji: "🧸", text: "the way you sleep — one hand under your cheek, like a kid. like trust in human form." },
  { emoji: "🫧", text: "you forgive fast. not because you forget, but because you'd rather be soft than right." },
  { emoji: "🎧", text: "you send me songs at 2pm that you've clearly been thinking about since morning." },
  { emoji: "🧷", text: "you remember the tiny things i said once, six months ago, and never brought up again." },
  { emoji: "🌻", text: "you turn towards the sun, always. even on the days you have to drag yourself there." },
  { emoji: "🤍", text: "you make me want to be the kind of person who deserves you. that's the whole thing, really." },
  { emoji: "🍿", text: "you rewatch the same comfort show for the 11th time instead of starting something new. icons only." },
  { emoji: "📒", text: "you keep a little list of things you're grateful for. i'm on it. you don't know i know." },
  { emoji: "🕯️", text: "you light a candle when the day is hard, like you're inviting something gentler in." },
  { emoji: "🚶", text: "you walk a little slower when you're with me, like you want the moment to last." },
  { emoji: "💌", text: "you still get shy when i compliment you, like you haven't figured out yet that i mean all of it." },
];
