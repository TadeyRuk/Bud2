import { get, set, del, keys } from "idb-keyval";

export type QueuedMutation = {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  blobKey?: string;
  createdAt: number;
};

const QUEUE_PREFIX = "bud_queue_";
const BLOB_PREFIX = "bud_blob_";

function queueKey(id: string) {
  return `${QUEUE_PREFIX}${id}`;
}

function blobKey(id: string) {
  return `${BLOB_PREFIX}${id}`;
}

export async function enqueue(mutation: Omit<QueuedMutation, "id" | "createdAt">, blob?: Blob): Promise<string> {
  const id = crypto.randomUUID();
  const entry: QueuedMutation = { ...mutation, id, createdAt: Date.now() };

  if (blob) {
    entry.blobKey = id;
    await set(blobKey(id), blob);
  }

  await set(queueKey(id), entry);
  return id;
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  return get(blobKey(id));
}

export async function dequeue(id: string): Promise<void> {
  await del(queueKey(id));
  await del(blobKey(id));
}

export async function peekAll(): Promise<QueuedMutation[]> {
  const allKeys = await keys();
  const queueKeys = (allKeys as string[]).filter((k) => k.startsWith(QUEUE_PREFIX));
  const entries: QueuedMutation[] = [];
  for (const k of queueKeys) {
    const entry = await get<QueuedMutation>(k);
    if (entry) entries.push(entry);
  }
  return entries.sort((a, b) => a.createdAt - b.createdAt);
}

export async function queueSize(): Promise<number> {
  const allKeys = await keys();
  return (allKeys as string[]).filter((k) => k.startsWith(QUEUE_PREFIX)).length;
}
