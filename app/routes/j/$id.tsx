import { Outlet, useParams } from "remix";
import { useEffect, useState } from "react";
import { getDocument, JSONDocument } from "~/jsonDoc.client";
import { JsonDocProvider } from "~/hooks/useJsonDoc";
import { JsonProvider } from "~/hooks/useJson";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { InfoPanel } from "~/components/InfoPanel";
import Resizable from "~/components/Resizable";
import { SideBar } from "~/components/SideBar";
import { JsonColumnViewProvider } from "~/hooks/useJsonColumnView";
import { JsonSchemaProvider } from "~/hooks/useJsonSchema";
import { JsonView } from "~/components/JsonView";
import safeFetch from "~/utilities/safeFetch";
import { JsonTreeViewProvider } from "~/hooks/useJsonTree";
import { JsonSearchProvider } from "~/hooks/useJsonSearch";
import { LargeTitle } from "~/components/Primitives/LargeTitle";
import { ExtraLargeTitle } from "~/components/Primitives/ExtraLargeTitle";
import { Body } from "~/components/Primitives/Body";
import { PageNotFoundTitle } from "~/components/Primitives/PageNotFoundTitle";
import { SmallSubtitle } from "~/components/Primitives/SmallSubtitle";
import { Logo } from "~/components/Icons/Logo";
import { getRandomUserAgent } from "~/utilities/getRandomUserAgent";

type LoadState =
  | { status: "loading" }
  | { status: "found"; doc: JSONDocument; json: unknown }
  | { status: "not-found" }
  | { status: "error"; message: string };

export default function JsonDocumentRoute() {
  const params = useParams();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!params.id) {
      setLoadState({ status: "not-found" });
      return;
    }

    const localDoc = getDocument(params.id);

    if (!localDoc) {
      setLoadState({ status: "not-found" });
      return;
    }

    if (localDoc.type === "url") {
      safeFetch(localDoc.url, {
        headers: { "User-Agent": getRandomUserAgent() },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json) => {
          setLoadState({ status: "found", doc: localDoc, json });
        })
        .catch((err) => {
          setLoadState({
            status: "error",
            message: `Failed to fetch ${localDoc.url}: ${err.message}`,
          });
        });
    } else {
      try {
        const json = JSON.parse(localDoc.contents);
        setLoadState({ status: "found", doc: localDoc, json });
      } catch {
        setLoadState({ status: "error", message: "Invalid JSON in document" });
      }
    }
  }, [params.id]);

  if (loadState.status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-indigo-900">
        <div className="text-center text-white">
          <ExtraLargeTitle>Loading...</ExtraLargeTitle>
        </div>
      </div>
    );
  }

  if (loadState.status === "not-found") {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[rgb(56,52,139)]">
        <div className="w-2/3">
          <div className="text-center text-lime-300">
            <Logo />
            <PageNotFoundTitle className="text-center leading-tight">
              404
            </PageNotFoundTitle>
          </div>
          <div className="text-center leading-snug text-white">
            <ExtraLargeTitle className="text-slate-200 mb-8">
              <b>Sorry</b>! Document not found...
            </ExtraLargeTitle>
            <SmallSubtitle className="text-slate-200 mb-8">
              We couldn't find the document
            </SmallSubtitle>
            <a
              href="/"
              className="mx-auto w-24 bg-lime-500 text-slate-900 text-lg font-bold px-5 py-1 rounded-sm uppercase whitespace-nowrap cursor-pointer opacity-90 hover:opacity-100 transition"
            >
              HOME
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[rgb(56,52,139)]">
        <div className="w-2/3">
          <div className="text-center text-lime-300">
            <Logo />
          </div>
          <div className="text-center leading-snug text-white">
            <ExtraLargeTitle className="text-slate-200 mb-8">
              <b>Sorry</b>! Something went wrong...
            </ExtraLargeTitle>
            <SmallSubtitle className="text-slate-200 mb-8">
              {loadState.message}
            </SmallSubtitle>
            <a
              href="/"
              className="mx-auto w-24 bg-lime-500 text-slate-900 text-lg font-bold px-5 py-1 rounded-sm uppercase whitespace-nowrap cursor-pointer opacity-90 hover:opacity-100 transition"
            >
              HOME
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { doc, json } = loadState;

  return (
    <JsonDocProvider doc={doc} key={doc.id}>
      <JsonProvider initialJson={json}>
        <JsonSchemaProvider>
          <JsonColumnViewProvider>
            <JsonSearchProvider>
              <JsonTreeViewProvider overscan={25}>
                <div className="h-screen flex flex-col sm:overflow-hidden">
                    <Header />
                    <div className="bg-slate-50 flex-grow transition dark:bg-slate-900 overflow-y-auto">
                      <div className="main-container flex justify-items-stretch h-full">
                        <SideBar />
                        <JsonView>
                          <Outlet />
                        </JsonView>

                        <Resizable
                          isHorizontal={true}
                          initialSize={500}
                          minimumSize={280}
                          maximumSize={900}
                        >
                          <div className="info-panel flex-grow h-full">
                            <InfoPanel />
                          </div>
                        </Resizable>
                      </div>
                    </div>

                    <Footer />
                  </div>
              </JsonTreeViewProvider>
            </JsonSearchProvider>
          </JsonColumnViewProvider>
        </JsonSchemaProvider>
      </JsonProvider>
    </JsonDocProvider>
  );
}
