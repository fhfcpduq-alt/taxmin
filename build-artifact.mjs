// index.html(standalone) -> artifact.html(아티팩트용 본문 조각) 변환
// 아티팩트는 publish 시 자체 <!doctype html><html><head><body> 로 감싸므로
// 우리 파일에서 그 껍데기(doctype/html/head/body/meta 태그)만 걷어내고
// <title>/<style>부터 남긴다. body{} CSS 규칙은 아티팩트의 body에 그대로 적용된다.
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const bodyAttr = (src.match(/<body([^>]*)>/i) || [, ''])[1].trim();
let out = src
  .replace(/^\s*<!doctype[^>]*>\s*/i, '')
  .replace(/<html[^>]*>/i, '')
  .replace(/<\/html>\s*$/i, '')
  .replace(/<head[^>]*>/i, '')
  .replace(/<\/head>/i, '')
  .replace(/<body[^>]*>/i, '')
  .replace(/<\/body>/i, '')
  .replace(/<meta[^>]*>\s*/gi, '');
if (bodyAttr) {
  // body에 class/data 속성이 있었다면 런타임에 복원
  const attrs = [...bodyAttr.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => `document.body.setAttribute(${JSON.stringify(m[1])},${JSON.stringify(m[2])});`).join('');
  out = out.replace(/<title>/i, `<script>${attrs}</script>\n<title>`);
}
writeFileSync(new URL('./artifact.html', import.meta.url), out.trim() + '\n');
console.log('artifact.html written:', out.length, 'chars');
