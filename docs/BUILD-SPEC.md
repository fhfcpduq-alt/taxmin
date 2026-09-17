# 택스컷 랜딩페이지 — 최종 빌드 스펙 (v1, 디자인 패널 3인 심사 합의본)

> 이 문서는 `BRIEF.md`(요구사항) 위에 얹는 **디자인/구현 확정안**이다. 충돌 시 이 문서가 우선.
> 컨셉명: **CUT LINE — 한 줄로 자르는 에디토리얼.**
> 논지: 로고의 민트그린 취소선(자르는 선) 하나가 페이지의 유일한 장식이다. 히어로에서 화면 끝에서 끝까지 그어지며 55,000원을 잘라 0원으로 만들고, 타이머의 진행선·CTA 밑줄·섹션 룰·FAQ 표시·절차 레일이 전부 같은 각도의 같은 선이다. 서체는 로고의 서체(Black Han Sans 한글 + Montserrat 900 숫자)를 헤드라인 크기로 키운 것이라 페이지 전체가 '택스컷 워드마크'처럼 읽힌다. 3D로 떠 있는 물체는 스크래치 카드 하나뿐.

---

## 1. 토큰 (전부 `:root`에 선언. 이 밖의 색 사용 금지)
```css
:root{
  --navy-950:#070D18; /* 푸터, 배지 그라데이션 끝, 카드 그림자색, 카드 두께층 */
  --navy-900:#0B1526; /* body 배경(명시), 히어로, 왜 택스컷, 최종CTA-A, 종이 위 텍스트색 */
  --navy-800:#16243A; /* 띠: 타이머 바, 하단 CTA 바, 진행 절차 밴드, 카드 베이스 */
  --navy-700:#1F2F49; /* 헤어라인, 구분선, 종이 위 인풋 보더, 배지 링 */
  --navy-500:#3A4B66; /* 비활성 컨트롤, 스트라이프 텍스처(3% 알파) */
  --ink:#FFFFFF;      /* 네이비 위 헤드라인 */
  --ink-soft:#C9D2E3; /* 네이비 위 본문 */
  --ink-mute:#8F9DB5; /* 네이비 위 캡션/타이머 라벨/푸터 작은 글씨 */
  --green:#3DDC84;    /* 네이비 위의 '그 선', 링크, 타이머 진행선, 포커스링, 컨페티 */
  --green-deep:#1FB86A; /* 그린 요소 hover/pressed */
  --green-ink:#0E8F4F; /* 종이(밝은) 면 위의 선/밑줄/아이브로우/포커스링. 네이비 위 텍스트로 쓰지 말 것 */
  --paper:#F4F6FA;    /* 밝은 '영수증' 면: 가격, FAQ, 예약 폼 */
  --paper-2:#E6EAF2;  /* 인풋 채움, 표 교차행, FAQ 열림 배경 */
  --paper-line:#CBD3E1; /* 종이 위 헤어라인 */
  --paper-mute:#4E5D78; /* 종이 위 캡션/각주 */
  --kakao:#FEE500; --kakao-ink:#191919; /* 카카오 버튼 전용. 그린 섞지 말 것 */
  --alert:#FFB020;    /* 타이머 5분 미만의 선+숫자에만 */
  --error:#B42318;    /* 종이 위 폼 오류 텍스트 */
  --foil-hi:#E9EDF3; --foil-mid:#C7CDD8; --foil-lo:#AEB6C4; /* 스크래치 포일 */
  --cut-angle:-5deg;  /* ★ 페이지의 단 하나의 각도. 워드마크 취소선 비율. 히어로 선, 타이머 팁, 섹션 룰, FAQ 표시, 절차 레일, 쿠폰 밑줄 전부 이 값 */
}
```
- 그린을 **종이(밝은 면) 위 텍스트**로 쓰지 말 것(대비 실패). 종이 위에서 그린은 오직 `--green-ink` 선/밑줄.
- 컨페티/스탬프 색도 토큰만(--green, --green-deep, --paper, --ink). 앰버(--alert)는 타이머 5분 미만 외 사용 금지.
- 단일 다크 테마(브랜드 고정). `body{background:var(--navy-900);color:var(--ink-soft)}` 명시. 미디어쿼리 다크 블록 불필요.

## 2. 타이포
- 로드(1개 link, preconnect `https://fonts.gstatic.com` crossorigin 포함):
  `https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Montserrat:wght@700;900&family=Noto+Sans+KR:wght@400;700&display=swap`
- **display(한글 헤드라인)**: `'Black Han Sans','Do Hyeon','Apple SD Gothic Neo','Malgun Gothic',sans-serif`, `font-weight:400`(단일 굵기), line-height 1.1, letter-spacing -0.01em. `font-synthesis:none`.
- **숫자/코드/타이머**: 반드시 `<span class="num">`로 감싸고 `.num{font-family:Montserrat,'Arial Black',Arial,sans-serif;font-weight:900;font-variant-numeric:tabular-nums;letter-spacing:-0.02em}`. (스택 순서 트릭 금지 — 명시적으로 감쌀 것.)
- **body**: `'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif` 15px/1.55 모바일, 16px/1.6 데스크톱, 본문 max-width 34ch.
- 아이브로우: Montserrat 700 11px uppercase letter-spacing .3em (워드마크의 'TAXCUT' 캡션과 동일 성격).
- 헤드라인 크기는 전부 `clamp()`. 360px 폭에서 줄바꿈 깨짐 없어야 함(아래 §4).
- 타이머 숫자는 각 자리 `min-width:.62em; display:inline-block; text-align:center` 로 흔들림 방지.

## 3. 페이지 구조 (위→아래)

### 00 상단 고정 타이머 바 (48px, `position:fixed; top:0; z-index:50`, `--navy-800`, 아래 1px `--navy-700`)
- 좌: 24px 배지 SVG(인라인). 그 옆 2줄: 라벨 `첫 달 기장료 무료까지`(≥600px에서 `첫 달 기장료 무료까지 남은 시간`) 11px `--ink-mute` / 숫자 `29:59` `.num` 20px 흰색.
- 우: **36px 카카오 옐로 정사각 버튼**(인라인 말풍선 SVG, `aria-label="카카오톡 상담"`). 텍스트 링크 아님.
- 리빌 후: 우측 버튼 왼쪽에 **쿠폰 칩** `TC-4821`(Montserrat 900 13px, 점선 그린 보더, 탭하면 복사 → `복사됨` 1.5초).
- 바 아래 모서리에 **3px `--green` 진행선**: `transform:scaleX(remaining/total)` `transform-origin:left`, 1초 linear 트랜지션. 선 오른쪽 끝에 6px `::after` 팁을 `skewX(var(--cut-angle))`로 기울여 '자르는 날' 느낌.
- **로직**: `TAXCUT_CONFIG.EVENT_MINUTES=30`. 첫 진입 시 `Date.now()`를 `taxcut_event_start`에 저장(guarded storage helper, 메모리 폴백). 매 초 **저장된 타임스탬프에서 남은 시간 계산**(감산 금지). `visibilitychange`/`pageshow`에서 즉시 재계산.
- 5:00 미만: 선+숫자 `--alert`, 라벨 `5분 남았어요 — 카톡 한 줄이면 돼요`, 숫자 1Hz opacity 펄스(reduced-motion이면 색만).
- 0:00: 선 scaleX(0), 숫자 숨김, 라벨 한 줄 `이벤트 시간이 종료되었어요. 그래도 상담은 가능해요`. 카카오 버튼·모든 CTA 유지. 폼 hidden `remaining_seconds=0`.
- 접근성: 숫자는 aria-live 밖. 시각적으로 숨긴 `aria-live="polite"` span이 **분이 바뀔 때만** `남은 시간 약 N분` 갱신.
- `body{padding-top:48px}`, 앵커 `scroll-margin-top:64px`.

### 01 히어로 (`--navy-900`, 상단 360px에 유튜브 배너식 스트라이프 텍스처: `repeating-linear-gradient(45deg, rgba(255,255,255,.03) 0 1px, transparent 1px 9px)` + 아래로 투명 마스크)
- 패딩 `56px 16px 40px`, 전부 좌정렬, ragged right. 히어로 래퍼 `overflow:clip`(선이 뷰포트 밖으로 나가도 가로스크롤 금지).
- 로고 행: 32px 배지 + 110px 워드마크(둘 다 인라인 SVG, 페이지 웹폰트 상속) + 우측 `세무회계 민` 11px `--ink-mute`.
- 아이브로우: `첫 창업 사장님을 위한 세무 기장 서비스` (Montserrat 대신 Noto 700 11px `--green` 자간 .1em — 한글이므로).
- **헤드라인** (`<h1>` 안에 줄별 `<span class="l1|l2|l3|l4">` `display:block`, 줄바꿈은 우리가 정한다):
  - l1 `첫 달 기장료,` — Black Han Sans `clamp(30px, 8.5vw, 44px)` 흰색
  - l2 `55,000원` — `.num` `clamp(48px, 14vw, 72px)` 흰색 (`원`은 Black Han Sans 60% 크기). **히어로 컷 선이 이 줄을 관통.** 선이 다 그어지면 이 줄 opacity .55.
  - l3 `0원으로` — `0원`의 `0`은 `.num` `--green` `clamp(56px, 17vw, 88px)`, `원`은 Black Han Sans `--green` 70%, `으로`는 Black Han Sans 흰색 `clamp(26px, 7.5vw, 34px)` baseline 정렬. **380px 미만이면 0원 크기 60px로 한 단계 다운**. 브라우저가 이 줄을 임의로 접지 못하게 `white-space:nowrap`.
  - l4 `잘라드릴게요.` — Black Han Sans `clamp(26px, 7.5vw, 34px)` 흰색
- **히어로 컷 선**: 절대배치 SVG `<line>`이 `-5vw → 105vw`로 `--cut-angle` 기울기로 l2의 세로 중앙을 관통(좌하→우상). 5px `--green` round cap. `stroke-dasharray/offset`으로 150→800ms `cubic-bezier(.2,.8,.2,1)` 드로잉. 위치는 l2의 `getBoundingClientRect`로 계산해 CSS 변수로 주입; `document.fonts.ready`·resize(높이만 120px 미만으로 바뀌는 인앱 툴바 리사이즈는 무시)·orientationchange에서 재계산. reduced-motion이면 처음부터 그어진 상태. 데스크톱에선 선이 카드 **뒤로** 지나감(z-index).
- **조건 라인(독립 블록)**: 왼쪽 2px `--green` 세로 룰, Noto 700 14px 흰색: `이 페이지에서 30분 안에 상담 및 계약 완료 시 첫 달 기장료 무료`
- 서브카피 Noto 15px/1.55 `--ink-soft` max-width 34ch: `세무를 몰라도 괜찮아요, 사장님. 카톡 한 줄로 세무사와 상담하고, 계약은 온라인으로 끝나요. 아래 카드를 긁으면 첫 달 0원 쿠폰이 나와요.`
- **스크래치 카드** (§4) — 서브카피 16px 아래. 400×660 첫 프레임에서 카드 하단이 보이도록 히어로 하단 패딩 확보(하단 바는 첫 화면에 없음, §08).
- 카드 아래 44px 높이 탭 가능한 행(링크): `긁지 않아도 돼요 · 바로 카톡 상담 →` 14px `--green` 2px 밑줄.
- 4초 동안 긁지 않으면 그 아래에 `긁기 어려우세요? 탭해서 열기` 13px 링크 등장(리빌 수행).
- **리빌 후 CTA 슬롯**(카드 아래, 접힌 상태 `height:0; overflow:hidden; aria-hidden`, 리빌 시 300ms max-height 확장, 내용은 처음부터 opacity 1): 카카오 버튼 56px 풀폭(`--kakao`/`--kakao-ink`, 인라인 말풍선 SVG, `카톡으로 바로 상담하기`, 아래 12px 캡션 `질문 한 줄부터 괜찮아요`) → 흰 1.5px 아웃라인 버튼 `전화 상담 예약하기`(3px 그린 밑줄, 누르면 `#reserve`로 스크롤 후 이름 필드 포커스) → 12px `--ink-mute` `쿠폰코드 TC-4821을 상담 때 말씀해 주세요` → 11px 카카오 안내 `카톡이 열리지 않으면 우측 상단 ⋯ 메뉴에서 「브라우저로 열기」를 눌러 주세요`. 확장 후 `scrollIntoView({block:'nearest'})`로 카카오 버튼 노출.
- 데스크톱 ≥1024: 12컬럼, 텍스트 7컬럼, 카드 8~12컬럼 세로 중앙 420×248.

### 02 가격 — '영수증' (`--paper`, 텍스트 `--navy-900`, 모서리 각지게, 카드 없음, 상단에 톱니(찢은 종이) `clip-path` 8px 이빨)
- 아이브로우 `PRICE` Montserrat 700 11px `--green-ink` + 24px `--green-ink` 룰(각도 `--cut-angle`). 제목 `요금, 솔직하게.` Black Han Sans 30px.
- 원문 그대로 Noto 700 18px: `1개월 기장료 55,000원 (부가세 포함)`
- 큰 숫자 `55,000` `.num` `clamp(72px, 24vw, 160px)` + `원` Black Han Sans 40px. 뷰포트 진입 시(IO once, threshold .5) 8px `--green-ink` 선이 500ms 동안 관통(reduced-motion이면 즉시). 바로 아래 `첫 달` Black Han Sans 24px + `0원` `.num` `clamp(80px, 30vw, 120px)` `--navy-900` + 6px `--green-ink` **밑줄**(0원은 절대 취소선 치지 않음) 300ms.
- 3행 헤어라인 표(Noto 15px, `--paper-line`, `--paper-2` 교차): `첫 달 기장료 — 0원` / `둘째 달부터 — 55,000원 (부가세 포함)` / `매출액 구간 — 상담 시 안내`
- 각주 13px `--paper-mute`, 앞에 16px `--green-ink` 대시: `※ 매출액에 따라 달라질 수 있습니다.` / `※ 2개월째부터는 기장료가 정상 청구돼요.`
- 조건 라인 13px: `이 페이지에서 30분 안에 상담 및 계약 완료 시 첫 달 기장료 무료`
- 영수증 바닥 줄: 리빌 전 `쿠폰은 위의 카드를 긁으면 나와요 ↑`(카드로 스크롤하는 링크) → 리빌 후 `쿠폰 TC-4821 적용`
- 데스크톱: 숫자 좌, 표 우.

### 03 왜 택스컷 (`--navy-900`)
- 아이브로우 `WHY TAXCUT`, 제목 `처음이라 모르는 게 당연해요.` Black Han Sans 30px(44px 데스크톱), 리드 Noto 15px `--ink-soft`: `지어낸 숫자 대신, 실제로 하는 것만 적었어요.`
- 4포인트, 카드 없음. 모바일 1열 32px 간격, 데스크톱 2×2 + 1px `--navy-700` 헤어라인 그리드. 각 포인트: 제목 뒤에 **Montserrat 900 36px `--green` 40% 투명 숫자(01~04)**를 배경처럼 겹치거나, 배지 어휘로 그린 28px 2px-stroke 라인 아이콘(말풍선 / 사람+배지 / 새싹 / 재생 삼각형) 중 하나로 위계 추가. 제목 Black Han Sans 22px 흰색, 본문 Noto 15px `--ink-soft`. 각 제목 위 28px `--green` 룰(`--cut-angle`).
  1. `카톡으로 편하게` — `영수증 사진 한 장, 질문 한 줄. 카톡으로 보내주시면 돼요. 전화 통화가 어색해도 괜찮아요.`
  2. `세무사가 직접` — `상담부터 신고까지 세무사가 직접 봐요.`
  3. `첫 창업 사장님 맞춤` — `사업자등록 전이어도, 매출이 아직 없어도 상담부터 시작하세요.`
  4. `유튜브 택스컷` — `세금 이야기는 유튜브 @taxcut_min에서 계속 드려요.` (제목이 `https://www.youtube.com/@taxcut_min` 외부 링크)
- 고객 수, 절세액 등 **지어낸 수치 금지**.

### 04 진행 절차 (`--navy-800` 밴드)
- 아이브로우 `HOW IT WORKS`, 제목 `30분이면 돼요.` 3단계(실제 순서이므로 번호 사용). 모바일: 왼쪽 3px `--green` 세로 레일이 번호를 관통(IO 진입 시 위→아래 600ms 드로잉). 데스크톱: 가로 레일.
- 번호 `01/02/03` `.num` 36px `--green`, 제목 Black Han Sans 22px, 본문 Noto 15px `--ink-soft`.
  1. `카톡 또는 전화 상담` — `궁금한 것부터 편하게 물어보세요.`
  2. `온라인 계약` — `방문 없이 온라인으로 계약해요.`
  3. `기장 시작, 첫 달 0원` — `자료만 보내주시면 장부는 저희가 만들어요.`
- 노트 13px `--ink-mute`: `01~02가 이 페이지에서 30분 안에 끝나면 첫 달이 0원이에요.`
- 마무리 링크: `지금 1단계 시작하기 → 카톡 상담`

### 05 FAQ (`--paper`)
- 아이브로우 `FAQ`, 제목 `자주 묻는 질문` Black Han Sans 30px `--navy-900`. 5개 native `<details>`, 1px `--paper-line` 구분, summary Noto 700 16px 56px 높이, 표시자는 16px `--green-ink` 선이 열릴 때 45°→90° 회전(쉐브론 아님), 답변 Noto 15px/1.6 `--paper-mute`, 열린 배경 `--paper-2`.
  - `기장이 뭔가요?` — `매달 매출·매입 자료를 정리해 장부를 만들고, 부가세·종합소득세 신고까지 이어지는 세무 관리예요. 사장님은 자료만 보내주시면 돼요.`
  - `매출이 아직 없어도 되나요?` — `네. 사업자등록 전이거나 매출이 0원이어도 상담부터 시작하실 수 있어요. 시작 시점은 상담 때 같이 정해요.`
  - `30분 조건은 어떻게 확인하나요?` — `이 페이지 상단 타이머가 기준이에요. 타이머가 남아 있을 때 상담과 계약이 완료되면 첫 달 기장료가 무료예요. 카톡이나 예약 폼에 쿠폰코드를 남겨주시면 확인이 빨라요.`
  - `첫 달 이후 비용은?` — `1개월 기장료 55,000원 (부가세 포함)이 기본이고, 매출액에 따라 달라질 수 있습니다. 정확한 금액은 상담 때 안내드려요.`
  - `계약 기간은?` — `계약 기간과 해지 조건은 상담 시 안내드려요.` (코드 주석으로 `<!-- 고객사 확인 필요 -->`)

### 06 최종 CTA (모바일 세로 스택, 데스크톱 5:7)
- A) `--navy-900`: 제목 `카톡이 제일 빨라요` Black Han Sans 30px, 서브 `영업시간 내 순서대로 답장드려요.` 15px `--ink-soft`, 카카오 버튼 56px 풀폭 `카톡으로 바로 상담하기` + 캡션 `질문 한 줄부터 괜찮아요` + 11px `브라우저로 열기` 안내.
- B) `#reserve` `--paper`: 제목 `전화로 예약할게요` Black Han Sans 30px `--navy-900`, 리빌 후 제목 옆 쿠폰 코드 필(이벤트 종료 시 필 없음). 라벨 위, 인풋 48px 6px radius 1.5px `--navy-700` 보더 `--paper-2` 채움, 포커스 2px `--green-ink` 링 offset 2px. 필드 순서(모든 컨트롤 고정 `id`+`label`):
  - `이름 또는 상호` text required
  - `연락처` tel `inputmode="tel"` required, 010 시작 10~11자리 검증(blur), 자동 하이픈
  - `매출액` select required: `아직 매출 없음 / 연 3천만원 미만 / 3천만~8천만원 / 8천만~2억원 / 2억~5억원 / 5억원 이상`
  - `업종` select required: `온라인쇼핑몰·스마트스토어 / 카페·음식점 / 프리랜서·콘텐츠 / 배달·서비스 / 도소매 / 제조 / 기타` → `기타` 선택 시 text 입력 노출
  - `사업자등록일` date + 체크박스 `아직 등록 전`(체크 시 date disabled, required 해제)
  - `상담 가능 시간` select required: `평일 오전 9~12시 / 평일 오후 12~3시 / 평일 오후 3~6시 / 저녁 6시 이후 / 주말·공휴일` + `메모(선택)` textarea 2줄
  - `개인정보 수집·이용 동의(필수)` checkbox + 12px 안내: `수집 항목: 이름·상호, 연락처, 매출액, 업종, 사업자등록일, 상담 가능 시간 / 목적: 전화상담 예약 및 안내 / 보유기간: 상담 완료 후 1년 또는 동의 철회 시 파기` (`<!-- 고객사 확인 필요 -->`) + `#privacy` 링크
  - hidden: `coupon`(이벤트 종료 시 빈값), `secondsLeft`, `source`(URL `utm_source` 없으면 `referrer` 호스트), `submittedAt`(ISO)
  - 오류: 13px `--error` 필드 아래, `aria-describedby`, `aria-invalid`
  - 제출 버튼 `예약 신청하기` `--navy-900` 56px 풀폭 흰 글씨 + 3px `--green-ink` 밑줄 스윕, 전송 중 `보내는 중…` disabled
  - 성공: 폼을 대체하는 패널(제목으로 포커스 이동) `예약 완료! 영업시간 내 순서대로 전화드릴게요` + 카카오 버튼. 실패: `예약이 잘 안 됐어요. 카톡으로 바로 상담해 주세요` + 카카오 버튼, 입력값 유지.
  - local 모드일 때 제목 아래 `--paper-2` 필 `테스트 모드: 이 기기에만 저장됨`.
- **저장 어댑터**(BRIEF §4): `RESERVATION_MODE: "auto"|"webhook"|"local"`. webhook = `fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)})` (Apps Script용; `TAXCUT_CONFIG.WEBHOOK_JSON=true`면 `application/json` + cors 모드로 응답 `ok` 확인). local = `taxcut_reservations` 배열에 push. 어떤 예외든 잡아서 실패 UI.

### 07 푸터 (`--navy-950`)
- 90px 워드마크 SVG, `세무회계 민 · 택스컷` 13px `--ink-soft`.
- 신뢰 블록(지어내지 말고 플레이스홀더, 각각 `<!-- 고객사 확인 필요 -->`): `세무사 [성명]` / `주소 [사무소 주소]` / `사업자등록번호 [000-00-00000]` / `대표전화 [000-0000-0000]`.
- 링크 행(13px `--green` 2px 밑줄): `taxmin.kr`(https://taxmin.kr) · `유튜브 @taxcut_min` · `개인정보처리방침`(`#privacy` 인페이지 블록: 수집 항목/목적/보유기간 3줄 + `문의: 상담 시 안내`).
- `이벤트 유의사항` 12px `--ink-mute`: ① `이 페이지에서 30분 안에 상담 및 계약 완료 시 첫 달 기장료 무료` ② `기장료는 매출액에 따라 달라질 수 있습니다` ③ `타이머는 이 기기에서 페이지를 처음 연 시각 기준입니다`
- 모바일 하단 패딩 96px(고정 바 회피).

### 08 하단 고정 CTA 바 (모바일 <768px)
- 64px + `env(safe-area-inset-bottom,0px)` 패딩, `--navy-800`, 위 1px `--navy-700`, 12px 거터. 카카오 버튼(옐로, 말풍선 + `카톡 상담`, 58%) + `예약하기`(흰 1.5px 아웃라인 + 3px 그린 밑줄, 40%; `#reserve` 스크롤 후 이름 필드 포커스). 둘 다 44px.
- **첫 화면에는 없음.** 스크래치 카드가 뷰포트를 벗어난 뒤(IO) 슬라이드 업. 다음 상황에서 슬라이드 다운(translateY 100%, 200ms): 폼 컨트롤 `focusin`(`focusout`에 복귀), `visualViewport` resize(안드로이드 키보드), `#reserve`·성공 패널·푸터 privacy 블록이 보일 때.

## 4. 스크래치 카드 — 상세
- 구조: `.card-scene{perspective:900px; perspective-origin:50% 40%}` > `.card{transform-style:preserve-3d; will-change:transform; transform: rotateX(var(--tx)) rotateY(var(--ty))}`. 크기 모바일 `min(368px, 100%)` × 비율 8:5(aspect-ratio + max-width:100%). radius 14px — **페이지에서 유일하게 둥근 물체**.
  - `.card-thick`(`::before`): 카드 박스 복제, `translateZ(-6px)`, `--navy-950` 배경 + 1px `--navy-700` 테두리 → 기울 때 두께가 보임.
  - `.card-shadow`: `translateZ(-30px)` `--navy-950` blur 18px 사각형(한 번 래스터, 그룹과 함께 이동).
  - `.card-face`(쿠폰 면, `--paper` 영수증): 좌상 `TAXCUT COUPON` Montserrat 700 10px `--green-ink` .3em, 우상 24px 배지 SVG, `첫 달 기장료` Black Han Sans 22px `--navy-900`, `0원` `.num` 56px `--navy-900` + 5px `--green-ink` **밑줄**(취소선 아님), 점선 천공 박스 안 `코드 TC-4821` `.num` 18px + `복사` 버튼(Clipboard API, textarea select 폴백, `복사됨` 1.5초), 바닥 `상담 때 이 코드를 말씀해 주세요` 12px `--paper-mute`. 왼쪽 40px 천공 스텁(점선 + 세로 `TAXCUT · 1ST MONTH FREE` 8px).
  - `.card-foil`(canvas, `translateZ(14px)`, `touch-action:none`): CSS 크기 × `min(devicePixelRatio,1.5)`, `getContext('2d',{willReadFrequently:true})`. 페인트: 135° `--foil-hi→--foil-mid→--foil-lo`, 1px 사선 그레인, `TAXCUT` 타일 보안인쇄 6% 네이비. **텍스트는 캔버스에 그리지 않는다.**
  - `.card-prompt`(DOM, 캔버스 위, `pointer-events:none`, `translateZ(15px)`): `여기를 긁어보세요` Black Han Sans 24px `--navy-900`, 48px `--green-ink` 룰(`--cut-angle`), `손가락으로 문지르면 첫 달 기장료가 잘려요` 12px `--navy-700`. 10% 이상 긁히면 opacity 0(150ms).
  - `.card-hint`: 코인/엄지 글리프(인라인 SVG 28px)가 t+900ms에 좌하→우상 대각선으로 한 번 드래그(transform-only 1.2s), t+2.5s에 한 번 더, 12초 무입력이면 재생. 긁기 시작하면 제거.
  - `.card-cut`(SVG, `translateZ(28px)`, 숨김): 리빌 시 포일 층 위로만 대각선 4px `--green` 350ms 드로잉 후 포일과 함께 페이드. **0원을 관통하지 않음.**
  - `.card-glare`: 12% 흰색 리니어 그라데이션, 틸트 반대 방향으로 background-position 이동(같은 CSS 변수).
- 틸트: `--tx` clamp(-8°..8°), `--ty` clamp(-10°..10°). 마우스: 카드 위 포인터 위치 lerp .12/rAF, 떠나면 스프링백. 안드로이드: `deviceorientation` beta/gamma(데드존 2°, ±20°→±10°, 스무딩). iOS(`DeviceOrientationEvent.requestPermission` 존재)면 **절대 권한 요청 금지** → 터치 위치 기반. 대기 시 6초 루프 `translateY ±4px + rotateY 0→3°→0`. 단 하나의 rAF 루프(틸트+스크래치 배칭). `visibilitychange` hidden 시 루프 취소.
- **긁기**: Pointer Events + `setPointerCapture`. `touchmove`에 non-passive `preventDefault`(풀-투-리프레시 방지), `body{overscroll-behavior-y:none}`. `pointerdown`: 틸트를 **0으로 스냅(transition none, ≤80ms)**, 대기 플로트·orientation 업데이트 정지, 스냅 후 `getBoundingClientRect` **1회** 읽고 `canvas.width/rect.width` 스케일 저장(pointermove마다 rect 읽지 않음). `destination-out` round-cap 라인, 반경 터치 22px / 마우스 16px, rAF 배칭. **진행률은 pointermove 중 ~120ms마다** 1/4 스케일 오프스크린 복사본 alpha 샘플링(+pointerup 최종), **45%**에서 리빌(손가락 떼기 전에 발동). 3샘플 탭 가드.
- 리빌(~900ms): 남은 포일 350ms 페이드 → `.card-cut` 드로잉 → 0원 밑줄 드로잉 → **스탬프** `첫 달 0원`(Black Han Sans, 네이비 on 그린, -8°, scale 2→1 250ms)이 쿠폰 면에 찍힘 → 히어로 폭 컨페티 캔버스(60개, 토큰 색만, 1.2초, `pointer-events:none`, 1.5초 내 제거) → `navigator.vibrate(40)` guarded. **리빌로 움직이는 것은 전부 손가락 아래(카드 아래)에서만**: CTA 슬롯이 아래로 확장, 카드 위쪽은 안 움직임. reduced-motion: 포일 즉시 제거, 선 미리 그어짐, 컨페티 없음, 스탬프 정적.
- 상태: 코드 = `'TC-'+4자리`(`crypto.getRandomValues`, 폴백 Math.random) 세션당 1회 생성, `taxcut_coupon`에 저장, `taxcut_revealed` 저장 → 새로고침 시 **긁힌 상태로 렌더**(다시 긁게 하지 않음).
- **이벤트 종료 상태**: 타이머 0:00 이후(또는 로드 시 저장된 시작이 30분 이상 지났으면) 포일은 여전히 긁히지만 쿠폰 면은 `이벤트 종료 · 상담은 계속 가능해요`, **코드 미발급·미저장**, 폼 hidden `coupon` 빈값, 제목 옆 필 없음, 타이머 바 칩 없음. 이미 발급된 쿠폰이 있는 상태로 종료되면 쿠폰 면에 작은 `시간 종료` 마크 표시(CTA는 전부 유지). 긁는 도중 0:00이 되면 종료 경로로 리빌.
- 폴백: `@supports not (transform-style:preserve-3d)` → 평면 카드; 캔버스 불가 → `탭해서 쿠폰 열기` 버튼; 키보드 사용자용 시각적 숨김 버튼도 유지.

## 5. 카카오 링크 규칙
- href는 정확히 `https://pf.kakao.com/_Mxojqs/chat`. UA가 `/Instagram|FBAN|FBAV|KAKAOTALK|DaangnMarket|TowneersApp|Daangn/i`에 매치되면(인앱) `target` 없이 같은 창, 아니면 `target="_blank" rel="noopener"`.
- 카카오 버튼 탭 시 쿠폰코드 클립보드 복사 시도(guarded) + 2초 토스트 `쿠폰코드 복사됨`(리빌 전이면 토스트 없음).
- 모든 카카오 버튼 아래 11px 안내: `카톡이 열리지 않으면 우측 상단 ⋯ 메뉴에서 「브라우저로 열기」를 눌러 주세요`
- 카카오 옐로 버튼에는 그린 밑줄/장식 없음.

## 6. 모션 요약
- 로드: 0ms 전부 보임(opacity:0 대기 금지) → 150~800ms 히어로 선 드로잉 → 800ms 55,000원 dim + 0원 scale .96→1(200ms) → 1000ms 카드 대기 플로트 시작 + 타이머 진행선 1초 트랜지션. 그 외 로드 시 움직이는 것 없음.
- 스크롤(IO once, threshold .5): 가격 취소선 500ms → 0원 밑줄 300ms; 절차 레일 600ms; 섹션 아이브로우 룰 300ms. 패럴랙스·스크롤재킹·배경 파티클 없음.
- 마이크로: 링크/예약 버튼 그린 밑줄 좌→우 스윕 200ms(hover/press); 카카오 버튼 `:active` scale .98; FAQ 표시 150ms 회전; 타이머 숫자는 값만 교체.
- 애니메이션은 transform/opacity만. box-shadow/filter/backdrop-filter 애니메이션 금지.

## 7. 코드 규약
- 단일 파일 standalone: `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>택스컷 첫달 0원</title><meta name="description" content="…"><link rel="preconnect"…><link rel="stylesheet" href="https://fonts.googleapis.com/…"><style>…</style></head><body>…<script>…</script></body></html>`. **`<body>`에 class/속성 넣지 말 것**(아티팩트 변환 시 body 껍데기를 벗김). 외부 스크립트는 confetti 정도만 허용 (`https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js`) — 자체 캔버스 컨페티(60개)로 직접 구현해도 됨(권장, 의존성 0).
- 파일 최상단(`<!doctype>` 바로 아래 주석 5줄 이내): 폰트, 3D 방식, `TAXCUT_CONFIG` 설정법.
- `<script>` 첫 줄에 `window.TAXCUT_CONFIG = { KAKAO_URL:'https://pf.kakao.com/_Mxojqs/chat', EVENT_MINUTES:30, RESERVATION_MODE:'auto', RESERVATION_ENDPOINT:'', WEBHOOK_JSON:false, YOUTUBE_URL:'https://www.youtube.com/@taxcut_min', SITE_URL:'https://taxmin.kr' }` 그 다음 IIFE.
- 모든 storage/clipboard/vibrate/orientation 접근은 하나의 guarded helper 경유(try/catch, 메모리 폴백). 아티팩트 프리뷰는 샌드박스 iframe이라 던질 수 있음.
- `html,body{overflow-x:clip}`(hidden 아님), `body{overscroll-behavior-y:none}`. 좌우 거터 16px 이상 모든 폭. 가로 스크롤 0.
- JS 예산 약 25KB(폼 어댑터·검증·자동 하이픈·옵저버 포함). 프레임워크 없음.
- 포커스 가시 상태, `<button>`/`<a>` 의미론, 폼 컨트롤 `id`+`label`, `aria-*`, `prefers-reduced-motion` 전역 처리.
- 이모지 섹션 마커 금지. 마크업은 깔끔한 시맨틱(`header/main/section/footer`).
- 문체: **해요체로 통일**(~돼요/~해요/~봐요). 합니다체 섞지 말 것. `잘라 드릴게요`가 아니라 `잘라드릴게요`.
- 필수 원문 3문장이 정확히 포함되어야 함: `1개월 기장료 55,000원 (부가세 포함)` / `매출액에 따라 달라질 수 있습니다` / `이 페이지에서 30분 안에 상담 및 계약 완료 시 첫 달 기장료 무료`.

## 8. 자가 점검 (빌더가 파일 작성 후 반드시 수행)
1. 파일에서 인라인 `<script>` 본문을 추출해 `node --check`로 문법 확인(임시 .js 파일로 저장 후 실행).
2. 필수 3문장·카카오 URL·`TAXCUT_CONFIG`·`--cut-angle`·`willReadFrequently`·`touch-action` 문자열 존재 grep.
3. 허용 외 외부 URL(`src=`/`href=`의 http)이 fonts.googleapis.com / fonts.gstatic.com / cdnjs / cdn.jsdelivr.net/npm / pf.kakao.com / youtube.com / taxmin.kr 외에 없는지 확인.
4. `opacity:0`로 대기하는 텍스트 블록이 없는지, `100vh` 히어로가 없는지 확인.
5. 파일 크기 < 200KB.
