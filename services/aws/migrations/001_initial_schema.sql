-- DriftLab Initial Database Schema
-- PostgreSQL 15
-- Run against the 'driftlab' database

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  timezone TEXT DEFAULT 'America/Los_Angeles',
  bedtime_goal TIME,
  wake_goal TIME,
  temp_unit_f BOOLEAN DEFAULT true,
  thermostat_setting NUMERIC(4,1),
  sensitivity TEXT DEFAULT 'medium',
  partner_default BOOLEAN DEFAULT false,
  adaptive_sound BOOLEAN DEFAULT true,
  smart_fade BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sleep_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'wind_down',
  rest_score INT CHECK (rest_score >= 0 AND rest_score <= 100),
  night_summary TEXT,
  wind_down_content_id UUID,
  smart_fade_at TIMESTAMPTZ,
  experiment_id UUID,
  partner_present BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE environment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sleep_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('noise', 'climate', 'light', 'partner')),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  duration_seconds INT DEFAULT 0,
  decibel_level NUMERIC(5,1),
  temperature_f NUMERIC(5,1),
  temperature_delta NUMERIC(4,1),
  lux_level NUMERIC(7,1),
  light_source TEXT,
  humidity_estimate NUMERIC(5,1),
  snorer_identity TEXT,
  confidence NUMERIC(3,2) DEFAULT 0.5,
  audio_clip_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('story','soundscape','meditation','breathing','music')),
  title TEXT NOT NULL,
  narrator TEXT,
  duration_seconds INT,
  category TEXT,
  is_adaptive BOOLEAN DEFAULT false,
  tags TEXT[],
  tier TEXT DEFAULT 'free',
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id),
  played_at TIMESTAMPTZ DEFAULT now(),
  completion_percent INT DEFAULT 0,
  session_id UUID,
  resulting_score INT
);

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sleep_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  confidence NUMERIC(3,2),
  related_event_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  occurrences INT DEFAULT 1,
  day_of_week INT[],
  time_range_start TIME,
  time_range_end TIME,
  avg_impact_score NUMERIC(5,1),
  first_detected TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hypothesis TEXT,
  target_metric TEXT,
  baseline_value NUMERIC(7,2),
  current_value NUMERIC(7,2),
  total_nights INT DEFAULT 7,
  completed_nights INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'complete', 'abandoned')),
  improvement_pct NUMERIC(5,1),
  result_summary TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_sessions_user ON sleep_sessions(user_id, started_at DESC);
CREATE INDEX idx_events_session ON environment_events(session_id, timestamp);
CREATE INDEX idx_events_category ON environment_events(category, timestamp);
CREATE INDEX idx_content_type ON content_items(type, tier);
CREATE INDEX idx_history_user ON content_history(user_id, played_at DESC);
CREATE INDEX idx_patterns_user ON patterns(user_id, last_seen DESC);
CREATE INDEX idx_experiments_user ON experiments(user_id, status);

-- ============================================================
-- NOTES
-- ============================================================
-- Access Control: API Gateway authorizers + Cognito JWT validation per user
-- RLS is not used since auth is handled at the API Gateway layer via Cognito JWT.
-- Lambda functions validate user_id from Cognito claims before any DB query.
-- All queries include WHERE user_id = :cognitoSub to enforce data isolation.
