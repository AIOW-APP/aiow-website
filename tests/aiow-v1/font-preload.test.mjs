import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../../app/layout.tsx', import.meta.url), 'utf8');
const tree = ts.createSourceFile('layout.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

test('Fraunces stays available under its existing variable without forced preload', () => {
  const calls = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(tree) === 'Fraunces') calls.push(node);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  assert.equal(calls.length, 1);
  const options = calls[0].arguments[0];
  assert.ok(ts.isObjectLiteralExpression(options));
  const values = Object.fromEntries(options.properties.map(property => {
    assert.ok(ts.isPropertyAssignment(property), 'font options must be explicit');
    return [property.name.getText(tree), property.initializer.getText(tree)];
  }));
  assert.deepEqual(values, {
    subsets: '["latin"]', variable: '"--font-fraunces"', display: '"optional"', preload: 'false',
  });
  assert.match(source, /import\s*\{[^}]*\bFraunces\b[^}]*\}\s*from\s*["']next\/font\/google["']/);
  assert.match(source, /<html\b[^>]*className=\{`\$\{inter\.variable\} \$\{fraunces\.variable\}`\}/);
  assert.match(source, /const inter = Inter\(\{ subsets: \["latin"\], variable: "--font-inter", display: "optional" \}\);/);
});
