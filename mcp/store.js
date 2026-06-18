/**
 * FeatureStore — in-memory state for wireframe features.
 *
 * Each feature (keyed by slug) holds:
 *   model        – the WFModel JSON object
 *   queue        – feedback/approval blocks waiting to be read by the agent
 *   waiters      – resolve fns from pending wireframe_wait_feedback calls
 *   approved     – flipped true when the browser sends an APPROVED block
 *   openComments – extracted from the most recent block
 *   sockets      – active WebSocket connections for this feature
 */

import { info, warn } from "./log.js";

const features = new Map();

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "wireframe";
}

export function get(slug) {
  let f = features.get(slug);
  if (!f) {
    f = { model: null, queue: [], waiters: [], approved: false, openComments: 0, sockets: new Set() };
    features.set(slug, f);
  }
  return f;
}

export function setModel(slug, model) {
  const f = get(slug);
  const screenCount = model?.screens?.length || 0;
  const modalCount = model?.modals?.length || 0;
  info("store", `setModel "${slug}"`, { screens: screenCount, modals: modalCount });
  f.model = model;
  return f;
}

/**
 * Validate and normalize a model object.
 * Unwraps accidental `{ model: { screens } }` nesting.
 * Returns `{ ok: true, model }` or `{ ok: false, error }`.
 */
export function validateModel(raw) {
  let model = raw;
  if (model && !Array.isArray(model.screens) && model.model && Array.isArray(model.model.screens)) {
    warn("store", "model nested under 'model' key — unwrapping");
    model = model.model;
  }
  if (!model || !Array.isArray(model.screens)) {
    return {
      ok: false,
      error:
        `model.screens is ${!model ? "missing" : `not an array (got ${typeof model.screens})`}.\n` +
        `Pass the full WFModel object (with a "screens" array) as the "model" argument, not a wrapper around it.`,
    };
  }
  return { ok: true, model };
}

/**
 * Classify an incoming block from the browser, update status, and route it
 * to a waiting agent call or queue it.
 */
export function ingestBlock(slug, block) {
  const f = get(slug);
  const isApproval = /^=====\s*WIREFRAME APPROVED/m.test(block);
  const isFeedback = /^=====\s*WIREFRAME FEEDBACK/m.test(block);
  const type = isApproval ? "approval" : isFeedback ? "feedback" : "unknown";
  info("store", `ingestBlock "${slug}" type=${type}`, { waiters: f.waiters.length, queueLen: f.queue.length, blockLen: block.length });

  if (isApproval) {
    f.approved = true;
    const m = block.match(/(\d+)\s+open comment/);
    if (m) f.openComments = parseInt(m[1], 10);
  } else if (isFeedback) {
    const m = block.match(/END FEEDBACK \((\d+)\s+item/);
    if (m) f.openComments = parseInt(m[1], 10);
  }
  const waiter = f.waiters.shift();
  if (waiter) {
    info("store", `block delivered to waiting agent`, { slug });
    waiter(block);
  } else {
    info("store", `block queued (no waiter)`, { slug, queueLen: f.queue.length + 1 });
    f.queue.push(block);
  }
}

export function drainQueue(slug) {
  const f = get(slug);
  return f.queue.splice(0);
}

export function waitForBlock(slug, timeoutMs = 3600000) {
  const f = get(slug);
  if (f.queue.length) {
    info("store", `waitForBlock "${slug}" — drained from queue`, { queueLen: f.queue.length - 1 });
    return Promise.resolve(f.queue.shift());
  }
  info("store", `waitForBlock "${slug}" — waiting`, { timeoutMs, existingWaiters: f.waiters.length });
  return new Promise((resolve) => {
    const onBlock = (b) => { clearTimeout(timer); resolve(b); };
    let timer;
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        const i = f.waiters.indexOf(onBlock);
        if (i !== -1) f.waiters.splice(i, 1);
        warn("store", `waitForBlock "${slug}" timed out after ${timeoutMs}ms`);
        resolve(null);
      }, timeoutMs);
    }
    f.waiters.push(onBlock);
  });
}

export function broadcast(slug, msg) {
  const f = features.get(slug);
  if (!f) return;
  const payload = JSON.stringify(msg);
  let sent = 0;
  for (const s of f.sockets) {
    try { if (s.readyState === 1) { s.send(payload); sent++; } } catch (_) { }
  }
  info("store", `broadcast "${slug}" type=${msg.type}`, { sent, total: f.sockets.size });
}
