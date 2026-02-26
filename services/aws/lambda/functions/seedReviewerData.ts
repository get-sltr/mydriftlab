/**
 * Temporary Lambda — Seed reviewer account with realistic sleep data.
 * Invoke once via the AWS console, then delete.
 *
 * Requires env vars:
 *   DB_SECRET_ARN — Secrets Manager ARN for RDS credentials
 *   DB_HOST, DB_NAME — RDS connection info
 *   REVIEWER_COGNITO_SUB — the reviewer's Cognito sub
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';

const smClient = new SecretsManagerClient({});

interface DbSecret {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

async function getDbClient(): Promise<Client> {
  const secretArn = process.env.DB_SECRET_ARN!;
  const resp = await smClient.send(
    new GetSecretValueCommand({ SecretId: secretArn }),
  );
  const secret: DbSecret = JSON.parse(resp.SecretString!);

  const client = new Client({
    host: process.env.DB_HOST ?? secret.host,
    port: secret.port ?? 5432,
    database: process.env.DB_NAME ?? secret.dbname,
    user: secret.username,
    password: secret.password,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  return client;
}

export async function handler(): Promise<{ statusCode: number; body: string }> {
  const reviewerSub = process.env.REVIEWER_COGNITO_SUB;
  if (!reviewerSub) {
    return { statusCode: 400, body: 'REVIEWER_COGNITO_SUB not set' };
  }

  const db = await getDbClient();

  try {
    // 1. Look up (or create) the reviewer's profile
    const profileRes = await db.query(
      'SELECT id FROM profiles WHERE cognito_sub = $1',
      [reviewerSub],
    );

    let userId: string;
    if (profileRes.rows.length > 0) {
      userId = profileRes.rows[0].id;
    } else {
      const ins = await db.query(
        `INSERT INTO profiles (cognito_sub, email, name, tier)
         VALUES ($1, 'reviewer@sltrdigital.com', 'App Reviewer', 'pro')
         RETURNING id`,
        [reviewerSub],
      );
      userId = ins.rows[0].id;
    }

    // 2. Generate 5 nights of sleep sessions
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const sessions: Array<{
      startedAt: string;
      endedAt: string;
      score: number;
      summary: string;
    }> = [
      {
        startedAt: new Date(now - 1 * DAY - 7 * 3600000).toISOString(), // last night 11 PM
        endedAt: new Date(now - 1 * DAY + 0.5 * 3600000).toISOString(), // 6:30 AM
        score: 82,
        summary:
          'Solid night. One brief noise disruption around 2 AM, but you fell back asleep quickly.',
      },
      {
        startedAt: new Date(now - 2 * DAY - 7.5 * 3600000).toISOString(),
        endedAt: new Date(now - 2 * DAY + 0.25 * 3600000).toISOString(),
        score: 74,
        summary:
          'Temperature spike around 3 AM disrupted deep sleep. Consider lowering thermostat before bed.',
      },
      {
        startedAt: new Date(now - 3 * DAY - 6.5 * 3600000).toISOString(),
        endedAt: new Date(now - 3 * DAY + 1 * 3600000).toISOString(),
        score: 89,
        summary:
          'Excellent night. Minimal disruptions, steady temperature. Your best rest this week.',
      },
      {
        startedAt: new Date(now - 4 * DAY - 7 * 3600000).toISOString(),
        endedAt: new Date(now - 4 * DAY + 0 * 3600000).toISOString(),
        score: 62,
        summary:
          'Noisy evening — traffic and a dog barking caused multiple awakenings before midnight.',
      },
      {
        startedAt: new Date(now - 5 * DAY - 7.25 * 3600000).toISOString(),
        endedAt: new Date(now - 5 * DAY + 0.5 * 3600000).toISOString(),
        score: 78,
        summary:
          'Good overall. Partner snoring detected briefly at 4 AM. Smart Fade completed your story at 11:45 PM.',
      },
    ];

    const sessionIds: string[] = [];

    for (const s of sessions) {
      const res = await db.query(
        `INSERT INTO sleep_sessions (user_id, started_at, ended_at, status, rest_score, night_summary)
         VALUES ($1, $2, $3, 'complete', $4, $5)
         RETURNING id`,
        [userId, s.startedAt, s.endedAt, s.score, s.summary],
      );
      sessionIds.push(res.rows[0].id);
    }

    // 3. Insert environment events for each session
    const eventTemplates: Array<{
      category: string;
      type: string;
      severity: string;
      durationSeconds: number;
      decibelLevel?: number;
      temperatureF?: number;
      temperatureDelta?: number;
      confidence: number;
    }> = [
      { category: 'noise', type: 'traffic', severity: 'low', durationSeconds: 45, decibelLevel: 42, confidence: 0.85 },
      { category: 'noise', type: 'traffic', severity: 'medium', durationSeconds: 120, decibelLevel: 55, confidence: 0.92 },
      { category: 'noise', type: 'dog_barking', severity: 'high', durationSeconds: 30, decibelLevel: 62, confidence: 0.88 },
      { category: 'noise', type: 'hvac', severity: 'low', durationSeconds: 300, decibelLevel: 35, confidence: 0.78 },
      { category: 'climate', type: 'temperature_rise', severity: 'medium', durationSeconds: 600, temperatureF: 76.2, temperatureDelta: 3.1, confidence: 0.91 },
      { category: 'climate', type: 'temperature_drop', severity: 'low', durationSeconds: 480, temperatureF: 67.8, temperatureDelta: -2.0, confidence: 0.87 },
      { category: 'climate', type: 'humidity_change', severity: 'low', durationSeconds: 900, confidence: 0.72 },
      { category: 'noise', type: 'snoring', severity: 'medium', durationSeconds: 180, decibelLevel: 48, confidence: 0.83 },
      { category: 'light', type: 'phone_screen', severity: 'low', durationSeconds: 15, confidence: 0.65 },
      { category: 'noise', type: 'appliance', severity: 'low', durationSeconds: 60, decibelLevel: 38, confidence: 0.7 },
    ];

    for (let si = 0; si < sessionIds.length; si++) {
      const count = 8 + Math.floor(Math.random() * 5); // 8-12 events
      for (let ei = 0; ei < count; ei++) {
        const tmpl = eventTemplates[ei % eventTemplates.length];
        const sessionStart = new Date(sessions[si].startedAt).getTime();
        const sessionEnd = new Date(sessions[si].endedAt).getTime();
        const offset = Math.random() * (sessionEnd - sessionStart);
        const ts = new Date(sessionStart + offset).toISOString();

        await db.query(
          `INSERT INTO environment_events
           (session_id, timestamp, category, type, severity, duration_seconds,
            decibel_level, temperature_f, temperature_delta, confidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            sessionIds[si],
            ts,
            tmpl.category,
            tmpl.type,
            tmpl.severity,
            tmpl.durationSeconds,
            tmpl.decibelLevel ?? null,
            tmpl.temperatureF ?? null,
            tmpl.temperatureDelta ?? null,
            tmpl.confidence,
          ],
        );
      }
    }

    // 4. Insert insights for each session
    const insightTemplates: Array<{
      type: string;
      title: string;
      body: string;
      confidence: number;
    }> = [
      {
        type: 'disruption_cause',
        title: 'Traffic noise peak',
        body: 'Traffic noise peaked between 1-2 AM, causing a brief arousal. This pattern has occurred 3 of the past 5 nights.',
        confidence: 0.88,
      },
      {
        type: 'recommendation',
        title: 'Lower thermostat',
        body: 'Your room temperature rose above 74°F mid-night. Lowering your thermostat by 2°F before bed may improve deep sleep.',
        confidence: 0.82,
      },
      {
        type: 'pattern',
        title: 'Consistent bedtime',
        body: 'You went to bed within a 30-minute window all week. Consistent timing supports your circadian rhythm.',
        confidence: 0.95,
      },
      {
        type: 'encouragement',
        title: 'Rest score improving',
        body: 'Your 7-day average rest score is up 4 points from last week. Keep up the good habits!',
        confidence: 0.9,
      },
      {
        type: 'disruption_cause',
        title: 'Partner snoring',
        body: 'Brief snoring detected around 4 AM. Duration was short — no significant impact on rest score.',
        confidence: 0.78,
      },
    ];

    for (let si = 0; si < sessionIds.length; si++) {
      const count = 2 + Math.floor(Math.random() * 2); // 2-3 insights
      for (let ii = 0; ii < count; ii++) {
        const tmpl = insightTemplates[(si * 3 + ii) % insightTemplates.length];
        await db.query(
          `INSERT INTO insights (session_id, type, title, body, confidence)
           VALUES ($1, $2, $3, $4, $5)`,
          [sessionIds[si], tmpl.type, tmpl.title, tmpl.body, tmpl.confidence],
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Seed data inserted',
        userId,
        sessions: sessionIds.length,
      }),
    };
  } catch (error) {
    console.error('Seed data error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(error) }),
    };
  } finally {
    await db.end();
  }
}
