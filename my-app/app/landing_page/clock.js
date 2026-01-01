"use client";
import { useEffect, useState } from "react";

function useTime() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick(); // set immediately after mount
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Clock() {
  const time = useTime();
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (!time) return <p suppressHydrationWarning>--:--:--</p>;

  return (
    <div>
      <p suppressHydrationWarning>{time} {timeZone}</p>
    </div>
  );
}
