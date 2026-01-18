"use client";
import { useEffect, useState } from "react";

function useTime() {
  const [time, setTime] = useState<string | null>(null);

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
  const [timeZone, setTimeZone] = useState<string>("");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (!time) return <p suppressHydrationWarning className="text-6xl font-bold">--:--:--</p>;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p suppressHydrationWarning className="text-6xl md:text-8xl font-bold text-white">
        {time}
      </p>
      <p className="text-xl md:text-2xl text-gray-400">
        {timeZone}
      </p>
    </div>
  );
}
