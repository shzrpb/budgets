"use client";

import { useState } from "react";

const BUCKETS = [
  { start: 7, end: 12, phrases: ["Good morning", "Morning!", "Rise and shine"] },
  { start: 12, end: 17, phrases: ["How's it going?", "Hey there", "Midday check-in"] },
  { start: 17, end: 24, phrases: ["Good evening", "Evening!", "Winding down?"] },
  { start: 0, end: 7, phrases: ["Up late?", "Burning the midnight oil?", "Can't sleep?"] },
];

function pickGreeting(hour: number) {
  const bucket = BUCKETS.find((b) => hour >= b.start && hour < b.end) ?? BUCKETS[0];
  return bucket.phrases[Math.floor(Math.random() * bucket.phrases.length)];
}

export default function Greeting() {
  // Depends on the viewer's local clock and rotates randomly, so it will
  // legitimately differ between the server render and the client render.
  const [text] = useState(() => pickGreeting(new Date().getHours()));

  return (
    <h1 className="text-lg font-semibold text-stone-900" suppressHydrationWarning>
      {text}
    </h1>
  );
}
