const DEFAULT_REMOTE_URL = "https://models.dev/api.json";

async function getRemoteETag(url: string): Promise<string> {
  const resp = await fetch(url, { method: "HEAD" });
  if (!resp.ok) {
    throw new Error(`HEAD request returned status ${resp.status}`);
  }
  const etag = resp.headers.get("ETag");
  if (!etag) {
    throw new Error("ETag header not found");
  }
  return etag.replace(/"/g, "");
}

async function downloadFile(localPath: string, url: string, etag: string): Promise<void> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`GET request returned status ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  await Deno.mkdir(dirname(localPath), { recursive: true });
  await Deno.writeFile(localPath, new Uint8Array(data));

  const etagFile = localPath + ".etag";
  try {
    await Deno.writeTextFile(etagFile, etag);
  } catch {
    console.warn("failed to write ETag file");
  }
}

function dirname(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || ".";
}

export async function sync(localPath: string, remoteURL?: string): Promise<void> {
  const url = remoteURL || DEFAULT_REMOTE_URL;

  let localETag = "";
  try {
    localETag = (await Deno.readTextFile(localPath + ".etag")).trim();
  } catch {
    // no etag file yet
  }

  let remoteETag: string;
  try {
    remoteETag = await getRemoteETag(url);
  } catch (err) {
    try {
      await Deno.stat(localPath);
      console.warn(`failed to check remote version, using local file: ${err}`);
      return;
    } catch {
      throw new Error(`failed to check remote version and no local file: ${err}`);
    }
  }

  try {
    await Deno.stat(localPath);
  } catch {
    console.log(`Local file not found, downloading from remote: ${url}`);
    await downloadFile(localPath, url, remoteETag);
    return;
  }

  if (localETag !== "" && localETag === remoteETag) {
    console.log(`Local file is up to date (ETag match), skipping download`);
    return;
  }

  console.log(`Remote file has changed, downloading (local_etag=${localETag}, remote_etag=${remoteETag})`);
  await downloadFile(localPath, url, remoteETag);
}
