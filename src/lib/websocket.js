import { WS_BASE_URL } from "./config";
import { tokenStorage } from "./tokenStorage";

// Native WebSocket client with auto-reconnect (exponential backoff).
// Auth: JWT passed as ?token= query param (common with Django Channels middleware).
export function createSocket(path, { onMessage, onStatus }) {
  let ws = null;
  let attempts = 0;
  let closedByUser = false;
  let timer = null;

  const connect = () => {
    const token = tokenStorage.getAccess();
    const url = `${WS_BASE_URL}${path}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    onStatus?.("connecting");
    ws = new WebSocket(url);
    ws.onopen = () => { attempts = 0; onStatus?.("open"); };
    ws.onmessage = (e) => {
      try { onMessage?.(JSON.parse(e.data)); } catch { /* ignore malformed */ }
    };
    ws.onerror = () => onStatus?.("error");
    ws.onclose = () => {
      if (closedByUser) return onStatus?.("closed");
      onStatus?.("reconnecting");
      const delay = Math.min(1000 * 2 ** attempts++, 15000);
      timer = setTimeout(connect, delay);
    };
  };
  connect();

  return {
    send: (type, payload = {}) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type, payload })),
    close: () => { closedByUser = true; clearTimeout(timer); ws?.close(); },
  };
}
