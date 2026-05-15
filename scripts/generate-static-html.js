const fs = require("fs");
const path = require("path");

const buildDir = path.resolve(__dirname, "../public/build");

// Read the manifest to find entry.client and CSS files
const manifestFiles = fs.readdirSync(buildDir);
const manifest = manifestFiles.find((f) => f.startsWith("manifest-"));
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
  ${manifest ? `<script type="module" src="/build/${manifest}"></script>` : ""}
  <script defer type="module" src="/build/${entryClient}"></script>
</body>
</html>
`;

const outputPath = path.resolve(__dirname, "../public/index.html");
fs.writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
