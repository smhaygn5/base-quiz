import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const directory = path.join(root, "app", "i18n", "catalogs");
const locales = ["tr", "es", "pt", "fr", "de", "ru", "ar", "zh", "ja", "ko"];
const english = JSON.parse(await fs.readFile(path.join(directory, "en.json"), "utf8"));
const messageKeys = Object.keys(english.messages);
let failed = false;
let expectedQuizKeys = null;

function placeholders(value) {
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)]
    .map((match) => match[1])
    .sort()
    .join(",");
}

for (const locale of locales) {
  const catalog = JSON.parse(
    await fs.readFile(path.join(directory, `${locale}.json`), "utf8"),
  );
  const missingMessages = messageKeys.filter((key) => !catalog.messages[key]);
  const invalidPlaceholders = messageKeys.filter(
    (key) => placeholders(english.messages[key]) !== placeholders(catalog.messages[key] || ""),
  );
  const invalidQuestions = Object.entries(catalog.quiz || {}).filter(
    ([id, translated]) =>
      !id
      || !translated
      || typeof translated.question !== "string"
      || !translated.question.trim()
      || translated.question.includes("__BQ_")
      || translated.question.includes("BQTERM")
      || Object.keys(translated.answers || {}).length !== 4
      || Object.values(translated.answers || {}).some(
        (answer) =>
          typeof answer !== "string"
          || !answer.trim()
          || answer.includes("__BQ_")
          || answer.includes("BQTERM"),
      ),
  );
  const questionKeys = Object.keys(catalog.quiz || {}).sort();
  if (!expectedQuizKeys) expectedQuizKeys = questionKeys;
  const questionKeyMismatch = expectedQuizKeys.length !== questionKeys.length
    || expectedQuizKeys.some((key, index) => key !== questionKeys[index]);

  if (missingMessages.length || invalidPlaceholders.length || invalidQuestions.length || questionKeyMismatch) {
    failed = true;
  }
  if (invalidQuestions.length) {
    console.error(`${locale} invalid contextual entries: ${invalidQuestions.map(([id]) => id).join(", ")}`);
  }
  console.log(JSON.stringify({
    locale,
    messages: Object.keys(catalog.messages).length,
    questions: Object.keys(catalog.quiz || {}).length,
    missingMessages: missingMessages.length,
    invalidPlaceholders: invalidPlaceholders.length,
    invalidQuestions: invalidQuestions.length,
    questionKeyMismatch,
  }));
}

const sourceDirectories = [
  path.join(root, "app"),
  path.join(root, "components"),
];
const sourceFiles = [];

async function collectSourceFiles(directoryPath) {
  for (const entry of await fs.readdir(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) await collectSourceFiles(entryPath);
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(entryPath);
  }
}

for (const sourceDirectory of sourceDirectories) await collectSourceFiles(sourceDirectory);

const referencedKeys = new Set();
for (const sourcePath of sourceFiles) {
  const source = await fs.readFile(sourcePath, "utf8");
  for (const match of source.matchAll(/\bt\("([^"]+)"(?:,|\))/g)) {
    referencedKeys.add(match[1]);
  }
}
const missingReferencedKeys = [...referencedKeys].filter((key) => !english.messages[key]);
if (missingReferencedKeys.length) {
  failed = true;
  console.error(`Missing referenced message keys: ${missingReferencedKeys.join(", ")}`);
}

if (failed) process.exitCode = 1;
