const fs = require("fs");
const path = require("path");

const root = process.cwd();
const sourceDocs = path.join(root, "docs");
const output = path.join(root, "public");
const outputDocs = path.join(output, "docs");
const prototypeEntry = "/docs/prototypes/p0/index.html";

function copyRecursive(source, destination) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const item of fs.readdirSync(source)) {
      copyRecursive(path.join(source, item), path.join(destination, item));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

if (!fs.existsSync(sourceDocs)) {
  throw new Error("docs directory is required for the static Vercel prototype build");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
copyRecursive(sourceDocs, outputDocs);

fs.writeFileSync(
  path.join(output, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0; url=${prototypeEntry}" />
  <title>ChainTrace P0 Prototype</title>
</head>
<body>
  <p>Opening <a href="${prototypeEntry}">ChainTrace P0 Prototype</a>...</p>
</body>
</html>
`
);

console.log(`Prepared static Vercel output at ${path.relative(root, output)}`);
console.log(`Prototype entry: ${prototypeEntry}`);
