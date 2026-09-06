/**
 * UCIPomon — Worker principal.
 *
 * Rotas públicas (jogo):
 *   GET  /api/settings          -> { questionsPerRound }
 *   GET  /api/quiz?count=20     -> { items: [{ id, imageUrl }] }   (SEM nomes — só ids e imagens)
 *   POST /api/check             -> body { id, guess } -> { correct }
 *   POST /api/reveal            -> body { id }         -> { answer }  (só quando o jogador desiste)
 *   GET  /api/image/:id         -> a imagem (proxy para o R2, com cache)
 *
 * Rotas de admin (todas exigem o cabeçalho X-Admin-Password):
 *   GET    /api/admin/people           -> lista todas as pessoas (com nome, para gestão)
 *   POST   /api/admin/people           -> multipart/form-data { image, displayName, aliases } -> cria
 *   PUT    /api/admin/people/:id       -> multipart/form-data { image?, displayName?, aliases? } -> atualiza
 *   DELETE /api/admin/people/:id       -> apaga pessoa + imagem no R2
 *   POST   /api/admin/settings         -> body { questionsPerRound } -> atualiza definição
 *
 * Qualquer outro pedido é entregue aos ficheiros estáticos em ./public (env.ASSETS).
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      if (pathname === "/api/settings" && request.method === "GET") {
        return await getSettings(env);
      }

      if (pathname === "/api/quiz" && request.method === "GET") {
        return await getQuiz(env, url);
      }

      if (pathname === "/api/check" && request.method === "POST") {
        return await checkAnswer(request, env);
      }

      if (pathname === "/api/reveal" && request.method === "POST") {
        return await revealAnswer(request, env);
      }

      if (pathname.startsWith("/api/image/") && request.method === "GET") {
        return await serveImage(pathname, env);
      }

      if (pathname.startsWith("/api/admin/")) {
        if (!isAdminAuthenticated(request, env)) {
          return json({ error: "Password incorreta ou em falta." }, 401);
        }
        return await handleAdmin(pathname, request, env);
      }

      if (pathname.startsWith("/api/")) {
        return json({ error: "Rota não encontrada." }, 404);
      }

      // Não é uma rota da API: deixar os ficheiros estáticos tratar do pedido.
      return env.ASSETS.fetch(request);
    } catch (err) {
      console.error("Erro no worker:", err);
      return json({ error: "Erro interno do servidor." }, 500);
    }
  },
};

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Remove acentos, baixa para minúsculas e normaliza espaços, para comparar respostas. */
function normalize(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Comparação de password em tempo constante (evita timing attacks triviais). */
function safeEqual(a, b) {
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

function isAdminAuthenticated(request, env) {
  const provided = request.headers.get("X-Admin-Password") || "";
  const expected = env.ADMIN_PASSWORD || "";
  // Sem password configurada no Worker, ninguém consegue autenticar-se.
  if (!expected) return false;
  return safeEqual(provided, expected);
}

async function getSettingsRow(env) {
  const row = await env.DB.prepare(
    "SELECT questions_per_round FROM settings WHERE id = 1"
  ).first();
  return row || { questions_per_round: 20 };
}

// ---------------------------------------------------------------------------
// Rotas públicas do jogo
// ---------------------------------------------------------------------------

async function getSettings(env) {
  const row = await getSettingsRow(env);
  return json({ questionsPerRound: row.questions_per_round });
}

async function getQuiz(env, url) {
  const settings = await getSettingsRow(env);
  const requested = parseInt(url.searchParams.get("count") || "", 10);
  const count = Number.isFinite(requested) && requested > 0 ? requested : settings.questions_per_round;

  const { results } = await env.DB.prepare(
    "SELECT id, image_key FROM people WHERE active = 1 ORDER BY RANDOM() LIMIT ?"
  )
    .bind(count)
    .all();

  const items = results.map((r) => ({ id: r.id, imageUrl: `/api/image/${r.id}` }));
  return json({ items });
}

async function checkAnswer(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.id || typeof body.guess !== "string") {
    return json({ error: "Pedido inválido." }, 400);
  }

  const row = await env.DB.prepare(
    "SELECT display_name, aliases FROM people WHERE id = ? AND active = 1"
  )
    .bind(body.id)
    .first();

  if (!row) return json({ error: "Pessoa não encontrada." }, 404);

  const accepted = [row.display_name, ...JSON.parse(row.aliases || "[]")].map(normalize);
  const guess = normalize(body.guess);
  const correct = guess.length > 0 && accepted.includes(guess);

  return json({ correct });
}

async function revealAnswer(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.id) return json({ error: "Pedido inválido." }, 400);

  const row = await env.DB.prepare(
    "SELECT display_name FROM people WHERE id = ? AND active = 1"
  )
    .bind(body.id)
    .first();

  if (!row) return json({ error: "Pessoa não encontrada." }, 404);
  return json({ answer: row.display_name });
}

async function serveImage(pathname, env) {
  const id = decodeURIComponent(pathname.replace("/api/image/", ""));
  const row = await env.DB.prepare("SELECT image_key FROM people WHERE id = ?").bind(id).first();
  if (!row) return new Response("Não encontrado.", { status: 404 });

  const object = await env.IMAGES.get(row.image_key);
  if (!object) return new Response("Não encontrado.", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}

// ---------------------------------------------------------------------------
// Rotas de admin
// ---------------------------------------------------------------------------

async function handleAdmin(pathname, request, env) {
  if (pathname === "/api/admin/people" && request.method === "GET") {
    return await listPeople(env);
  }

  if (pathname === "/api/admin/people" && request.method === "POST") {
    return await createPerson(request, env);
  }

  const personMatch = pathname.match(/^\/api\/admin\/people\/([^/]+)$/);
  if (personMatch && request.method === "PUT") {
    return await updatePerson(personMatch[1], request, env);
  }
  if (personMatch && request.method === "DELETE") {
    return await deletePerson(personMatch[1], env);
  }

  if (pathname === "/api/admin/settings" && request.method === "POST") {
    return await updateSettings(request, env);
  }

  return json({ error: "Rota de admin não encontrada." }, 404);
}

async function listPeople(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, display_name, aliases, active, created_at FROM people ORDER BY created_at DESC"
  ).all();

  const people = results.map((r) => ({
    id: r.id,
    displayName: r.display_name,
    aliases: JSON.parse(r.aliases || "[]"),
    active: !!r.active,
    createdAt: r.created_at,
    imageUrl: `/api/image/${r.id}`,
  }));

  return json({ people });
}

function parseAliases(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function createPerson(request, env) {
  const form = await request.formData();
  const file = form.get("image");
  const displayName = String(form.get("displayName") || "").trim();
  const aliases = parseAliases(form.get("aliases"));

  if (!file || typeof file === "string") {
    return json({ error: "É preciso enviar uma imagem." }, 400);
  }
  if (!displayName) {
    return json({ error: "O nome é obrigatório." }, 400);
  }

  const id = crypto.randomUUID();
  const imageKey = `people/${id}.jpg`;

  await env.IMAGES.put(imageKey, file.stream(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  });

  await env.DB.prepare(
    "INSERT INTO people (id, image_key, display_name, aliases, active) VALUES (?, ?, ?, ?, 1)"
  )
    .bind(id, imageKey, displayName, JSON.stringify(aliases))
    .run();

  return json({ id, imageUrl: `/api/image/${id}` }, 201);
}

async function updatePerson(id, request, env) {
  const existing = await env.DB.prepare("SELECT image_key FROM people WHERE id = ?").bind(id).first();
  if (!existing) return json({ error: "Pessoa não encontrada." }, 404);

  const form = await request.formData();
  const file = form.get("image");
  const displayNameRaw = form.get("displayName");
  const aliasesRaw = form.get("aliases");
  const activeRaw = form.get("active");

  let imageKey = existing.image_key;
  if (file && typeof file !== "string") {
    imageKey = `people/${id}.jpg`;
    await env.IMAGES.put(imageKey, file.stream(), {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });
  }

  const sets = ["image_key = ?"];
  const values = [imageKey];

  if (displayNameRaw != null && String(displayNameRaw).trim().length > 0) {
    sets.push("display_name = ?");
    values.push(String(displayNameRaw).trim());
  }
  if (aliasesRaw != null) {
    sets.push("aliases = ?");
    values.push(JSON.stringify(parseAliases(aliasesRaw)));
  }
  if (activeRaw != null) {
    sets.push("active = ?");
    values.push(activeRaw === "true" || activeRaw === "1" ? 1 : 0);
  }

  values.push(id);
  await env.DB.prepare(`UPDATE people SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return json({ ok: true });
}

async function deletePerson(id, env) {
  const existing = await env.DB.prepare("SELECT image_key FROM people WHERE id = ?").bind(id).first();
  if (!existing) return json({ error: "Pessoa não encontrada." }, 404);

  await env.IMAGES.delete(existing.image_key);
  await env.DB.prepare("DELETE FROM people WHERE id = ?").bind(id).run();

  return json({ ok: true });
}

async function updateSettings(request, env) {
  const body = await request.json().catch(() => null);
  const n = body && parseInt(body.questionsPerRound, 10);

  if (!Number.isFinite(n) || n < 1) {
    return json({ error: "Número de perguntas inválido." }, 400);
  }

  await env.DB.prepare("UPDATE settings SET questions_per_round = ? WHERE id = 1").bind(n).run();
  return json({ ok: true });
}
