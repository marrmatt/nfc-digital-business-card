import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { Script } from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '..', 'TapSync — App Prototype (1).html'), 'utf8');

function embeddedDocument(id) {
  const match = html.match(new RegExp('<script[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)<\\/script>', 'i'));
  assert.ok(match, 'missing embedded document: ' + id);
  return JSON.parse(match[1]);
}

const landing = embeddedDocument('src-landing');
const dashboard = embeddedDocument('src-dash');

function inlineScripts(documentText, label) {
  return [...documentText.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => !/\btype=["']application\/json/i.test(match[1]))
    .filter((match) => !/\bsrc\s*=/i.test(match[1]))
    .map((match, index) => ({ label, index, source: match[2] }));
}

test('embedded documents and inline JavaScript parse', () => {
  const scripts = [
    ...inlineScripts(html, 'shell'),
    ...inlineScripts(landing, 'landing'),
    ...inlineScripts(dashboard, 'dashboard'),
  ];
  assert.ok(scripts.length >= 7, 'expected to inspect the embedded inline scripts');
  for (const item of scripts) {
    assert.doesNotThrow(
      () => new Script(item.source, { filename: item.label + '-inline-' + item.index + '.js' }),
      item.label + ' inline script ' + item.index + ' should parse',
    );
  }
});

test('fake public domain is absent from the app documents', () => {
  assert.doesNotMatch(html + landing + dashboard, /yourbrand\.et/i);
});

test('profile address is a local draft and public sharing stays disabled', () => {
  assert.match(dashboard, /url: function \(\) \{ return ''; \}/);
  assert.match(dashboard, /Public sharing is unavailable until online publishing is connected/);
  assert.match(dashboard, /el\.disabled = !publicUrl/);
  assert.match(dashboard, /QR code unavailable until online publishing is connected/);
  assert.match(dashboard, /if \(!TapSync\.url\(\)\) \{ toast\('QR unavailable'/);
  assert.match(dashboard, /Draft address \(not published\)/);
});

test('all public-link and share controls receive the unavailable state', () => {
  assert.ok(dashboard.includes("var publicUrl = TapSync.url();\n    $$('[data-href=\"url\"]').forEach(function (el) {"));
  assert.ok(dashboard.includes("var text = encodeURIComponent(state.profile.name + ' - ' + state.profile.title);\n    $$('[data-share]').forEach(function (el) {"));
  assert.ok(dashboard.includes("$$('[data-action=\"copy-link\"], [data-action=\"download-qr\"], [data-action=\"print-qr\"], [data-action=\"native-share\"], [data-action=\"show-qr\"]').forEach(function (el) {"));
  assert.match(dashboard, /el\.disabled = !publicUrl/);
});

test('old placeholder values are migrated and signup creates only a draft slug', () => {
  assert.ok(dashboard.includes('yourbrand(?:\\.et)?'));
  assert.ok(dashboard.includes('next.profile.url=DEFAULTS.profile.url'));
  assert.match(dashboard, /url: 'natnael'/);
  assert.match(html, /url:first/);
});

test('authentication stubs explain their limits and do not fake Google sign-in', () => {
  assert.match(landing, /Prototype demo only: no account is created/);
  assert.match(landing, /Password reset is not connected in this prototype/);
  assert.match(landing, /Google sign-in is not connected in this prototype/);
  assert.match(landing, /Opening demo…/);
  const googleHandler = landing.match(/\$\('google'\)\.addEventListener\('click',function\(\)\{([\s\S]*?)\}\);/);
  assert.ok(googleHandler, 'Google stub handler should exist');
  assert.match(googleHandler[1], /err\(/);
  assert.doesNotMatch(googleHandler[1], /parent\.postMessage/);
});

test('draft address editor accepts the default local slug without publishing it', () => {
  assert.ok(dashboard.includes('var isSlug=/^[a-z0-9]'));
  assert.ok(dashboard.includes('if((!isSlug&&!domainPath)||value.length>240)'));
});

test('external link rendering retains URL validation and HTML escaping helpers', () => {
  assert.ok(dashboard.includes("return /^https?:$/.test(u.protocol) && u.hostname && !u.username && !u.password ? u.href : '';"));
  assert.ok(dashboard.includes('function esc(v)'));
  assert.ok(dashboard.includes("esc(safeUrl(l.url))"));
});

test('disabled share anchors have valid accessible markup', () => {
  const shareAnchors = [...dashboard.matchAll(/<a\\b[^>]*data-share="[^"]+"[^>]*>/g)].map((match) => match[0]);
  assert.equal(shareAnchors.length, 4, 'expected the four supported share-channel controls');
  for (const anchor of shareAnchors) {
    assert.match(anchor, /\\baria-disabled="true"/);
    assert.match(anchor, /\\btabindex="-1"/);
    assert.doesNotMatch(anchor, /\\btabindex="-1\\s+rel=/);
  }
});
