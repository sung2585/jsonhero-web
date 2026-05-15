import { customRandom } from "nanoid";

export type RawJsonDocument = {
  id: string;
  title: string;
  type: "raw";
  contents: string;
  readOnly: boolean;
};

export type UrlJsonDocument = {
  id: string;
  title: string;
  type: "url";
  url: string;
  readOnly: boolean;
};

export type JSONDocument = RawJsonDocument | UrlJsonDocument;

const STORAGE_PREFIX = "jsonhero:doc:";
const MAX_DOCS = 50;

function createId(): string {
  const nanoid = customRandom(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12,
    (bytes: number): Uint8Array => {
      const array = new Uint8Array(bytes);
      crypto.getRandomValues(array);
      return array;
    }
  );
  return nanoid();
}

export function saveDocument(doc: JSONDocument): void {
  try {
    const key = STORAGE_PREFIX + doc.id;
    localStorage.setItem(key, JSON.stringify(doc));

    // Maintain a recent docs index
    const recent = getRecentDocIds();
    const updated = [doc.id, ...recent.filter((id) => id !== doc.id)].slice(
      0,
      MAX_DOCS
    );
    localStorage.setItem(STORAGE_PREFIX + "_recent", JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save document to localStorage:", e);
  }
}

export function getDocument(slug: string): JSONDocument | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return undefined;
    return JSON.parse(raw) as JSONDocument;
  } catch {
    return undefined;
  }
}

export function deleteDocument(slug: string): void {
  localStorage.removeItem(STORAGE_PREFIX + slug);
}

export function getRecentDocIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + "_recent");
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function createFromRawJson(
  filename: string,
  contents: string,
  options?: { readOnly?: boolean }
): RawJsonDocument {
  const docId = createId();
  const doc: RawJsonDocument = {
    id: docId,
    type: "raw",
    contents,
    title: filename,
    readOnly: options?.readOnly ?? false,
  };
  saveDocument(doc);
  return doc;
}

export function createFromUrl(
  url: URL,
  title?: string
): UrlJsonDocument {
  const docId = createId();
  const doc: UrlJsonDocument = {
    id: docId,
    type: "url",
    url: url.href,
    title: title ?? url.hostname,
    readOnly: false,
  };
  saveDocument(doc);
  return doc;
}

export function createFromUrlOrRawJson(
  urlOrJson: string,
  title?: string
): JSONDocument {
  if (isUrl(urlOrJson)) {
    return createFromUrl(new URL(urlOrJson), title);
  }
  JSON.parse(urlOrJson); // validate JSON
  return createFromRawJson(title || "Untitled", urlOrJson);
}

function isUrl(possibleUrl: string): boolean {
  try {
    new URL(possibleUrl);
    return true;
  } catch {
    return false;
  }
}
