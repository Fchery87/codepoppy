CREATE TABLE IF NOT EXISTS installation (
  id INTEGER PRIMARY KEY,
  owner_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repository (
  id INTEGER PRIMARY KEY,
  installation_id INTEGER NOT NULL REFERENCES installation(id),
  enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)),
  sensitive INTEGER NOT NULL CHECK (sensitive IN (0, 1)) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review_request (
  id TEXT PRIMARY KEY,
  installation_id INTEGER NOT NULL,
  repository_id INTEGER NOT NULL,
  pull_request INTEGER NOT NULL,
  head_sha TEXT NOT NULL,
  review_kind TEXT NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('automatic', 'manual')),
  UNIQUE (installation_id, repository_id, pull_request, head_sha, review_kind, trigger)
);

CREATE TABLE IF NOT EXISTS review_run (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES review_request(id),
  state TEXT NOT NULL CHECK (state IN (
    'requested', 'debouncing', 'queued', 'dispatched', 'claimed',
    'complete', 'incomplete', 'failed', 'cancelled'
  )),
  head_sha TEXT NOT NULL,
  sets_last_reviewed_head INTEGER NOT NULL CHECK (sets_last_reviewed_head IN (0, 1))
);

CREATE TABLE IF NOT EXISTS completion_receipt (
  run_id TEXT PRIMARY KEY REFERENCES review_run(id),
  attempt_id TEXT NOT NULL,
  head_sha TEXT NOT NULL,
  evidence_digest TEXT NOT NULL,
  evidence_ciphertext BLOB NOT NULL,
  wrapped_key BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  reason TEXT,
  body_ciphertext BLOB
);

CREATE TABLE IF NOT EXISTS source_body (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  ciphertext BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS secret_metadata (
  run_id TEXT NOT NULL,
  rule TEXT NOT NULL,
  path TEXT NOT NULL,
  line INTEGER NOT NULL,
  fingerprint TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deletion_audit (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,
  scope TEXT NOT NULL
);
