import { useEffect, useState } from "react";
import { serverNow } from "@/lib/serverClock";
// Remaining seconds until a server-provided ISO end time (resynced each tick, no drift).
export function useCountdown(endsAt) {
  const calc = () => (endsAt ? Math.max(0, Math.ceil((Date.parse(endsAt) - serverNow()) / 1000)) : null);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    if (!endsAt) return;
    const t = setInterval(() => setLeft(calc()), 250);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}
