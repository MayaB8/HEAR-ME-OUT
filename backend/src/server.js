const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const pool = require('./db');

const app = express();
app.disable('x-powered-by');
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(cookieParser());

app.post('/api/users', async (req, res) => {
  const { username, password } = req.body ?? {};
  for (const [name, value] of Object.entries({ username, password })) {
    if (typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({ error: `${name} must be a non-empty string.` });
    }
  }
  const normalizedUsername = username.trim().toLowerCase();
  // bcrypt only hashes the first 72 bytes; reject longer passwords to avoid truncation.
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'password must not exceed 72 bytes.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(`
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, created_at
    `, [normalizedUsername, passwordHash]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    console.error('User registration failed.');
    res.status(500).json({ error: 'Unable to register user.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  for (const [name, value] of Object.entries({ username, password })) {
    if (typeof value !== 'string' || !value.trim()) {
      return res.status(400).json({ error: `${name} must be a non-empty string.` });
    }
  }
  const normalizedUsername = username.trim().toLowerCase();

  try {
    const { rows } = await pool.query(`
      SELECT id, username, password_hash, created_at
      FROM users
      WHERE username = $1
    `, [normalizedUsername]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionIdHash = crypto.createHash('sha256').update(sessionId).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(`
      INSERT INTO sessions (id_hash, user_id, expires_at)
      VALUES ($1, $2, $3)
    `, [sessionIdHash, user.id, expiresAt]);
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (error) {
    console.error('User login failed.');
    res.status(500).json({ error: 'Unable to log in.' });
  }
});

app.get('/api/me', async (req, res) => {
  const sessionId = req.cookies.session_id;
  if (typeof sessionId !== 'string' || !sessionId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  const sessionIdHash = crypto.createHash('sha256').update(sessionId).digest('hex');
  try {
    const { rows } = await pool.query(`
      SELECT users.id, users.username, users.created_at
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.id_hash = $1 AND sessions.expires_at > NOW()
    `, [sessionIdHash]);
    if (!rows[0]) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Session lookup failed.');
    res.status(500).json({ error: 'Unable to restore user.' });
  }
});

app.post('/api/logout', async (req, res) => {
  const sessionId = req.cookies.session_id;
  try {
    if (typeof sessionId === 'string' && sessionId) {
      const sessionIdHash = crypto.createHash('sha256').update(sessionId).digest('hex');
      await pool.query('DELETE FROM sessions WHERE id_hash = $1', [sessionIdHash]);
    }
    res.clearCookie('session_id', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(204).end();
  } catch (error) {
    console.error('User logout failed.');
    res.status(500).json({ error: 'Unable to log out.' });
  }
});

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
