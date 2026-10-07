const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.disable('x-powered-by');
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: ['GET'],
}));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/api/minimal-pairs', async (req, res) => {
  const { exerciseType, soundPair, position } = req.query;
  if (exerciseType === undefined) {
    return res.status(400).json({ error: 'exerciseType is required.' });
  }
  for (const [name, value] of Object.entries({ exerciseType, soundPair, position })) {
    if (value !== undefined && (typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({ error: `${name} must be a single non-empty string.` });
    }
  }
  if (position !== undefined && !['start', 'middle', 'end'].includes(position)) {
    return res.status(400).json({ error: 'position must be one of: start, middle, end.' });
  }

  const values = [exerciseType, soundPair ?? null, position ?? null];
  try {
    const { rows } = await pool.query(`
      SELECT
        mp.id,
        mp.sound_type,
        mp.sound_pair,
        mp.position_in_word,
        w.text,
        mpw.sound,
        w.image_url,
        w.male_audio_url,
        w.female_audio_url
      FROM minimal_pairs AS mp
      JOIN minimal_pair_words AS mpw ON mpw.minimal_pair_id = mp.id
      JOIN words AS w ON w.id = mpw.word_id
      WHERE mp.sound_type = $1
        AND ($2::text IS NULL OR mp.sound_pair = $2)
        AND ($3::text IS NULL OR mp.position_in_word = $3)
      ORDER BY mp.id, mpw.position
    `, values);

    const pairs = new Map();
    for (const row of rows) {
      if (!pairs.has(row.id)) {
        pairs.set(row.id, {
          id: row.id,
          soundType: row.sound_type,
          soundPair: row.sound_pair,
          positionInWord: row.position_in_word,
          words: [],
        });
      }

      // Rows arrive in word position order, so appending preserves that order.
      pairs.get(row.id).words.push({
        text: row.text,
        sound: row.sound,
        imageUrl: row.image_url,
        maleAudioUrl: row.male_audio_url,
        femaleAudioUrl: row.female_audio_url,
      });
    }

    res.json([...pairs.values()]);
  } catch (error) {
    console.error('Failed to read minimal pairs:', error.message);
    res.status(503).json({ error: 'Unable to load minimal pairs.' });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  const server = app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });

  server.on('error', async error => {
    console.error('Server failed:', error.message);
    await pool.end();
    process.exitCode = 1;
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

module.exports = app;
