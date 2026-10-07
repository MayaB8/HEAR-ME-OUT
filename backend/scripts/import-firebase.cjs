// Import a Firebase RTDB export into the existing local Compose Postgres tables.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function buildImport(data) {
  if (!data || Object.keys(data).some(key => key !== 'words') || !data.words) {
    throw new Error('Expected an export containing only the words collection.');
  }
  const pairs = [];
  const words = [];
  const links = [];
  const ids = new Set();
  const wordIds = new Map();
  const required = (value, label, max) => {
    if (typeof value !== 'string' || !value.trim() || value.includes('\0') || value.length > max) {
      throw new Error(`Invalid ${label}`);
    }
    return value;
  };
  for (const [category, entries] of Object.entries(data.words)) {
    for (const [key, pair] of Object.entries(entries)) {
      if (pair === null) continue;
      if (!Number.isSafeInteger(pair.id) || pair.id <= 0 || pair.id > 2147483647 || String(pair.id) !== key || ids.has(pair.id)) {
        throw new Error(`Invalid or duplicate pair ID: ${key}`);
      }
      ids.add(pair.id);
      required(pair.sound_type, 'sound_type', 100);
      if (pair.sound_type !== category) throw new Error(`Category mismatch for ${key}`);
      pairs.push([pair.id, pair.sound_type, required(pair.sound_pair, 'sound_pair', 100), required(pair.position_in_word, 'position_in_word', 20)]);
      if (!Array.isArray(pair.words) || pair.words.length !== 2) throw new Error(`Pair ${key} must have two words`);
      pair.words.forEach((word, index) => {
        const allowed = new Set(['word', 'variant', 'photo_paths', 'man_sound_path', 'woman_sound_path', `word${index + 1}_sound`]);
        if (Object.keys(word).some(field => !allowed.has(field))) throw new Error(`Unknown word field in pair ${key}`);
        const values = [required(word.word, 'word', 255), word.variant ?? null, ...['photo_paths', 'man_sound_path', 'woman_sound_path'].map(field => word[field] ?? null)];
        values.slice(1).forEach((value, i) => {
          if (value !== null) required(value, 'word metadata', i === 0 ? 100 : Infinity);
        });
        const identity = JSON.stringify(values);
        if (!wordIds.has(identity)) {
          wordIds.set(identity, words.length + 1);
          words.push([words.length + 1, ...values]);
        }
        links.push([pair.id, wordIds.get(identity), required(word[`word${index + 1}_sound`], 'sound', 20), index + 1]);
      });
      const allowed = new Set(['id', 'sound_type', 'sound_pair', 'position_in_word', 'words']);
      if (Object.keys(pair).some(field => !allowed.has(field))) throw new Error(`Unknown pair field in ${key}`);
    }
  }
  if (!pairs.length) throw new Error('Export has no pairs');
  const literal = value => value === null ? 'NULL' : typeof value === 'number' ? String(value) : "'" + value.replaceAll("'", "''") + "'";
  const insert = (table, columns, rows) => `INSERT INTO ${table} (${columns}) VALUES\n${rows.map(row => '(' + row.map(literal).join(',') + ')').join(',\n')};`;
  const sql = [
    "\\set ON_ERROR_STOP on", "SET client_encoding = 'UTF8';", 'BEGIN;', "SET LOCAL standard_conforming_strings = on;",
    'LOCK TABLE minimal_pairs, words, minimal_pair_words IN ACCESS EXCLUSIVE MODE;',
    "DO $$ BEGIN IF EXISTS (SELECT 1 FROM minimal_pairs) OR EXISTS (SELECT 1 FROM words) OR EXISTS (SELECT 1 FROM minimal_pair_words) THEN RAISE EXCEPTION 'Import requires empty tables; existing data was not changed'; END IF; END $$;",
    insert('minimal_pairs', 'id,sound_type,sound_pair,position_in_word', pairs),
    insert('words', 'id,text,variant,image_url,male_audio_url,female_audio_url', words),
    insert('minimal_pair_words', 'minimal_pair_id,word_id,sound,position', links),
    "SELECT setval(pg_get_serial_sequence('minimal_pairs','id'), (SELECT max(id) FROM minimal_pairs));",
    "SELECT setval(pg_get_serial_sequence('words','id'), (SELECT max(id) FROM words));", 'COMMIT;',
  ].join('\n');
  return { sql, counts: { pairs: pairs.length, words: words.length, links: links.length } };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const input = args.find(arg => !arg.startsWith('--'));
    if (!input || args.some(arg => arg.startsWith('--') && arg !== '--dry-run')) throw new Error('Usage: node backend/scripts/import-firebase.cjs <export.json> [--dry-run]');
    const { sql, counts } = buildImport(JSON.parse(fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, '')));
    console.log('Validated export:', counts);
    if (!args.includes('--dry-run')) {
      const result = spawnSync('docker', ['compose', 'exec', '-T', 'postgres', 'psql', '-X', '-U', 'hear_me_out_user', '-d', 'hear_me_out'], {
        cwd: path.resolve(__dirname, '../..'), input: sql, encoding: 'utf8', maxBuffer: 1024 * 1024,
      });
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error('Import failed; transaction was rolled back.');
      console.log('Import completed.');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { buildImport };
