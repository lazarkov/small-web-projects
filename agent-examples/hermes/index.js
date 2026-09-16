// Entrypoint for the Hermes layer probe.
// Prints an identifiable marker and exits 0. Nothing else — the point is to
// prove the layer was copied, the dependency was installed, and `npm start`
// was detected.

const dayjs = require('dayjs');

const MARKER = 'HERMES-LAYER-OK';

console.log(`${MARKER} at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
console.log(`cwd=${process.cwd()}`);
console.log(`node=${process.version}`);
console.log(`dayjs=${require('dayjs/package.json').version}`);

process.exit(0);
