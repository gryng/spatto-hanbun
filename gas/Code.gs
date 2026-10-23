/**
 * スパッと半分 オンラインランキング（Google Apps Script）
 *
 * 使い方
 *   1. 新しいGoogleスプレッドシートを作り、「拡張機能 → Apps Script」を開く
 *   2. このファイルの中身をまるごと貼り付けて保存
 *   3. 「デプロイ → 新しいデプロイ」で種類「ウェブアプリ」を選び、
 *      実行ユーザー「自分」、アクセスできるユーザー「全員」でデプロイ
 *   4. 発行された「ウェブアプリのURL（…/exec）」をゲームの RANK_URL に設定
 *
 * 記録はスプレッドシートの「scores」シートに1プレイ1行で追記される。
 * ランキングは名前ごとの最高スコアで並べる（名前の大文字小文字は区別しない）。
 */
const SHEET_NAME = 'scores';
const TOP_N = 50;

/** ランキングを返す。?points=N を付けると、その点数が何位にあたるか（rank）も返す */
function doGet(e) {
  const p = e && e.parameter ? Number(e.parameter.points) : NaN;
  return json_(buildRanking_(Number.isFinite(p) ? { points: p } : null));
}

/** スコアを登録して、登録後のランキングと順位を返す */
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }
  const entry = validate_(data);
  if (!entry) return json_({ ok: false, error: 'invalid' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([new Date(), entry.name, entry.points, entry.cuts, entry.perfects, entry.maxCombo, entry.version]);
  } finally {
    lock.releaseLock();
  }
  return json_(buildRanking_(entry));
}

/** 送られてきた値の形と、ゲームのルール上ありえる範囲かを確認する */
function validate_(d) {
  if (!d || typeof d !== 'object') return null;
  const name = String(d.name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 12);
  const points = Math.floor(Number(d.points));
  const cuts = Math.floor(Number(d.cuts));
  const perfects = Math.floor(Number(d.perfects));
  const maxCombo = Math.floor(Number(d.maxCombo));
  if (!name) return null;
  if (![points, cuts, perfects, maxCombo].every(n => Number.isFinite(n) && n >= 0)) return null;
  if (cuts > 5000 || perfects > cuts || maxCombo > cuts) return null;
  if (points > maxPoints_(cuts)) return null;
  return { name, points, cuts, perfects, maxCombo, version: String(d.version || '').slice(0, 16) };
}

/**
 * その回数で理論上とれる最高点（全部 誤差0.5%未満・ノーミス）。
 * ゲーム側の配点（精度点100 + ボーナス100 = 200点 × コンボ倍率 1.0〜2.0、0.1ずつ上昇）と合わせること。
 */
function maxPoints_(cuts) {
  let max = 0;
  for (let i = 1; i <= cuts; i++) max += Math.round(200 * Math.min(1 + 0.1 * (i - 1), 2));
  return max;
}

function buildRanking_(entry) {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const best = {};
  rows.forEach(r => {
    const name = String(r[1]);
    const key = name.toLowerCase();
    const points = Number(r[2]) || 0;
    if (!best[key] || points > best[key].points) best[key] = { name, points, cuts: Number(r[3]) || 0 };
  });
  const list = Object.keys(best).map(k => best[k]).sort((a, b) => b.points - a.points);
  const res = { ok: true, top: list.slice(0, TOP_N), players: list.length };
  if (entry) res.rank = list.filter(p => p.points > entry.points).length + 1;
  return res;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['日時', '名前', 'スコア', '斬った数', 'ど真ん中', '最大コンボ', 'バージョン']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
