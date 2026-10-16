export type SizeClass = "small" | "medium" | "large" | "oversized";
export type FileClass = { semantic: boolean; secretDetection: boolean; reason: "relevant" | "binary" | "minified" | "vendored" | "generated" | "lockfile" };

const BINARY_EXTENSIONS = new Set("png jpg jpeg gif webp ico icns pdf zip gz tgz bz2 7z rar jar wasm class exe dll so dylib bin woff woff2 ttf otf eot mp3 mp4 mov avi webm sqlite db".split(" "));

export function classifyFile(file: { path: string; bytes: Uint8Array }): FileClass {
  const extension = file.path.split(".").at(-1)?.toLowerCase() ?? "";
  const head = file.bytes.subarray(0, 8192);
  if (BINARY_EXTENSIONS.has(extension) || head.includes(0)) return { semantic: false, secretDetection: true, reason: "binary" };
  if (file.path.split("/").some((part) => part === "vendor" || part === "third_party" || part === "node_modules")) {
    return { semantic: false, secretDetection: true, reason: "vendored" };
  }
  if (file.path.endsWith(".lock") || file.path.endsWith("-lock.json") || file.path.endsWith(".lock.json")) {
    return { semantic: false, secretDetection: true, reason: "lockfile" };
  }
  if (file.path.includes(".min.") || hasLongLine(file.bytes)) return { semantic: false, secretDetection: true, reason: "minified" };
  if (generated(file.bytes)) return { semantic: false, secretDetection: true, reason: "generated" };
  return { semantic: true, secretDetection: true, reason: "relevant" };
}

export function classifySize(files: { semantic: boolean; changedLines: number; bytes: number }[]): SizeClass {
  const relevant = files.filter((file) => file.semantic);
  const lines = relevant.reduce((sum, file) => sum + file.changedLines, 0);
  const bytes = relevant.reduce((sum, file) => sum + file.bytes, 0);
  if (relevant.length <= 10 && lines <= 500 && bytes <= 100 * 1024) return "small";
  if (relevant.length <= 30 && lines <= 1500 && bytes <= 500 * 1024) return "medium";
  if (relevant.length <= 75 && lines <= 5000 && bytes <= 2 * 1024 * 1024) return "large";
  return "oversized";
}

function hasLongLine(bytes: Uint8Array): boolean {
  let run = 0;
  for (const value of bytes) {
    if (value === 10) run = 0;
    else if (++run > 1000) return true;
  }
  return false;
}

function generated(bytes: Uint8Array): boolean {
  const text = new TextDecoder().decode(bytes.subarray(0, 4096)).split("\n").slice(0, 40).join("\n");
  return /@generated|code generated|do not edit/i.test(text);
}
