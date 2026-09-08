import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../../components/aiow-v1/PriceCalculator.tsx', import.meta.url), 'utf8');
test('quote readiness starts disabled in SSR and only opens after mounted commit', () => {
  assert.match(source, /const \[ready, setReady\] = useState\(false\)/);
  assert.match(source, /useEffect\(\(\) => \{ setReady\(true\); \}, \[\]\)/);
  assert.match(source, /data-quote-trigger data-ready=\{ready \? "true" : "false"\} disabled=\{!ready\} aria-busy=\{!ready\}/);
  assert.match(source, /Preparing indication form…/);
  assert.match(source, /Indicatieformulier laden…/);
  assert.match(source, /<noscript>.*mailto:info@aiow\.io.*<\/noscript>/);
});
