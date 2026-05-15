import { json, LoaderFunction } from "remix";
import invariant from "tiny-invariant";
import { getDocument } from "~/jsonDoc.client";
import safeFetch from "~/utilities/safeFetch";

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, "expected params.id");

  const doc = getDocument(params.id);

  if (!doc) {
    throw new Response("Not Found", { status: 404 });
  }

  if (doc.type === "url") {
    const jsonResponse = await safeFetch(doc.url);
    return jsonResponse.json();
  } else {
    return json(JSON.parse(doc.contents));
  }
};
