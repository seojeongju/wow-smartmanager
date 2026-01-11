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

## 📊 현재 프로젝트 상태

### ✅ 완료된 기능
- 대시보드 (차트, 통계)
- 상품 관리
- 고객 관리
- 판매 관리 (POS, 주문/배송, Claims)
- 재고 관리
- **출고 관리** (간편 등록, 이력 조회, 창고 관리) ⭐ 최신
- 거래명세서 출력
- 설정 페이지
- 로그인/회원가입
- **페이지네이션** (POS, 주문, Claims, 출고, 이력 등 전체 적용 완료)
- **자동 백업 시스템** (GitHub 연동 완료)

### 🚧 진행 중 / 개선 필요
- 모달 기능 (배송, 클레임, 취소)
- 서버 사이드 필터링/페이지네이션 (대용량 데이터 대응)

### 🐛 알려진 이슈
1. TypeScript lint error: `D1Database` 타입 정의 누락 (영향 없음)

---

## 💡 코딩 팁

### 페이지네이션 구현 패턴
```javascript
// 1. 변수 초기화
window.myPage = 1;
window.myItemsPerPage = 10;

// 2. 렌더링 함수에서 슬라이싱
const startIdx = (window.myPage - 1) * window.myItemsPerPage;
const endIdx = startIdx + window.myItemsPerPage;
const pageItems = allItems.slice(startIdx, endIdx);

// 3. UI 업데이트
const totalPages = Math.ceil(allItems.length / window.myItemsPerPage);
prevBtn.disabled = (window.myPage <= 1);
nextBtn.disabled = (window.myPage >= totalPages);

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

**마지막 업데이트**: 2026-01-11 17:55  
**다음 세션 추천**: 출고 이력 서버 사이드 페이지네이션 (작업 A) 또는 모달 기능 구현 (작업 B)
