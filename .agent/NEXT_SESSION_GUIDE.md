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

### A. 주문/배송 관리 탭 페이지네이션 (추천 ⭐)
**난이도**: 쉬움  
**소요 시간**: 30분  
**파일**: `public/static/app.js` - `renderOrderList` 함수

**작업 내용**:
1. 페이지네이션 변수 초기화 (`window.orderPage`, `window.orderItemsPerPage`)
2. `renderOrderList` 슬라이싱 로직 추가
3. UI 컨트롤 추가 (이전/다음 버튼, 페이지 표시기)
4. `changeOrderPage(delta)` 구현
5. 검색/필터 시 1페이지로 리셋

**참고**: POS/출고 상품 리스트 페이지네이션 구현 방식 동일하게 적용

---

### B. Claims 탭 UI/UX 구현
**난이도**: 중간  
**소요 시간**: 1-2시간  
**파일**: `public/static/app.js` - `renderClaimsTab` 함수

**작업 내용**:
1. Claims 목록 테이블 디자인
2. 반품/교환 타입별 필터
3. 상태별 필터 (requested, approved, completed, rejected)
4. 승인/거절 버튼
5. 상세 정보 모달

**참고 API**:
- `GET /api/claims` - 클레임 목록
- `POST /api/claims` - 클레임 생성
- `PUT /api/claims/:id/status` - 상태 변경

---

### C. 출고 이력 서버 사이드 페이지네이션
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
   - 페이지네이션 UI 추가
   - API 호출 시 파라미터 전달
   - 전체 데이터 수 표시

---

### D. Git Remote 설정 및 GitHub 백업
**난이도**: 쉬움  
**소요 시간**: 10분

**작업 내용**:
1. GitHub에서 새 리포지토리 생성
2. Remote 추가:
```bash
git remote add origin https://github.com/YOUR_USERNAME/wow-smartmanager.git
git branch -M master
git push -u origin master
```

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

# 로컬 D1 마이그레이션
wrangler d1 migrations apply wow3d-stock-sales-manager-production --local
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

### 🚧 진행 중 / 개선 필요
- POS 상품 목록 페이지네이션
- 주문 목록 페이지네이션  
- Claims 탭 UI/UX
- 서버 사이드 필터링/페이지네이션

### 🐛 알려진 이슈
1. TypeScript lint error: `D1Database` 타입 정의 누락 (영향 없음)
2. Git remote 미설정

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

**마지막 업데이트**: 2026-01-11 15:35  
**다음 세션 추천**: 주문/배송 관리 탭 페이지네이션 (작업 A)
