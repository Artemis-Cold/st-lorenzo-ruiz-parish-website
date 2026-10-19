import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const src = fileURLToPath(new URL("../../../../", import.meta.url));
registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") && context.parentURL?.startsWith("file:"))
    ) {
      const base = specifier.startsWith("@/")
        ? resolve(src, specifier.slice(2))
        : resolve(dirname(fileURLToPath(context.parentURL)), specifier);
      const found = [base + ".tsx", base + ".ts", base + "/index.ts"].find(
        existsSync,
      );
      if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (/\.tsx?$/.test(url))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
      };
    return next(url, context);
  },
});
const { default: ReviewSection, ReviewDetails } =
  await import("./ReviewSection.tsx");
const { reviewValue } = await import("./reviewValue.ts");

test("review displays readable values without editable form inputs", () => {
  const html = renderToStaticMarkup(
    React.createElement(ReviewDetails, {
      data: {
        first_name: "Ana",
        address: "Taysan",
        birth_date: "2014-01-15",
        parents: [{ first_name: "Maria", birth_place: "Batangas" }],
        has_spouse: false,
        suffix: "",
      },
    }),
  );
  for (const text of [
    "Ana",
    "Taysan",
    "2014",
    "Maria",
    "Batangas",
    "No / Hindi",
    "Not provided",
  ])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /<(input|select|textarea)\b/);
});
test("zero is not treated as missing, and empty/boolean values are explicit", () => {
  assert.equal(reviewValue(0), "0");
  assert.equal(reviewValue(false), "No / Hindi");
  assert.match(reviewValue("   "), /Not provided/);
  assert.match(reviewValue(new Date("invalid")), /Not provided/);
  assert.equal(
    reviewValue("confirmation_certificate"),
    "Confirmation Certificate",
  );
});
test("Edit invokes its section handler and is omitted for parish-assigned information", () => {
  let step = 0;
  const section = ReviewSection({
    title: "Bride",
    onEdit: () => {
      step = 4;
    },
    data: { first_name: "Ana" },
  });
  const visit = (element) => {
    if (!React.isValidElement(element)) return;
    if (element.type === "button") element.props.onClick();
    React.Children.forEach(element.props.children, visit);
  };
  visit(section);
  assert.equal(step, 4);
  const html = renderToStaticMarkup(
    React.createElement(ReviewSection, {
      title: "Schedule",
      data: { schedule: "To be announced by the parish" },
    }),
  );
  assert.ok(html.includes("To be announced by the parish"));
  assert.doesNotMatch(html, /<button/);
});
test("review pages no longer redisplay details forms and Edit preserves booking state", () => {
  for (const service of [
    "baptism",
    "wedding",
    "funeral",
    "document-request",
    "mass",
  ]) {
    const source = readFileSync(
      new URL(`./${service}/steps/ConfirmationStep.tsx`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, /<(DetailsStep|SacramentsStep)\b/);
    assert.match(source, /onEdit/);
    assert.match(source, /checked=\{agree\}/);
  }
  for (const page of ["Baptism", "Wedding", "Funeral", "Document", "Mass"]) {
    const source = readFileSync(
      new URL(`../../pages/${page}.tsx`, import.meta.url),
      "utf8",
    );
    const edit = source.match(/onEdit=\{\(step\) => \{([\s\S]*?)\}\}/)?.[1];
    assert.ok(edit, page);
    assert.match(edit, /setAgree\w*\(false\)/);
    assert.match(edit, /setCurrentStep\(step\)/);
    assert.doesNotMatch(edit, /setBooking/);
  }
});
