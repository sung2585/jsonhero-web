const fs = require("fs");
const path = require("path");

const buildDir = path.resolve(__dirname, "../public/build");

// Find manifest, entry.client, and CSS files
const manifestFiles = fs.readdirSync(buildDir);
const manifestFile = manifestFiles.find((f) => f.startsWith("manifest-"));
const entryClient = manifestFiles.find((f) => f.startsWith("entry.client-"));
const tailwindCss = (() => {
  const assetsDir = path.join(buildDir, "_assets");
  if (!fs.existsSync(assetsDir)) return null;
  return fs.readdirSync(assetsDir).find((f) => f.startsWith("tailwind-"));
})();

if (!entryClient) {
  console.error("Could not find entry.client file in", buildDir);
  process.exit(1);
}

// Read manifest to discover all route modules
let routeModules = {};
if (manifestFile) {
  const manifestContent = fs.readFileSync(
    path.join(buildDir, manifestFile),
    "utf-8"
  );
  const manifestMatch = manifestContent.match(
    /window\.__remixManifest\s*=\s*({.*?});$/s
  );
  if (manifestMatch) {
    try {
      const manifest = JSON.parse(manifestMatch[1]);
      if (manifest.routes) {
        const imports = Object.keys(manifest.routes).map((routeId, idx) => {
          const route = manifest.routes[routeId];
          return `import * as route${idx} from ${JSON.stringify(route.module)};`;
        });
        const assignments = Object.keys(manifest.routes)
          .map((routeId, idx) => `${JSON.stringify(routeId)}:route${idx}`)
          .join(",");
        routeModules = {
          importCode: imports.join("\n"),
          assignCode: `window.__remixRouteModules = {${assignments}};`,
        };
      }
    } catch (e) {
      console.warn("Failed to parse manifest:", e.message);
    }
  }
}

const routeModuleScript =
  routeModules.importCode && routeModules.assignCode
    ? `\n<script type="module">\n${routeModules.importCode}\nwindow.__remixContext = { appState: {} };\n${routeModules.assignCode}\n</script>`
    : `<script type="module">window.__remixContext = { appState: {} }; window.__remixRouteModules = {};</script>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>JSON Hero - a beautiful JSON viewer for the web</title>
  <meta name="description" content="JSON Hero makes reading and understand JSON files easy by giving you a clean and beautiful UI packed with extra features." />
  ${tailwindCss ? `<link rel="stylesheet" href="/build/_assets/${tailwindCss}" />` : ""}
</head>
<body>
  <div id="root"></div>
  ${manifestFile ? `<script type="module" src="/build/${manifestFile}"></script>` : ""}
  ${routeModuleScript}
  <script defer type="module" src="/build/${entryClient}"></script>
</body>
</html>
`;

const outputPath = path.resolve(__dirname, "../public/index.html");
fs.writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
