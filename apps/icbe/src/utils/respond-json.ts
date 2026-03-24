type JsonLike = Record<string, unknown>;

export function respondWithJSON<T extends JsonLike>(
  data: T,
): { response: Response; data: T } {
  const response = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
  return { response, data };
}
