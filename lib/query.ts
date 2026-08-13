export function queryFrom(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const resolved = Array.isArray(value) ? value[0] : value;
    if (resolved) params.set(key, resolved);
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}
