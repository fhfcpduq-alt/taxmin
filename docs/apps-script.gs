/**
 * 택스컷 상담 예약 → 구글 시트 저장 + 사무실 이메일 알림
 * ---------------------------------------------------------------
 * 설치 방법 (약 5분)
 * 1) 구글 드라이브에서 새 스프레드시트 생성 → 이름 예: "택스컷 상담예약 DB"
 * 2) 시트 상단 메뉴 [확장 프로그램] → [Apps Script] → 이 코드 전체를 붙여넣기
 * 3) 아래 NOTIFY_EMAIL 을 사무실 메일로 수정 후 저장(Ctrl+S)
 * 4) 우측 상단 [배포] → [새 배포] → 유형 "웹 앱"
 *    - 실행 사용자: "나"  /  액세스 권한: "모든 사용자"  → 배포
 * 5) 생성된 "웹 앱 URL"(https://script.google.com/macros/s/.../exec)을
 *    index.html 상단 TAXCUT_CONFIG.RESERVATION_ENDPOINT 에 붙여넣기
 * ---------------------------------------------------------------
 */
var SHEET_NAME = '예약';
var NOTIFY_EMAIL = 'office@example.com'; // ← 사무실 이메일로 변경 (비우면 알림 안 보냄)

var HEADERS = [
  '접수시각', '이름/상호', '연락처', '매출액', '업종', '업종(기타)', '사업자등록일',
  '상담가능시간', '메모', '쿠폰코드', '이벤트 남은시간(초)', '유입경로', '개인정보동의', '처리상태'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var sheet = getSheet_();
    var row = [
      new Date(),
      data.name || '',
      "'" + (data.phone || data.tel || ''),           // 앞자리 0 보존
      data.revenue || '',
      industry_(data),
      data.industryEtc || '',
      data.regDate || (data.notRegistered ? '등록 전' : ''),
      data.timeSlot || data.time || '',
      data.memo || '',
      data.coupon || '',
      data.secondsLeft != null ? data.secondsLeft : '',
      data.source || '',
      (data.consent || data.agree) ? 'Y' : 'N',
      '대기'
    ];
    sheet.appendRow(row);
    notify_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// 브라우저에서 URL을 직접 열었을 때 동작 확인용
function doGet() {
  return json_({ ok: true, service: 'taxcut-reservation', sheet: SHEET_NAME });
}

// 페이지는 업종을 '기타: 직접입력' 형태로 보낼 수도 있음
function industry_(data) {
  var v = data.industry || '';
  if (data.industryEtc) return v;
  var m = /^기타:\s*(.+)$/.exec(v);
  if (m) { data.industryEtc = m[1]; return '기타'; }
  return v;
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify_(data) {
  if (!NOTIFY_EMAIL) return;
  var subject = '[택스컷] 새 상담 예약: ' + (data.name || '이름없음') + ' / ' + (data.phone || '');
  var body = [
    '새 상담 예약이 접수되었습니다.',
    '',
    '이름/상호: ' + (data.name || ''),
    '연락처: ' + (data.phone || data.tel || ''),
    '매출액: ' + (data.revenue || ''),
    '업종: ' + (data.industry || '') + (data.industryEtc ? ' (' + data.industryEtc + ')' : ''),
    '사업자등록일: ' + (data.regDate || (data.notRegistered ? '등록 전' : '')),
    '상담 가능 시간: ' + (data.timeSlot || data.time || ''),
    '메모: ' + (data.memo || ''),
    '쿠폰코드: ' + (data.coupon || ''),
    '이벤트 남은시간(초): ' + (data.secondsLeft != null ? data.secondsLeft : ''),
    '유입경로: ' + (data.source || ''),
    '',
    '시트에서 확인: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join('\n');
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (e) {
    // 메일 실패는 저장에 영향 주지 않음
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
