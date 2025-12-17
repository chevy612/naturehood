"use client";
import {useState, useEffect} from "react";

function useTime(){
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return time;
}

export default function Clock() {
  const time = useTime();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div >
      <p>{time} {timeZone}</p>
    </div>
  );
}