# 다음 세션 작업 가이드

## 🔄 세션 시작 시 체크리스트

### 1. 환경 확인
```bash
cd d:/Documents/program_DEV/wow-smartmanager-main
git status
git log --oneline -5
```

### 2. 로컬 개발 서버 실행 (필요시)
```bash
npm run dev
```

### 3. 데이터베이스 상태 확인
```bash
# 로컬 D1 데이터베이스 확인
wrangler d1 execute wow3d-stock-sales-manager-production --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 📋 즉시 시작 가능한 작업

### A. 출고 이력 서버 사이드 페이지네이션 (추천 ⭐)
**난이도**: 중간  
**소요 시간**: 1시간  
**파일**: 
- `src/routes/outbound.ts` (백엔드)
- `public/static/app.js` - `renderOutboundHistoryTab` (프론트엔드)

**작업 내용**:
1. **백엔드**: `GET /api/outbound`에 쿼리 파라미터 추가
   - `page` (기본값: 1)
   - `limit` (기본값: 20)
   - `search` (검색어)
   - `status` (상태 필터)
   - `start_date`, `end_date` (날짜 필터)
   
2. **프론트엔드**: 
   - 클라이언트 사이드 필터링을 서버 사이드로 변경
   - API 호출 시 파라미터 전달
   - 전체 데이터 수 표시
   - 대용량 데이터 처리 최적화

---

### B. 모달 기능 구현
**난이도**: 중간  
**소요 시간**: 1-2시간  
**파일**: `public/static/app.js`

**작업 내용**:
1. 배송 정보 모달 (`openShippingModal`)
2. 클레임 모달 (`openClaimModal`)
3. 판매 취소 모달 (`cancelSale`)

---

## 🛠️ 유용한 명령어

### 개발 및 배포
```bash
# 로컬 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# Cloudflare Pages 배포
npm run deploy

# GitHub 백업 (main 브랜치)
npm run backup

# 배포 + 백업 (한 번에!)
npm run deploy-all
```

### Git 관리
```bash
# 변경사항 확인
git status
git diff

# 커밋
git add .
git commit -m "메시지"

# 로그 확인
git log --oneline -10
```

### 데이터베이스
```bash
# 로컬 D1 쿼리 실행
wrangler d1 execute wow3d-stock-sales-manager-production --local --command "SELECT * FROM warehouses LIMIT 5;"

# 마이그레이션 상태 확인
wrangler d1 migrations list wow3d-stock-sales-manager-production --local
```

---

## 📌 현재 프로젝트 상태 (Current Status)

### ✅ 완료된 기능 (Completed Features)
- **핵심 기능**:
  - **로그인/인증**: `super@wow3d.com` 계정, JWT 인증.
  - **POS (판매 관리)**: 장바구니, 상품 검색, 결제 처리 UI.
  - **입고/발주 관리**: 발주 등록/조회, **공급사 관리(Full CRUD)**.
  - **재고 관리**: **창고별 재고 현황(Inventory Table)**, 입/출고/조정, 창고 필터링.
  - **출고 관리**: 출고 지시, 상태 관리(배송대기/완료).
- **데이터베이스 (Cloudflare D1)**:
  - `products`, `sales`, `stock_movements`, `suppliers`, `warehouses`, `inventory` 테이블 구성 완료.
  - 전체 마이그레이션 및 시딩 적용됨.

### 🚧 진행 중인 작업 (Pending)
- **판매/출고 API - Inventory 연동**: 
    - `inventory` 테이블이 새로 생겼으므로, 판매(`sales.ts`) 및 출고(`outbound.ts`) 로직에서도 `products.current_stock` 뿐만 아니라 `inventory` 테이블의 수량을 차감하도록 수정해야 함.

### ⚠️ 중요: 다음 세션 시작 전 필독
- **재고 로직 불일치**: 현재 재고 관리 페이지는 `inventory` 테이블을 보지만, 판매(POS)는 `products` 테이블만 수정할 가능성이 높음. 이로 인해 재고 수치가 안 맞을 수 있으니 **API 수정이 최우선**임.

---

## 📅 다음 세션 추천 작업 (Next Steps)

### 1. 판매 및 출고 API 리팩토링 (Priority: High)
- **목표**: 모든 재고 변동(판매, 출고)이 `inventory` 테이블(창고별 재고)에 반영되도록 수정.
- **파일**: `src/routes/sales.ts`, `src/routes/outbound.ts`
- **로직**:
    - 판매 시 `warehouse_id` (기본값 1)의 `inventory` 수량 차감.
    - 재고 부족 시 에러 처리 강화.

### 2. 창고 관리 기능 확장 (Priority: Medium)
- 현재 창고 목록은 시딩 데이터(3개)로 고정됨.
- 필요 시 창고 추가/수정/삭제 기능(UI 및 API) 개발.

### 3. 재고 이동(Transfer) 기능 구현
- UI에 '이동' 버튼은 있으나 '준비 중' 상태.
- 창고 간 재고 이동(`POST /api/stock/transfer`) API 및 프론트엔드 모달 구현.

### 4. 대시보드 위젯 추가
- 재고 현황(부족 재고, 창고별 보유량)을 대시보드 차트로 시각화.

---

## 🛠️ 유용한 명령어
- **DB 마이그레이션 (로컬)**: `npm run db:migrate:local`
- **DB 스튜디오 (로컬)**: `npx wrangler d1 migrations apply DB --local` (확인용)
- **개발 서버 실행**: `npm run dev`
- **배포**: `npm run deploy`
window.myItemsPerPage;
const pageItems = allItems.slice(startIdx, endIdx);

// 3. UI 업데이트
const totalPages = Math.ceil(allItems.length / window.myItemsPerPage);
prevBtn.disabled = (window.myPage <= 1);

// 4. 페이지 변경 함수
function changeMyPage(delta) {
    const newPage = window.myPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        window.myPage = newPage;
        renderMyList();
    }
}
```

---

## 📞 문제 발생 시

### 1. 빌드 에러
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. 데이터베이스 마이그레이션 에러
```bash
# 마이그레이션 재실행
wrangler d1 migrations apply wow3d-stock-sales-manager-production --local
```

### 3. 배포 에러
- Wrangler 버전 확인: `wrangler --version`
- 최신 버전으로 업데이트: `npm install -g wrangler@latest`

---

**마지막 업데이트**: 2026-01-11 18:35  
**마지막 업데이트**: 2026-01-11 19:10  
**다음 세션 추천**: 모달 기능 구현 (배송/클레임/취소) 또는 출고 이력 서버 사이드 페이지네이션
