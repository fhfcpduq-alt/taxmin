// 헤드리스 Edge + CDP로 랜딩페이지 동작 검증 (의존성 없음, Node 22+)
// 사용: node tools/cdp-test.mjs [url] [width] [height]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const EDGES = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'];
const EDGE = EDGES.find(p => existsSync(p));
const PORT = 9333;
const OUT = process.env.TC_OUT || 'C:/Users/1997s/AppData/Local/Temp/tc-shots';
const URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const proc = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${PORT}`,
  '--user-data-dir=C:/Users/1997s/AppData/Local/Temp/tc-edge-cdp', '--window-size=420,900', 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { proc.kill(); } catch {} });

async function getWs() {
  for (let i = 0; i < 60; i++) { try { const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); return j.webSocketDebuggerUrl; } catch { await sleep(250); } }
  throw new Error('CDP not reachable');
}
const ws = new WebSocket(await getWs());
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); const listeners = [];
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(JSON.stringify(d.error))) : res(d.result); } else if (d.method) listeners.slice().forEach(l => l(d)); };
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const waitEvent = (method, sid) => new Promise(res => { const l = d => { if (d.method === method && (!sid || d.sessionId === sid)) { listeners.splice(listeners.indexOf(l), 1); res(d.params); } }; listeners.push(l); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (m, p) => send(m, p, S);
await cdp('Page.enable'); await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await cdp('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A536N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 Instagram 300.0.0.0' });
const ev = async expr => { const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + JSON.stringify(r.exceptionDetails.exception?.description || '')); return r.result.value; };
const log = (k, v) => console.log(k, typeof v === 'string' ? v : JSON.stringify(v));
async function shot(name, full) {
  let clip; if (full) { const h = await ev('document.documentElement.scrollHeight'); clip = { x: 0, y: 0, width: W, height: h, scale: 1 }; }
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full, clip });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64')); console.log('shot', `${OUT}/${name}.png`);
}
const errors = [];
listeners.push(d => { if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.text + ' ' + (d.params.exceptionDetails.exception?.description || '')); });

// 0. 첫 화면
let loaded = waitEvent('Page.loadEventFired', S);
await cdp('Page.navigate', { url: URL }); await loaded;
await ev('document.fonts.ready.then(()=>true)'); await sleep(1300);
log('state0', await ev(`({scrollW:document.documentElement.scrollWidth, iw:innerWidth, timer:document.getElementById('tNum').textContent, bbarShow:document.getElementById('bbar').classList.contains('show'), cardBottom:Math.round(document.getElementById('scene').getBoundingClientRect().bottom), cutOn:document.getElementById('heroCut').classList.contains('on'), kakaoTarget:document.querySelector('.tbar .kbtn-sq').getAttribute('target')})`));
await shot('final-1-first-frame');

// 1. 터치 스크래치
await ev(`window.__cnt={down:0,move:0,up:0,cancel:0,tdown:0,tmove:0};const f=document.getElementById('foil');['pointerdown','pointermove','pointerup','pointercancel'].forEach(t=>f.addEventListener(t,()=>window.__cnt[t.slice(7)]++));f.addEventListener('touchstart',()=>window.__cnt.tdown++);f.addEventListener('touchmove',()=>window.__cnt.tmove++);true`);
log('raf', await ev(`(()=>{const t0=performance.now();return Promise.race([new Promise(r=>requestAnimationFrame(()=>r('fired '+Math.round(performance.now()-t0)+'ms'))),new Promise(r=>setTimeout(()=>r('NOT fired in 800ms'),800))])})()`));
const r = await ev(`(()=>{const r=document.getElementById('foil').getBoundingClientRect();return {l:r.left,t:r.top,w:r.width,h:r.height}})()`);
log('foil rect', r);
log('hit test at foil center', await ev(`(()=>{const e=document.elementFromPoint(${r.l + r.w / 2},${r.t + r.h / 2});return e&&(e.id||e.className)})()`));
const touch = (type, pts) => cdp('Input.dispatchTouchEvent', { type, touchPoints: pts });
await touch('touchStart', [{ x: r.l + 30, y: r.t + 25 }]);
let dir = 1, revealedAt = null;
for (let yy = r.t + 25; yy < r.t + r.h - 15 && !revealedAt; yy += 20) {
  for (let i = 0; i <= 12; i++) { const xx = dir > 0 ? r.l + 30 + i * (r.w - 60) / 12 : r.l + r.w - 30 - i * (r.w - 60) / 12; await touch('touchMove', [{ x: xx, y: yy }]); await sleep(12); }
  dir *= -1;
  if (await ev(`localStorage.getItem('taxcut_revealed')`) === '1') revealedAt = Math.round(yy - r.t);
}
await touch('touchEnd', []);
log('revealed mid-stroke at card y', revealedAt);
await sleep(1600);
log('events', await ev(`window.__cnt`));
log('cleared', await ev(`(()=>{const f=document.getElementById('foil');const o=document.createElement('canvas');o.width=f.width>>2;o.height=f.height>>2;const c=o.getContext('2d',{willReadFrequently:true});c.drawImage(f,0,0,o.width,o.height);const d=c.getImageData(0,0,o.width,o.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]<128)n++;return {ratio:(n/(d.length/4)).toFixed(3),fw:f.width,fh:f.height,lineWidth:f.getContext('2d').lineWidth,gco:f.getContext('2d').globalCompositeOperation}})()`));
if (process.env.TC_STAGE === 'scratch') { ws.close(); proc.kill(); process.exit(0); }
log('state1', await ev(`({revealed:localStorage.getItem('taxcut_revealed'), coupon:localStorage.getItem('taxcut_coupon'), codeShown:document.querySelector('#face [data-code]').textContent, faceCls:document.getElementById('face').className, foilCls:document.getElementById('foil').className, slotCls:document.getElementById('ctaSlot').className, slotH:document.getElementById('ctaSlot').offsetHeight, chipHidden:document.getElementById('chip').hidden, chipText:document.getElementById('chip').textContent, stampHidden:document.getElementById('stamp').hidden, pillHidden:document.getElementById('resPill').hidden, hCoupon:document.getElementById('h-coupon').value, rcptCodeHidden:document.getElementById('rcptCode').hidden, promptOff:document.getElementById('prompt').classList.contains('off')})`));
await ev(`document.getElementById('scene').scrollIntoView({block:'start'}); true`); await sleep(400);
await shot('final-2-revealed');

// 2. 예약 폼 (local 모드)
await ev(`document.getElementById('reserve').scrollIntoView({block:'start'}); true`); await sleep(500);
log('state2', await ev(`({bbarShowAtForm:document.getElementById('bbar').classList.contains('show'), testPillShown:!document.getElementById('testPill').hidden})`));
log('tel formatted', await ev(`(()=>{const s=(id,v)=>{const el=document.getElementById(id); el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true}));}; s('f-name','테스트 사장님'); s('f-tel','01012345678'); s('f-rev','연 3천만원 미만'); s('f-biz','기타'); s('f-bizEtc','반려동물 용품'); document.getElementById('f-noReg').click(); s('f-time','평일 오후 3~6시'); s('f-memo','오후 4시 이후 편해요'); document.getElementById('f-agree').click(); return document.getElementById('f-tel').value})()`));
await shot('final-3-form-filled');
await ev(`document.getElementById('form').requestSubmit(); true`); await sleep(900);
log('state3', await ev(`({formHidden:document.getElementById('form').hidden, okHidden:document.getElementById('okPanel').hidden, failHidden:document.getElementById('failPanel').hidden, saved:JSON.parse(localStorage.getItem('taxcut_reservations')||'[]').slice(-1)[0]})`));
await shot('final-4-submitted');

// 3. 전체 페이지 PNG
await ev('scrollTo(0,0); true'); await sleep(300);
await shot('final-full-page', true);

// 4. 이벤트 종료 상태
await ev(`localStorage.setItem('taxcut_event_start', String(Date.now()-40*60*1000)); localStorage.removeItem('taxcut_revealed'); localStorage.removeItem('taxcut_coupon'); localStorage.removeItem('taxcut_reservations'); true`);
loaded = waitEvent('Page.loadEventFired', S); await cdp('Page.reload'); await loaded; await ev('document.fonts.ready.then(()=>true)'); await sleep(900);
log('state4', await ev(`({tbar:document.getElementById('tbar').className, lbl:document.getElementById('tLbl').textContent, faceCls:document.getElementById('face').className, hCoupon:document.getElementById('h-coupon').value, chipHidden:document.getElementById('chip').hidden})`));
await shot('final-5-expired');

// 5. 360px 가로 넘침 검사 (타이머 초기화 후)
await ev(`localStorage.clear(); true`);
await cdp('Emulation.setDeviceMetricsOverride', { width: 360, height: 640, deviceScaleFactor: 2, mobile: true });
loaded = waitEvent('Page.loadEventFired', S); await cdp('Page.reload'); await loaded; await ev('document.fonts.ready.then(()=>true)'); await sleep(900);
log('state5', await ev(`(()=>{const vw=innerWidth,bad=[];document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect();if(r.width>0&&(r.right>vw+1||r.left<-1)&&!el.closest('.hero-cut,.card-glare,.strike,.sprite'))bad.push((el.id||el.className.baseVal||el.className)+':'+Math.round(r.left)+'-'+Math.round(r.right))});return {vw,scrollW:document.documentElement.scrollWidth,bad:bad.slice(0,10),l3Right:Math.round(document.querySelector('.l3').getBoundingClientRect().right),big55Right:Math.round(document.querySelector('.big55').getBoundingClientRect().right)}})()`));
await shot('final-6-360px');
log('js errors', errors);
ws.close(); proc.kill(); process.exit(0);
