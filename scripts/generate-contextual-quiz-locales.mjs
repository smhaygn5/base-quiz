import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

if (!process.argv.includes("--allow-external-translation")) {
  throw new Error(
    "This script sends public quiz copy to an external translation service. "
    + "Run it only with explicit approval and --allow-external-translation.",
  );
}

const root = process.cwd();
const catalogDirectory = path.join(root, "app", "i18n", "catalogs");
const pagePath = path.join(root, "app", "page.tsx");
const pageSource = await fs.readFile(pagePath, "utf8");
const sourceFile = ts.createSourceFile(
  pagePath,
  pageSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

const targetLanguages = {
  tr: "tr",
  es: "es",
  pt: "pt",
  fr: "fr",
  de: "de",
  ru: "ru",
  ar: "ar",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
};
const categoryIds = {
  CRYPTO_Q: "crypto",
  SPORTS_Q: "sports",
  ART_Q: "art",
  HISTORY_Q: "history",
  SCIENCE_Q: "science",
  GEO_Q: "geography",
};
const quiz = [];

function literalText(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : null;
}

function propertyName(node) {
  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) return node.name.text;
  return "";
}

function readQuestion(node, id) {
  if (!ts.isObjectLiteralExpression(node)) return null;
  const properties = new Map(
    node.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [propertyName(property), property.initializer]),
  );
  const questionNode = properties.get("q");
  const answersNode = properties.get("a");
  if (!questionNode || !answersNode || !ts.isArrayLiteralExpression(answersNode)) return null;
  const question = literalText(questionNode);
  const answers = answersNode.elements.map(literalText);
  if (!question || answers.some((answer) => answer === null)) return null;
  return { id, question, answers };
}

function visit(node) {
  if (ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && categoryIds[node.name.text]
    && node.initializer
    && ts.isArrayLiteralExpression(node.initializer)) {
    node.initializer.elements.forEach((element, index) => {
      const question = readQuestion(element, `${categoryIds[node.name.text]}:${index}`);
      if (question) quiz.push(question);
    });
    return;
  }
  ts.forEachChild(node, visit);
}
visit(sourceFile);

const protectedTerms = [
  "Base Quiz",
  "Base Mainnet",
  "Base App",
  "Coinbase Wallet",
  "Start Round",
  "Farcaster",
  "OnchainKit",
  "MiniKit",
  "Coinbase",
  "Ethereum",
  "OpenSea",
  "MetaMask",
  "Uniswap",
  "Aave",
  "USDC",
  "USDT",
  "DAO",
  "AMM",
  "TVL",
  "DEX",
  "CEX",
  "KYC",
  "DYOR",
  "HODL",
  "EVM",
  "ERC-20",
  "ERC-721",
  "ERC-1155",
  "NFTs",
  "NFT",
  "ETH",
  "BTC",
  "PoS",
  "L2",
  "L1",
  "Base",
];
const groupSeparator = "__BQ_GROUP_7C4E__";
const maxBatchCharacters = 2800;
const concurrency = 4;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectText(text) {
  const terms = [];
  let protectedText = text;
  for (const term of protectedTerms) {
    const expression = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`,
      "gu",
    );
    protectedText = protectedText.replace(expression, () => {
      terms.push(term);
      return `BQTERM${terms.length - 1}QZ`;
    });
  }
  return { protectedText, terms };
}

function restoreText(text, terms) {
  return terms.reduce(
    (result, term, index) => result.replaceAll(`BQTERM${index}QZ`, term),
    text.trim(),
  );
}

function prepareQuestion(question) {
  const fields = [question.question, ...question.answers].map(protectText);
  return {
    ...question,
    fields,
    protectedText: fields
      .map((field, index) => `__BQ_FIELD_${index}__ ${field.protectedText}`)
      .join("\n"),
  };
}

function splitIntoBatches(items) {
  const batches = [];
  let current = [];
  let length = 0;
  for (const item of items) {
    const itemLength = item.protectedText.length + groupSeparator.length + 4;
    if (current.length > 0 && length + itemLength > maxBatchCharacters) {
      batches.push(current);
      current = [];
      length = 0;
    }
    current.push(item);
    length += itemLength;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

async function requestTranslation(text, target, attempt = 0) {
  const parameters = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: target,
    dt: "t",
    q: text,
  });
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?${parameters}`,
      { signal: AbortSignal.timeout(30000) },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload[0].map((segment) => segment[0]).join("");
  } catch (error) {
    if (attempt >= 5) throw error;
    await new Promise((resolve) => setTimeout(resolve, 750 * (attempt + 1)));
    return requestTranslation(text, target, attempt + 1);
  }
}

function parseTranslatedQuestion(translated, prepared) {
  const matches = [...translated.matchAll(/__BQ_FIELD_(\d+)__/g)];
  if (matches.length !== prepared.fields.length) return null;
  const values = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? translated.length;
    const fieldIndex = Number(match[1]);
    return [
      fieldIndex,
      restoreText(translated.slice(start, end), prepared.fields[fieldIndex].terms),
    ];
  });
  const fields = Object.fromEntries(values);
  if (Object.keys(fields).length !== prepared.fields.length) return null;
  return {
    question: fields[0],
    answers: prepared.answers.map((answer, index) => [answer, fields[index + 1]]),
  };
}

function validParsedQuestion(parsed, prepared) {
  if (!parsed || !parsed.question?.trim() || parsed.question.includes("\n")) return false;
  if (!Array.isArray(parsed.answers) || parsed.answers.length !== prepared.answers.length) return false;
  return parsed.answers.every(
    ([source, translated], index) =>
      source === prepared.answers[index]
      && typeof translated === "string"
      && Boolean(translated.trim())
      && !translated.includes("\n"),
  );
}

async function translatePreparedQuestion(prepared, target) {
  const translated = await requestTranslation(prepared.protectedText, target);
  const parsed = parseTranslatedQuestion(translated, prepared);
  if (validParsedQuestion(parsed, prepared)) return parsed;

  const translatedFields = await Promise.all(prepared.fields.map(async (field, index) => {
    if (index === 0) {
      return restoreText(await requestTranslation(field.protectedText, target), field.terms);
    }
    const withContext = `${prepared.fields[0].protectedText}\n${groupSeparator}\n${field.protectedText}`;
    const contextualTranslation = await requestTranslation(withContext, target);
    const parts = contextualTranslation.split(new RegExp(`\\s*${groupSeparator}\\s*`, "g"));
    const answerTranslation = parts.length === 2
      ? parts[1]
      : await requestTranslation(field.protectedText, target);
    return restoreText(answerTranslation, field.terms);
  }));
  return {
    question: translatedFields[0],
    answers: prepared.answers.map((answer, index) => [answer, translatedFields[index + 1]]),
  };
}

async function translateBatch(batch, target) {
  const joined = batch.map((item) => item.protectedText).join(`\n${groupSeparator}\n`);
  const translated = await requestTranslation(joined, target);
  const groups = translated.split(new RegExp(`\\s*${groupSeparator}\\s*`, "g"));
  if (groups.length !== batch.length) {
    return Promise.all(batch.map((item) => translatePreparedQuestion(item, target)));
  }
  return Promise.all(groups.map(async (group, index) => (
    validParsedQuestion(parseTranslatedQuestion(group, batch[index]), batch[index])
      ? parseTranslatedQuestion(group, batch[index])
      : translatePreparedQuestion(batch[index], target)
  )));
}

function validExistingQuestion(entry, prepared) {
  if (!entry || typeof entry.question !== "string" || !entry.question.trim() || entry.question.includes("\n")) {
    return false;
  }
  const answers = entry.answers || {};
  return prepared.answers.every(
    (answer) =>
      typeof answers[answer] === "string"
      && Boolean(answers[answer].trim())
      && !answers[answer].includes("\n"),
  ) && Object.keys(answers).length === prepared.answers.length;
}

async function runPool(tasks, worker) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function next() {
    while (cursor < tasks.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(tasks[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, next));
  return results;
}

const preparedQuiz = quiz.map(prepareQuestion);
const batches = splitIntoBatches(preparedQuiz);

for (const [locale, target] of Object.entries(targetLanguages)) {
  const catalogPath = path.join(catalogDirectory, `${locale}.json`);
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  const existingQuiz = catalog.quiz || {};
  const pending = preparedQuiz.filter(
    (question) => !validExistingQuestion(existingQuiz[question.id], question),
  );
  const pendingBatches = splitIntoBatches(pending);

  console.log(`${locale}: ${pending.length} contextual questions in ${pendingBatches.length} batches`);
  const translatedBatches = await runPool(pendingBatches, async (batch, index) => {
    const translated = await translateBatch(batch, target);
    if ((index + 1) % 10 === 0 || index === pendingBatches.length - 1) {
      console.log(`${locale}: ${Math.min(index + 1, pendingBatches.length)}/${pendingBatches.length}`);
    }
    return translated;
  });

  const contextualQuiz = { ...existingQuiz };
  pendingBatches.forEach((batch, batchIndex) => {
    batch.forEach((question, questionIndex) => {
      const translated = translatedBatches[batchIndex][questionIndex];
      contextualQuiz[question.id] = {
        question: translated.question,
        answers: Object.fromEntries(translated.answers),
      };
    });
  });
  catalog.quiz = contextualQuiz;
  delete catalog.questions;
  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
}

console.log(`Generated contextual translations for ${quiz.length} questions in ${batches.length} source batches.`);
