import { useEffect, useRef, useState } from "react";
import { createSocket } from "@/lib/websocket";
import { ENDPOINTS } from "@/lib/config";
import { syncServerTime } from "@/lib/serverClock";

// Subscribes to a room's Channels group. handlers: { EVENT_TYPE: (payload) => void, "*": (msg) => void }
export function useRoomSocket(roomId, handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;
  const [status, setStatus] = useState("connecting");
  useEffect(() => {
    if (!roomId) return;
    const socket = createSocket(ENDPOINTS.roomSocket(roomId), {
      onStatus: setStatus,
      onMessage: (msg) => {
        
        console.log(msg)
        const payload = msg.payload ?? msg.data ?? msg;
        if (payload?.server_time) syncServerTime(payload.server_time);
        ref.current[msg.type]?.(payload);
        ref.current["*"]?.(msg);
      },
    });
    return () => socket.close();
  }, [roomId]);
  return status;
}
