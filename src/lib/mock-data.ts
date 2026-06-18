// Mock data for the Kidify prototype.
// Swap points are marked with TODO: REPLACE MOCK — see backend-setup.md section 8.

export type DailyMessage = {
  date: string; // YYYY-MM-DD
  title: string;
  body: string;
  signature: string;
  sticker?: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption: string;
  date: string;
};

export type ThankYouSection = {
  heading: string;
  body: string;
};

export type ThankYouContent = {
  intro: string;
  sections: ThankYouSection[];
};

// A small fixed set of daily messages. In production these come from MongoDB
// queued by date. For the prototype we rotate through these by day-of-year so
// there's always a "today" message available.
export const DAILY_MESSAGES: Omit<DailyMessage, "date">[] = [
  {
    title: "good morning, my love",
    body: "i woke up before my alarm today and the first thing i thought about was the little face you make when you're pretending to be annoyed but you're actually smiling. that's my favourite version of the whole world. have the softest day. drink your water. i'm right here, even when i'm not.",
    signature: "— always, me",
    sticker: "☀️",
  },
  {
    title: "a tiny reminder",
    body: "in case nobody has told you yet today: you are the kindest person in every room you walk into. you don't have to be loud about it. i notice. i always notice.",
    signature: "— yours",
    sticker: "🌷",
  },
  {
    title: "10 km feels like nothing",
    body: "they say distance is measured in kilometres but i'm pretty sure it's measured in how many times i reach for my phone hoping there's a message from you. (the answer is: constantly.)",
    signature: "— missing you less, because you're always with me",
    sticker: "🧸",
  },
  {
    title: "soft hours",
    body: "tonight, when it gets quiet, close your eyes and pretend my hand is in yours. i'll be doing the same. that counts. that counts so much.",
    signature: "— your person, every night",
    sticker: "🌙",
  },
  {
    title: "i keep a list",
    body: "of all the things i want to show you, cook for you, argue with you about, laugh at with you. the list is getting long. that's the whole point. we have time. we have so much time.",
    signature: "— patiently, eagerly, me",
    sticker: "✨",
  },
  {
    title: "you make me braver",
    body: "i didn't know i could be this version of myself until you looked at me like i was already enough. you do that. you hand people back to themselves, better. thank you for handing me back to me.",
    signature: "— grateful, every day",
    sticker: "💗",
  },
  {
    title: "tuesday",
    body: "nothing happened today. nothing at all. and somehow, because somewhere out there you existed in the same tuesday as me, it was a good one.",
    signature: "— me, who loves ordinary days with you",
    sticker: "🫧",
  },
  {
    title: "when you're tired",
    body: "and the world feels too loud and too bright and too much — put the phone down, drink something warm, and remember there is one person on this spinning rock who would choose you in every version of every universe, every single time. it's me. hi. it's me.",
    signature: "— always me",
    sticker: "🧷",
  },
  {
    title: "tiny love, big love",
    body: "i love you the way you love the first sip of morning chai. immediately. completely. before the day has even properly started. that's the size of it.",
    signature: "— your chai-person",
    sticker: "☕",
  },
  {
    title: "if you're reading this",
    body: "then today, of all the days, i want you to know that you are not too much. you are exactly enough. you have always been exactly enough. and anyone who made you feel otherwise was just scared of how much light you carry.",
    signature: "— who sees all of it, and stays",
    sticker: "🕯️",
  },
  {
    title: "ps",
    body: "i left the bear here so you'd never feel alone. pat its head for me. it counts. (i'm keeping a tally. don't ask.)",
    signature: "— soft & sneaky, me",
    sticker: "🐻",
  },
  {
    title: "the long version",
    body: "i could write you a thousand of these and it still wouldn't be the whole truth. the whole truth is bigger than words. it's a feeling. it's the way my chest goes quiet when i think of you. that's the whole truth. i'll keep trying to say it anyway.",
    signature: "— trying, always, me",
    sticker: "💌",
  },
];

export function getDailyMessage(date: Date = new Date()): DailyMessage {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const base = DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length];
  return {
    ...base,
    date: date.toISOString().slice(0, 10),
  };
}

export function getMessageForOffset(offset: number): DailyMessage {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return getDailyMessage(d);
}

// Gallery — uses generated placeholder images. Replace with Cloudinary URLs later.
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "g1",
    url: "/kidify/gallery-1.png",
    caption: "the day the sky matched your cheeks",
    date: "2024-08-12",
  },
  {
    id: "g2",
    url: "/kidify/bear-hero.png",
    caption: "your bear, on its very first day",
    date: "2024-09-01",
  },
  {
    id: "g3",
    url: "/kidify/garden.png",
    caption: "the garden we are still growing",
    date: "2024-09-15",
  },
  {
    id: "g4",
    url: "/kidify/gallery-1.png",
    caption: "you, mid-laugh, refusing to pose",
    date: "2024-10-02",
  },
  {
    id: "g5",
    url: "/kidify/bear-hero.png",
    caption: "the bear got a bow. your idea, obviously.",
    date: "2024-10-20",
  },
  {
    id: "g6",
    url: "/kidify/garden.png",
    caption: "rosie bloomed. you cried a little.",
    date: "2024-11-03",
  },
];

export const THANK_YOU_CONTENT: ThankYouContent = {
  intro:
    "this page exists because 'thank you' was never going to fit in a text message. so i built you a whole room for it. stay as long as you want.",
  sections: [
    {
      heading: "for the way you stay",
      body: "everyone else gets to see the version of me that performs. you get the one that's tired, and scared, and small — and you don't flinch. you just pull up a chair and sit with me like that's the most natural thing in the world. it isn't, for most people. it is, for you. thank you for the chair.",
    },
    {
      heading: "for holding me up",
      body: "there were days i was certain i would sink. you didn't rescue me with grand gestures. you did it with presence — a message at the right minute, a 'did you eat', a 'i'm here' that meant it. you held the floor under my feet without ever making me feel like i was heavy. that is a kind of love most people spend a lifetime not finding. i found it at 10 km. lucky doesn't begin to cover it.",
    },
    {
      heading: "for your softness",
      body: "the world tries so hard to make you hard and you just... won't. you keep being gentle with stray dogs and old people and me. that takes more courage than anything loud. thank you for refusing to go cold.",
    },
    {
      heading: "for choosing me, again",
      body: "i know it's a choice. every day, it's a choice. and every day you make it like it's easy. i will spend the rest of my life trying to be worthy of how easily you keep choosing me.",
    },
    {
      heading: "and one more thing",
      body: "none of this is a favour. it's not a debt. it's just — i love you, and 'thank you' is the smallest, truest word i have for it. so: thank you. for everything. for staying. for being you. for letting me be yours.",
    },
  ],
};
