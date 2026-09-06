-- Esquema da base de dados D1 do UCIPomon
-- Corre-se uma única vez com:
--   wrangler d1 execute ucipomon --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS people (
  id            TEXT PRIMARY KEY,
  image_key     TEXT NOT NULL,             -- caminho do objeto no bucket R2
  display_name  TEXT NOT NULL,             -- nome mostrado como resposta certa
  aliases       TEXT NOT NULL DEFAULT '[]',-- JSON array de respostas alternativas aceites
  active        INTEGER NOT NULL DEFAULT 1,-- 0 = escondido do jogo sem apagar
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  id                   INTEGER PRIMARY KEY CHECK (id = 1),
  questions_per_round  INTEGER NOT NULL DEFAULT 20
);

INSERT OR IGNORE INTO settings (id, questions_per_round) VALUES (1, 20);
