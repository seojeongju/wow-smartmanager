# 리팩토링 진행 체크리스트

**시작일**: 2026-01-12  
**목표 완료일**: 2026-01-31 (3주)  
**현재 단계**: Phase 0 - 준비

---

## 📋 Phase 0: 준비 (Day 1) - 진행중 ⏳

### 백업 및 브랜치
- [x] Git 태그 생성 (`pre-refactoring-backup-2026-01-12`)
- [x] 원격 저장소에 태그 푸시
- [x] 작업 브랜치 생성 (`refactoring/frontend-modularization`)
- [x] 리팩토링 계획 문서 작성

### 테스트 준비
- [ ] 현재 기능 테스트 체크리스트 작성
- [ ] 빌드 성공 확인
- [ ] 로컬 개발 서버 정상 동작 확인

### 설정 확인
- [ ] Vite 설정 검토 (vite.config.ts)
- [ ] package.json 스크립트 확인
- [ ] 의존성 최신화 필요 여부 확인

---

## 📋 Phase 1: 디렉토리 구조 (Day 2) - 대기 ⏸️

### 디렉토리 생성
- [ ] `public/static/modules/` 생성
- [ ] `public/static/components/` 생성
- [ ] `public/static/utils/` 생성
- [ ] `public/static/config/` 생성

### 기본 파일 생성
- [ ] modules/dashboard.js (템플릿)
- [ ] modules/products.js (템플릿)
- [ ] modules/sales.js (템플릿)
- [ ] modules/inbound.js (템플릿)
- [ ] modules/outbound.js (템플릿)
- [ ] modules/customers.js (템플릿)
- [ ] modules/stock.js (템플릿)
- [ ] modules/claims.js (템플릿)
- [ ] modules/system.js (템플릿)
- [ ] components/Modal.js (템플릿)
- [ ] components/Table.js (템플릿)
- [ ] components/Form.js (템플릿)
- [ ] utils/api.js (템플릿)
- [ ] utils/formatters.js (템플릿)
- [ ] utils/constants.js (템플릿)

### 빌드 테스트
- [ ] `npm run build` 성공
- [ ] 기존 기능 정상 동작 확인
- [ ] 커밋 및 푸시

---

## 📋 Phase 2: 유틸리티 분리 (Day 3-4) - 대기 ⏸️

### Step 2-1: constants.js
- [ ] API_BASE 상수 이동
- [ ] STATUS 상수 이동
- [ ] ROLES 상수 이동
- [ ] 기타 상수 이동
- [ ] app.js에서 import
- [ ] 빌드 테스트
- [ ] 기능 테스트
- [ ] 커밋

### Step 2-2: formatters.js
- [ ] formatDate() 이동
- [ ] formatCurrency() 이동
- [ ] formatDateClean() 이동
- [ ] 기타 포맷 함수 이동
- [ ] app.js에서 import
- [ ] 모든 사용처 업데이트
- [ ] 빌드 테스트
- [ ] 기능 테스트
- [ ] 커밋

### Step 2-3: api.js
- [ ] API 클래스 구현
- [ ] GET 메서드
- [ ] POST 메서드
- [ ] PUT 메서드
- [ ] DELETE 메서드
- [ ] 에러 핸들링
- [ ] 기존 axios 호출 교체 (점진적)
- [ ] 빌드 테스트
- [ ] API 호출 테스트
- [ ] 커밋

---

## 📋 Phase 3: 컴포넌트 분리 (Day 5-7) - 대기 ⏸️

### Step 3-1: Modal.js
- [ ] Modal 클래스 구현
- [ ] open() 메서드
- [ ] close() 메서드
- [ ] render() 메서드
- [ ] 애니메이션 구현
- [ ] ESC 키 지원
- [ ] 배경 클릭 닫기
- [ ] openTenantModal → Modal로 교체
- [ ] openWarehouseModal → Modal로 교체
- [ ] 기타 모달 교체
- [ ] 모든 모달 동작 테스트
- [ ] 커밋

### Step 3-2: Table.js
- [ ] DataTable 클래스 구현
- [ ] render() 메서드
- [ ] sort() 메서드
- [ ] filter() 메서드
- [ ] paginate() 메서드
- [ ] 첫 번째 테이블 교체 (tenants)
- [ ] 두 번째 테이블 교체 (users)
- [ ] 모든 테이블 교체
- [ ] 정렬/필터/페이지네이션 테스트
- [ ] 커밋

### Step 3-3: Form.js
- [ ] Form 클래스 구현  
- [ ] render() 메서드
- [ ] validate() 메서드
- [ ] submit() 메서드
- [ ] 첫 번째 폼 교체
- [ ] 모든 폼 교체
- [ ] 검증 동작 테스트
- [ ] 제출 동작 테스트
- [ ] 커밋

---

## 📋 Phase 4: 모듈 분리 (Week 2-3) - 대기 ⏸️

### Step 4-1: system.js (Day 8-9)
- [ ] SystemModule 클래스 생성
- [ ] load() 메서드
- [ ] render() 메서드
- [ ] loadTenants() 이동
- [ ] loadUsers() 이동
- [ ] loadPlanRequests() 이동
- [ ] 모든 시스템 함수 이동
- [ ] app.js에서 import 및 사용
- [ ] 조직 생성/수정/삭제 테스트
- [ ] 사용자 비밀번호 초기화 테스트
- [ ] 사용자 권한 변경 테스트
- [ ] 플랜 변경 요청 테스트
- [ ] 커밋

### Step 4-2: dashboard.js (Day 10)
- [ ] DashboardModule 클래스 생성
- [ ] load() 메서드
- [ ] render() 메서드
- [ ] loadDashboard() 이동
- [ ] 통계 로딩 테스트
- [ ] 차트 렌더링 테스트
- [ ] 커밋

### Step 4-3: products.js (Day 11)
- [ ] ProductsModule 클래스 생성
- [ ] 상품 목록 기능 이동
- [ ] 상품 CRUD 테스트
- [ ] 커밋

### Step 4-4: sales.js (Day 12-13)
- [ ] SalesModule 클래스 생성
- [ ] 견적서 기능 이동
- [ ] 견적서 CRUD 테스트
- [ ] PDF 다운로드 테스트
- [ ] 커밋

### Step 4-5: inbound.js (Day 14)
- [ ] InboundModule 클래스 생성
- [ ] 입고 기능 이동
- [ ] 발주 관리 테스트
- [ ] 커밋

### Step 4-6: outbound.js (Day 15)
- [ ] OutboundModule 클래스 생성
- [ ] 출고 기능 이동
- [ ] 간편 출고 테스트
- [ ] 출고 이력 테스트
- [ ] 커밋

### Step 4-7: customers.js (Day 16)
- [ ] CustomersModule 클래스 생성
- [ ] 거래처 기능 이동
- [ ] 거래처 CRUD 테스트
- [ ] 커밋

### Step 4-8: stock.js (Day 17)
- [ ] StockModule 클래스 생성
- [ ] 재고 기능 이동
- [ ] 재고 조회/조정 테스트
- [ ] 커밋

### Step 4-9: claims.js (Day 18)
- [ ] ClaimsModule 클래스 생성
- [ ] 클레임 기능 이동
- [ ] 클레임 관리 테스트
- [ ] 커밋

---

## 📋 Phase 5: app.js 슬림화 (Day 19) - 대기 ⏸️

### 리팩토링
- [ ] 모든 모듈 import 추가
- [ ] 라우팅 로직 간소화
- [ ] 전역 변수 제거
- [ ] 이벤트 리스너 정리
- [ ] 코드 정리

### 검증
- [ ] app.js 라인 수 확인 (~200줄)
- [ ] 모든 페이지 로딩 테스트
- [ ] 전체 네비게이션 테스트
- [ ] 커밋

---

## 📋 Phase 6: 빌드 최적화 (Day 20) - 대기 ⏸️

### Vite 설정
- [ ] vite.config.ts 업데이트
- [ ] 코드 스플리팅 설정
- [ ] manualChunks 설정
- [ ] vendor chunk 분리
- [ ] modules chunk 분리
- [ ] components chunk 분리

### 측정 및 검증
- [ ] 빌드 실행
- [ ] 번들 크기 측정
- [ ] 목표 달성 확인 (30% 감소)
- [ ] 초기 로딩 시간 측정
- [ ] 목표 달성 확인 (30% 개선)
- [ ] 커밋

---

## 📋 Phase 7: 테스트 (Day 21-22) - 대기 ⏸️

### 기본 기능
- [ ] 로그인/로그아웃
- [ ] 모든 페이지 네비게이션
- [ ] 페이지 새로고침

### 대시보드
- [ ] 통계 로딩
- [ ] 차트 표시
- [ ] 최근 활동

### 상품 관리
- [ ] 목록 조회
- [ ] 상품 생성
- [ ] 상품 수정
- [ ] 상품 삭제
- [ ] 검색/필터

### 영업 관리
- [ ] 견적서 목록
- [ ] 견적서 생성
- [ ] 견적서 수정
- [ ] PDF 다운로드

### 입고 관리
- [ ] 발주 목록
- [ ] 발주 생성
- [ ] 상태 변경

### 출고 관리
- [ ] 간편 출고
- [ ] 상품 선택
- [ ] 장바구니
- [ ] 출고 완료
- [ ] 출고 이력

### 거래처 관리
- [ ] 목록 조회
- [ ] 거래처 생성
- [ ] 거래처 수정
- [ ] 거래처 삭제

### 재고 관리
- [ ] 재고 조회
- [ ] 재고 조정
- [ ] 이력 조회

### 클레임 관리
- [ ] 클레임 목록
- [ ] 클레임 등록
- [ ] 상태 변경

### 시스템 관리
- [ ] 조직 생성
- [ ] 조직 상세보기
- [ ] 조직 수정
- [ ] 조직 삭제
- [ ] 사용자 목록
- [ ] 비밀번호 초기화
- [ ] 권한 변경
- [ ] 플랜 변경 요청 수락
- [ ] 플랜 변경 요청 거절

### 성능 테스트
- [ ] 초기 로딩 시간
- [ ] 페이지 전환 속도
- [ ] 메모리 사용량
- [ ] 네트워크 요청 수

### 브라우저 테스트
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 버그 수정
- [ ] 발견된 버그 목록 작성
- [ ] 각 버그 수정
- [ ] 재테스트
- [ ] 커밋

---

## 📋 Phase 8: 문서화 (Day 23) - 대기 ⏸️

### 문서 작성
- [ ] REFACTORING_SUMMARY.md
- [ ] ARCHITECTURE.md
- [ ] MIGRATION_GUIDE.md
- [ ] README.md 업데이트

### 코드 주석
- [ ] 각 모듈에 JSDoc 추가
- [ ] 복잡한 로직에 주석 추가
- [ ] 커밋

---

## 📋 최종 검증 - 대기 ⏸️

### 코드 품질
- [ ] 빌드 에러 없음
- [ ] ESLint 경고 해결
- [ ] 콘솔 에러 없음
- [ ] 콘솔 경고 최소화

### 기능
- [ ] 모든 체크리스트 항목 통과
- [ ] 회귀 테스트 완료
- [ ] 사용자 시나리오 테스트

### 성능
- [ ] 번들 크기 목표 달성
- [ ] 로딩 시간 목표 달성
- [ ] 메모리 누수 없음

### 문서
- [ ] 모든 문서 작성 완료
- [ ] 코드 주석 추가
- [ ] README 최신화

### 배포 준비
- [ ] 프로덕션 빌드 성공
- [ ] 로컬에서 프로덕션 빌드 테스트
- [ ] 롤백 절차 확인

---

## 📋 머지 및 배포 - 대기 ⏸️

### PR 생성
- [ ] PR 설명 작성
- [ ] 변경 사항 요약
- [ ] 스크린샷/비디오 첨부
- [ ] 리뷰어 지정

### 코드 리뷰
- [ ] 리뷰 피드백 반영
- [ ] 최종 승인

### 머지
- [ ] main 브랜치로 머지
- [ ] 태그 생성 (v2.0.0-refactored)
- [ ] 배포

### 모니터링
- [ ] 프로덕션 배포 확인
- [ ] 에러 모니터링
- [ ] 성능 모니터링
- [ ] 사용자 피드백 수집

---

## 📊 진행 상황

**현재 단계**: Phase 0 (준비)  
**진행률**: 40% (백업 및 계획 완료)  
**다음 단계**: Phase 1 (디렉토리 구조 생성)

**예상 완료일**: 2026-01-31  
**실제 시작일**: 2026-01-12  
**경과일**: 0일

---

## 🚨 이슈 트래킹

### 발견된 이슈
_(이슈 발견 시 여기에 기록)_

### 해결된 이슈
_(해결 완료 시 이동)_

---

**마지막 업데이트**: 2026-01-12 14:52
**업데이트한 사람**: Development Team
