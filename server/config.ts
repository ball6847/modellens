export interface Config {
  port: number;
  apiFile: string;
  apiRemote: string;
  skipSync: boolean;
}

export function loadConfig(): Config {
  return {
    port: parseInt(Deno.env.get("PORT") || "3000", 10),
    apiFile: Deno.env.get("API_FILE") || "api.json",
    apiRemote: Deno.env.get("API_REMOTE") || "https://models.dev/api.json",
    skipSync: Deno.env.get("SKIP_SYNC") === "true",
  };
}
