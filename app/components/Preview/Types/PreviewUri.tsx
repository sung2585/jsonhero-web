import { JSONStringType } from "@jsonhero/json-infer-types/lib/@types";
import { useEffect, useState } from "react";
import { Body } from "~/components/Primitives/Body";
import { PreviewBox } from "../PreviewBox";
import { PreviewResult } from "./preview.types";
import { PreviewUriElement } from "./PreviewUriElement";

export type PreviewUriProps = {
  value: string;
  type: JSONStringType;
};

export function PreviewUri(props: PreviewUriProps) {
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const encodedUri = encodeURIComponent(props.value);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/actions/getPreview/${encodedUri}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setPreviewResult(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewResult({ error: "Unable to preview this URL" });
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [encodedUri]);

  if (loading) {
    return (
      <PreviewBox>
        <Body className="h-96 animate-pulse bg-slate-300 dark:text-slate-300 dark:bg-slate-500 flex justify-center items-center">
          Loading…
        </Body>
      </PreviewBox>
    );
  }

  if (!previewResult) {
    return null;
  }

  return (
    <div>
      {typeof previewResult === "string" ? (
        <PreviewBox>
          <Body>
            <span
              dangerouslySetInnerHTML={{ __html: previewResult }}
            ></span>
          </Body>
        </PreviewBox>
      ) : "error" in previewResult ? (
        <PreviewBox>
          <Body>{previewResult.error}</Body>
        </PreviewBox>
      ) : (
        <PreviewUriElement info={previewResult} />
      )}
    </div>
  );
}
