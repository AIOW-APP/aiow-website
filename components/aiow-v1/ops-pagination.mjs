export function queuePageUrl(cursor, limit = 100) {
  if (!cursor || cursor.schemaKind !== "queue_cursor" || typeof cursor.createdAt !== "string" || typeof cursor.id !== "string") throw new TypeError("invalid queue cursor");
  const encoded = btoa(JSON.stringify(cursor)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return `/api/ops/leads?limit=${limit}&cursor=${encodeURIComponent(encoded)}`;
}

export function mergeQueuePage(current, page) {
  const items = [];
  const ids = new Set();
  for (const lead of [...current.items, ...page.items]) {
    if (ids.has(lead.id)) continue;
    ids.add(lead.id);
    items.push(lead);
  }
  return { ...current, items, counts: page.counts, nextCursor: page.nextCursor };
}