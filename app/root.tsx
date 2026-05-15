import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "remix";
import type { MetaFunction } from "remix";
import clsx from "clsx";
import {
  NonFlashOfWrongThemeEls,
  Theme,
  ThemeProvider,
  useTheme,
} from "~/components/ThemeProvider";

import openGraphImage from "~/assets/images/opengraph.png";

export const meta: MetaFunction = ({ location }) => {
  const description =
    "JSON Hero makes reading and understand JSON files easy by giving you a clean and beautiful UI packed with extra features.";
  return {
    title: "JSON Hero - a beautiful JSON viewer for the web",
    viewport: "width=device-width,initial-scale=1",
    description,
    "og:image": `https://jsonhero.io${openGraphImage}`,
    "og:url": `https://jsonhero.io${location.pathname}`,
    "og:title": "JSON Hero - A beautiful JSON viewer",
    "og:description": description,
    "twitter:image": `https://jsonhero.io${openGraphImage}`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@json_hero",
    "twitter:site": "@json_hero",
    "twitter:title": "JSON Hero",
    "twitter:description": description,
  };
};

import styles from "./tailwind.css";
import { StarCountProvider } from "./components/StarCountProvider";
import { PreferencesProvider } from "~/components/PreferencesProvider";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

function App() {
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(theme)} />
      </head>
      <body className="overscroll-none">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const location = useLocation();

  // Force dark mode on the homepage
  const forceDarkMode = location.pathname === "/";

  return (
    <ThemeProvider themeOverride={forceDarkMode ? "dark" : undefined}>
      <PreferencesProvider>
        <StarCountProvider>
          <App />
        </StarCountProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
