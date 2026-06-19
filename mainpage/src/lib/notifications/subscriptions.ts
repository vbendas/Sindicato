const subscriptions = new Map<string, { email: string }[]>();

export function subscribe(caseId: string, email: string): boolean {
  const list = subscriptions.get(caseId) ?? [];
  if (list.some((s) => s.email === email)) return false;
  list.push({ email });
  subscriptions.set(caseId, list);
  return true;
}

export function unsubscribe(caseId: string, email: string): boolean {
  const list = subscriptions.get(caseId);
  if (!list) return false;
  const idx = list.findIndex((s) => s.email === email);
  if (idx === -1) return false;
  list.splice(idx, 1);
  if (list.length === 0) subscriptions.delete(caseId);
  return true;
}

export function getSubscribers(caseId: string): { email: string }[] {
  return subscriptions.get(caseId) ?? [];
}
