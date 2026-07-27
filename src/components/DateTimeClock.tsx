"use client";

import { useEffect, useState } from "react";

export default function DateTimeClock() {
  // Starts null and fills in after mount so the server-rendered markup
  // (which can't know the viewer's local clock) never has to match a
  // constantly-ticking value.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className="h-4" />;

  return (
    <div className="text-xs tabular-nums text-stone-400">
      {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      {" · "}
      {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" })}
    </div>
  );
}
