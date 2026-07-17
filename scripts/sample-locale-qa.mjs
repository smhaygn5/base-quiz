import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sampleRatio = Math.min(0.99, Math.max(0, Number(process.argv[2] || "0.37")));
const pagePath = path.join(root, "app", "page.tsx");
const source = await fs.readFile(pagePath, "utf8");
const sourceFile = ts.createSourceFile(
  pagePath,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const categories = {};

function text(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : "";
}

function readQuestion(node, id) {
  if (!ts.isObjectLiteralExpression(node)) return null;
  const properties = Object.fromEntries(
    node.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [
        ts.isIdentifier(property.name) ? property.name.text : "",
        property.initializer,
      ]),
  );
  if (!properties.q || !properties.a || !ts.isArrayLiteralExpression(properties.a)) return null;
  return {
    id,
    question: text(properties.q),
    answers: properties.a.elements.map(text),
  };
}

function visit(node) {
  if (ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text.endsWith("_Q")
    && node.initializer
    && ts.isArrayLiteralExpression(node.initializer)) {
    categories[node.name.text] = node.initializer.elements
      .map((element, index) => readQuestion(
        element,
        `${node.name.text === "GEO_Q" ? "geography" : node.name.text.replace("_Q", "").toLowerCase()}:${index}`,
      ))
      .filter(Boolean);
    return;
  }
  ts.forEachChild(node, visit);
}
visit(sourceFile);

for (const locale of ["tr", "es", "pt", "fr", "de", "ru", "ar", "zh", "ja", "ko"]) {
  const catalog = JSON.parse(
    await fs.readFile(path.join(root, "app", "i18n", "catalogs", `${locale}.json`), "utf8"),
  );
  for (const [category, questions] of Object.entries(categories)) {
    const question = questions[Math.floor(questions.length * sampleRatio)];
    console.log(JSON.stringify({
      locale,
      category,
      id: question.id,
      source: question.question,
      translated: catalog.quiz[question.id].question,
      sourceAnswers: question.answers,
      translatedAnswers: question.answers.map((answer) => catalog.quiz[question.id].answers[answer]),
    }));
  }
}
