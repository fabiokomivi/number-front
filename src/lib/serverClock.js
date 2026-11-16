// Offset between server and client clocks, updated from server_time in messages.
let offset = 0;
export const syncServerTime = (serverIso) => {
  const t = Date.parse(serverIso);
  if (!Number.isNaN(t)) offset = t - Date.now();
};
export const serverNow = () => Date.now() + offset;
