import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Writes one NDJSON line to workspace root — ingest alone may not persist to the Cursor workspace. */
function workspaceAgentDebugPlugin(): Plugin {
  return {
    name: "workspace-agent-debug-log",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use("/__agent-debug-log", (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8").trim();
            if (!raw) {
              res.statusCode = 400;
              res.end("empty body");
              return;
            }
            const line = `${raw}\n`;
            const rootLog = path.resolve(__dirname, "..", "debug-97fb0e.log");
            const budLog = path.resolve(__dirname, "debug-97fb0e.log");
            fs.appendFileSync(rootLog, line);
            try {
              fs.appendFileSync(budLog, line);
            } catch {
              /* ignore secondary path failures */
            }
            res.statusCode = 204;
            res.end();
          } catch (e) {
            res.statusCode = 500;
            res.end(String(e));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), workspaceAgentDebugPlugin()],
});
