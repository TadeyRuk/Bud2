/** Debug-mode NDJSON logging: ingest + dev-server mirror (writes workspace debug-97fb0e.log). */
const INGEST = "http://127.0.0.1:7574/ingest/94092400-477a-4a06-a267-106d04813b25";
const SESSION_ID = "97fb0e";

export type AgentDebugPayload = {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

export function agentDebugLog(payload: AgentDebugPayload): void {
  const body = JSON.stringify({
    sessionId: SESSION_ID,
    ...payload,
    timestamp: Date.now(),
  });
  // #region agent log
  fetch(INGEST, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
    body,
  }).catch(() => {});
  if (import.meta.env.DEV) {
    fetch("/__agent-debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  }
  // #endregion
}
