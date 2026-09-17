# 택스컷 랜딩페이지 — 배포·설정 안내

## 파일 구성
| 파일 | 용도 |
|---|---|
| `index.html` | **배포용 단일 파일.** 그대로 웹호스팅(taxmin.kr 하위 경로, Vercel/Netlify/Cloudflare Pages 등)에 올리면 됨 |
| `artifact.html` | claude.ai 아티팩트 미리보기용 본문(자동 생성, 수정 불필요) |
| `build-artifact.mjs` | `index.html` → `artifact.html` 변환 스크립트 (`node build-artifact.mjs`) |
| `assets/logo-badge.svg`, `assets/logo-wordmark.svg` | 로고(페이지에는 인라인 포함됨. 실제 로고 파일로 교체 가능) |
| `docs/apps-script.gs` | 예약 폼 → 구글 시트 저장 + 이메일 알림 웹훅 샘플 |
| `docs/BRIEF.md`, `docs/BUILD-SPEC.md` | 요구사항·디자인 스펙(수정 요청 시 기준 문서) |
| `tools/cdp-test.mjs` | 헤드리스 Edge로 스크래치·폼·타이머 종료·360px 넘침을 자동 검증하고 PNG를 뽑는 스크립트 (`node tools/cdp-test.mjs`) |
| `shots/` | 최종본 스크린샷 PNG |

## 1. 예약 데이터(DB) 연결 — 구글 시트 방식 (약 5분)
1. 구글 드라이브 → 새 스프레드시트 생성 (예: `택스컷 상담예약 DB`)
2. 메뉴 **확장 프로그램 → Apps Script** → `docs/apps-script.gs` 내용 전체 붙여넣기
3. 코드 상단 `NOTIFY_EMAIL` 을 사무실 이메일로 변경 → 저장
4. **배포 → 새 배포 → 유형: 웹 앱** → 실행 사용자 **나**, 액세스 **모든 사용자** → 배포 → 권한 승인
5. 생성된 웹 앱 URL(`https://script.google.com/macros/s/…/exec`)을 `index.html` 상단의
   ```js
   window.TAXCUT_CONFIG = {
     RESERVATION_ENDPOINT: '여기에 붙여넣기',
     RESERVATION_MODE: 'auto',   // auto: ENDPOINT 있으면 webhook, 없으면 local(테스트)
     ...
   }
   ```
   에 넣고 저장 → 배포.
6. 예약이 들어오면 시트 `예약` 탭에 한 줄씩 쌓이고, 지정한 이메일로 알림이 감. 시트 `처리상태` 열에 `완료`/`부재중` 등 직접 기록해 관리.

> 다른 저장소(Supabase, Firebase, 자체 서버 API)를 쓸 경우: 같은 `RESERVATION_ENDPOINT`에 JSON POST를 받는 URL을 넣고 `WEBHOOK_JSON: true`로 바꾸면 `application/json`으로 전송하고 응답의 `ok` 값을 확인한다. 전송 필드: `name, phone, revenue, industry, industryEtc, regDate, notRegistered, timeSlot, memo, coupon, secondsLeft, source, consent, submittedAt`.

## 2. 테스트 모드
`RESERVATION_ENDPOINT`가 비어 있으면 자동으로 **테스트 모드**: 예약 내용이 그 기기의 브라우저(localStorage `taxcut_reservations`)에만 저장되고, 폼 제목 아래에 `테스트 모드: 이 기기에만 저장됨` 표시가 뜬다. 아티팩트 미리보기는 항상 테스트 모드다(아티팩트 보안 정책상 외부 전송이 차단됨).

## 3. 바꿔야 할 자리 (검색: `고객사 확인 필요`)
- 푸터 신뢰 블록: 세무사 성명 / 사무소 주소 / 사업자등록번호 / 대표전화
- 개인정보 보유기간 문구, FAQ `계약 기간은?` 답변
- 로고: 인라인 SVG를 실제 로고 파일(SVG 권장)로 교체 가능

## 4. 이벤트 로직 요약
- 타이머 30분은 **그 기기에서 페이지를 처음 연 시각** 기준(localStorage). 새로고침해도 이어지고, 다음날 다시 오면 종료 상태로 보임. `EVENT_MINUTES`로 조정.
- 쿠폰코드 `TC-XXXX`는 긁을 때 1회 생성·저장. 상담 시 고객이 말한 코드 + 예약 시트의 `이벤트 남은시간(초)` 열로 30분 조건 확인.
- 타이머 종료 후에는 코드가 발급되지 않고, 상담 CTA는 그대로 유지된다.

## 5. 광고 유입 추적
광고 링크에 `?utm_source=daangn` / `?utm_source=instagram` 을 붙이면 예약 데이터의 `유입경로` 열에 기록된다.
