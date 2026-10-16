export function health(): Response {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
}

export function route(method: string, path: string): Response | undefined {
  if (method === "GET" && path === "/health") return health();
  return undefined;
}
