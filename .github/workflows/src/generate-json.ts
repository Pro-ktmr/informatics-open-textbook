import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadPageContents } from "./markdown-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const markdownDirPath = path.join(__dirname, "../../../");
const apisDirPath = path.join(markdownDirPath, "apis");
const pagesJsonPath = path.join(apisDirPath, "pages.json");

loadPageContents(markdownDirPath).then((pageContents) => {
  fs.mkdirSync(apisDirPath, { recursive: true });
  fs.writeFileSync(pagesJsonPath, JSON.stringify(pageContents, null, 2), "utf8");
});
