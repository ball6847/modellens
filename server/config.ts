export interface Config {
  port: number;
  apiFile: string;
  apiRemote: string;
  skipSync: boolean;
  syncInterval: number;
}

export function loadConfig(): Config {
  return {
    port: parseInt(Deno.env.get("PORT") || "3000", 10),
    apiFile: Deno.env.get("API_FILE") || "api.json",
    apiRemote: Deno.env.get("API_REMOTE") || "https://models.dev/api.json",
    skipSync: Deno.env.get("SKIP_SYNC") === "true",
    syncInterval: parseInt(Deno.env.get("SYNC_INTERVAL") || "300", 10) * 1000,
  };
}
