const fs = require("fs");
const path = require("path");

const folder = path.join(
  __dirname,
  "assets/images/superapp"
);

const pulse = fs.readFileSync(
  path.join(folder, "pulse.svg"),
  "utf8"
);

const testsuite = fs.readFileSync(
  path.join(folder, "testsuite.svg"),
  "utf8"
);

fs.writeFileSync(
  path.join(folder, "svgContents.ts"),
  `export const pulseSvg = ${JSON.stringify(pulse)};
export const testsuiteSvg = ${JSON.stringify(testsuite)};
`,
  "utf8"
);

console.log("SVG içerikleri hazır.");