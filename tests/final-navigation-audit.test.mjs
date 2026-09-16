import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url);
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

function collectJavaScript(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) collectJavaScript(location, result);
    else if (entry.name.endsWith(".js")) result.push(location);
  }
  return result;
}

function routeExists(route) {
  if (route === "/") return fs.existsSync(new URL("../pages/index.js", import.meta.url));
  const relative = route.slice(1);
  return [
    `../pages/${relative}.js`,
    `../pages/${relative}/index.js`,
    `../public/${relative}`,
  ].some((candidate) => fs.existsSync(new URL(candidate, import.meta.url)));
}

test("all literal internal navigation destinations resolve to current pages", () => {
  const files = collectJavaScript(path.join(root.pathname, "pages"))
    .concat(collectJavaScript(path.join(root.pathname, "components")))
    .concat(collectJavaScript(path.join(root.pathname, "lib")));
  const patterns = [
    /\bhref\s*=\s*["'](\/[^"']*)["']/g,
    /\bhref\s*:\s*["'](\/[^"']*)["']/g,
    /window\.location\.href\s*=\s*["'](\/[^"']*)["']/g,
  ];
  const destinations = new Set();
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        if (!match[1].includes("${")) destinations.add(match[1].split(/[?#]/)[0] || "/");
      }
    }
  }
  for (const route of destinations) assert.ok(routeExists(route), `Broken internal destination: ${route}`);
});

test("legacy aliases and orphan prototype pages are absent", () => {
  for (const file of [
    "pages/ar-tools.js",
    "pages/student-dashboard.js",
    "pages/platform-inventory.js",
    "pages/blogs.js",
    "pages/profile.js",
    "pages/intro.js",
    "pages/qol-lexicon.js",
    "pages/smart-home.js",
  ]) assert.equal(fs.existsSync(new URL(`../${file}`, import.meta.url)), false, file);

  const sources = collectJavaScript(path.join(root.pathname, "pages"))
    .concat(collectJavaScript(path.join(root.pathname, "components")))
    .concat(collectJavaScript(path.join(root.pathname, "lib")))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(sources, /\/(ar-tools|student-dashboard|blogs|profile|intro|qol-lexicon|smart-home)(?:[?#/"']|$)/);
  assert.doesNotMatch(sources, /["']\/platform-inventory(?:[?#/"']|$)/);
});

test("Analyze returns to the selected entry context and preserves direct entry", () => {
  const analyze = read("pages/tools/analyze.js");
  assert.match(analyze, /sourceSection === LEARNING_PATH_SECTION/);
  assert.match(analyze, /href: "\/learning-center"/);
  assert.match(analyze, /sourceSection === RESEARCH_PATH_SECTION/);
  assert.match(analyze, /href: `\/research-planner#\$\{researchPathContext\.selectedPath\}`/);
  assert.match(analyze, /returnDestination \? \(/);
  assert.match(analyze, /<Link href="\/workspace">\{t\("nav\.workspace"\)\}<\/Link>/);
});

test("Platform inventory stays informational and platform navigation marks the active page", () => {
  const inventory = read("pages/platform/inventory.js");
  const toolList = inventory.slice(inventory.indexOf("ACTIVE_TOOLS.map"), inventory.indexOf("RESEARCH_AREAS.map"));
  assert.match(toolList, /<article/);
  assert.doesNotMatch(toolList, /<Link/);
  assert.match(read("components/PlatformShell.js"), /aria-current=\{isActive\(href\) \? "page" : undefined\}/);
  assert.match(inventory, /href="\/platform"/);
});

test("every user-facing page exposes a route out directly or through its shared shell", () => {
  const pages = collectJavaScript(path.join(root.pathname, "pages"))
    .filter((file) => !file.includes(`${path.sep}api${path.sep}`) && !path.basename(file).startsWith("_"));
  for (const file of pages) {
    const source = fs.readFileSync(file, "utf8");
    assert.match(source, /<Link\b|window\.location\.href|router\.(?:push|replace)|<PlatformShell\b|<Layout\b/, `No visible route out: ${file}`);
  }
});

test("tool documentation includes the complete release-candidate structure", () => {
  const documentation = read("pages/documentation/[tool].js");
  for (const key of ["purpose", "input", "output", "workflow", "commonErrors", "responsibility", "limitations", "references"])
    assert.match(documentation, new RegExp(`\\["${key}"`));
  assert.match(documentation, /href="\/platform\/references"/);
  assert.match(documentation, /href=\{tool\.route\}/);
  assert.match(documentation, /href="\/documentation"/);
});

test("Learning Center preserves progress when storage is available and fails safely when it is blocked", () => {
  const learning = read("pages/learning-center.js");
  assert.match(learning, /try \{[\s\S]*localStorage\.getItem\("lingualab-learning-progress"\)/);
  assert.match(learning, /try \{[\s\S]*localStorage\.setItem\([\s\S]*"lingualab-learning-progress"/);
  assert.match(learning, /Progress remains available for the current page session/);
});
