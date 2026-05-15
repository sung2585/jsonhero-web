import { useEffect } from "react";
import { useNavigate, useSearchParams } from "remix";
import safeFetch from "~/utilities/safeFetch";
import { createFromRawJson, createFromUrl } from "~/jsonDoc.client";
import { LargeTitle } from "~/components/Primitives/LargeTitle";
import { Body } from "~/components/Primitives/Body";

export default function NewRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const jsonUrl = searchParams.get("url");
    const base64EncodedJson = searchParams.get("j");

    if (jsonUrl) {
      fetchFromUrl(jsonUrl, navigate);
    } else if (base64EncodedJson) {
      try {
        const decoded = atob(base64EncodedJson);
        const doc = createFromRawJson("Untitled", decoded);
        navigate(`/j/${doc.id}`);
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-indigo-900">
      <div className="text-center text-white">
        <LargeTitle>Loading...</LargeTitle>
        <Body>Fetching JSON document</Body>
      </div>
    </div>
  );
}

async function fetchFromUrl(urlStr: string, navigate: ReturnType<typeof useNavigate>) {
  try {
    const url = new URL(urlStr);
    const response = await safeFetch(url.href);
    if (!response.ok) {
      navigate("/");
      return;
    }
    const json = await response.json();
    const doc = createFromRawJson(url.hostname, JSON.stringify(json));
    navigate(`/j/${doc.id}`);
  } catch {
    navigate("/");
  }
}
