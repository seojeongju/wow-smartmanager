# 프론트엔드 리팩토링 마스터 플랜

**작성일**: 2026-01-12  
**작성자**: Development Team  
**예상 기간**: 2-3주  
**리스크 레벨**: 중간

---

## 🎯 리팩토링 목표

### 주요 목표
1. **모듈화**: 8,841줄의 단일 파일을 기능별 모듈로 분리
2. **재사용성**: 공통 컴포넌트 추출 및 중복 코드 제거
3. **유지보수성**: 코드 구조 개선으로 버그 수정 및 기능 추가 용이
4. **성능**: 코드 스플리팅으로 초기 로딩 시간 단축
5. **확장성**: 향후 기능 추가 시 영향 범위 최소화

### 성공 기준
- ✅ 모든 기존 기능 정상 동작
- ✅ 빌드 에러 없음
- ✅ 번들 크기 20% 이상 감소
- ✅ 초기 로딩 시간 30% 이상 단축
- ✅ 코드 중복률 50% 이상 감소

---

## 🔐 백업 및 롤백 전략

### 백업 완료
- ✅ **Git 태그**: `pre-refactoring-backup-2026-01-12`
- ✅ **원격 저장소**: GitHub에 푸시 완료
- ✅ **작업 브랜치**: `refactoring/frontend-modularization`

### 롤백 방법
```bash
# 긴급 롤백 (전체 되돌리기)
git checkout main
git reset --hard pre-refactoring-backup-2026-01-12

# 특정 단계만 롤백
git revert <commit-hash>

# 브랜치 삭제 (완전 취소)
git checkout main
git branch -D refactoring/frontend-modularization
```

### 안전장치
1. **단계별 커밋**: 각 단계마다 별도 커밋
2. **PR 리뷰**: main에 머지 전 검토
3. **프로덕션 배포 전 테스트**: 로컬에서 충분히 테스트
4. **점진적 배포**: Canary 배포 방식 고려

---

## 📋 리팩토링 단계 (Phase-by-Phase)

### Phase 0: 준비 단계 (1일) ✅
**목표**: 리팩토링 환경 구성

- [x] 백업 태그 생성
- [x] 작업 브랜치 생성
- [x] 리팩토링 계획 문서 작성
- [ ] 테스트 체크리스트 작성
- [ ] 번들러 설정 확인 (Vite)

**검증 기준**: 
- Git 태그 원격 저장소에 존재
- 리팩토링 계획 문서 완성

---

### Phase 1: 디렉토리 구조 생성 (0.5일)
**목표**: 새로운 모듈 구조 준비

**작업 내용**:
```bash
public/static/
├── app.js (메인, 최소화)
├── modules/
│   ├── dashboard.js       # 대시보드
│   ├── products.js        # 상품 관리
│   ├── sales.js           # 영업 관리
│   ├── inbound.js         # 입고 관리
│   ├── outbound.js        # 출고 관리
│   ├── customers.js       # 거래처 관리
│   ├── stock.js           # 재고 관리
│   ├── claims.js          # 클레임 관리
│   └── system.js          # 시스템 관리
├── components/
│   ├── Modal.js           # 모달 컴포넌트
│   ├── Table.js           # 테이블 컴포넌트
│   ├── Form.js            # 폼 컴포넌트
│   ├── Pagination.js      # 페이지네이션
│   └── Toast.js           # 토스트 알림
├── utils/
│   ├── api.js             # API 호출 유틸
│   ├── formatters.js      # 포맷팅 함수
│   ├── validators.js      # 검증 함수
│   └── constants.js       # 상수 정의
└── config/
    └── routes.js          # 라우팅 설정
```

**체크리스트**:
- [ ] 디렉토리 구조 생성
- [ ] 각 파일에 기본 템플릿 추가
- [ ] 빌드 설정 업데이트 (vite.config.ts)

**검증 방법**:
- `npm run build` 성공
- 기존 기능 정상 동작 (아직 변경 없음)

**커밋 메시지**:
```
refactor: 프론트엔드 모듈 구조 디렉토리 생성

- modules, components, utils, config 디렉토리 추가
- 각 모듈별 기본 템플릿 파일 생성
- Vite 빌드 설정 업데이트
```

---

### Phase 2: 유틸리티 함수 분리 (1일)
**목표**: 공통 유틸리티 함수를 별도 파일로 추출

#### Step 2-1: constants.js
**추출할 내용**:
```javascript
// utils/constants.js
export const API_BASE = '/api';

export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
};
```

**체크리스트**:
- [ ] constants.js 생성
- [ ] app.js에서 상수 제거 및 import
- [ ] 빌드 테스트
- [ ] 기능 테스트

#### Step 2-2: formatters.js
**추출할 내용**:
```javascript
// utils/formatters.js
export function formatDate(dateStr) { ... }
export function formatCurrency(amount) { ... }
export function formatDateClean(dateStr) { ... }
export function truncateText(text, maxLength) { ... }
```

**위치**: app.js 라인 1398-1401, 기타

**체크리스트**:
- [ ] formatters.js 생성
- [ ] app.js에서 함수 이동
- [ ] 모든 사용처에 import 추가
- [ ] 빌드 및 테스트

#### Step 2-3: api.js
**추출할 내용**:
```javascript
// utils/api.js
export class API {
  static async get(url) {
    const response = await axios.get(`${API_BASE}${url}`);
    return response.data;
  }
  
  static async post(url, data) {
    const response = await axios.post(`${API_BASE}${url}`, data);
    return response.data;
  }
  
  static async put(url, data) { ... }
  static async delete(url) { ... }
}
```

**체크리스트**:
- [ ] api.js 생성
- [ ] API 래퍼 클래스 구현
- [ ] 기존 axios 호출을 API 클래스로 교체 (점진적)
- [ ] 테스트

**검증 방법**:
- 모든 API 호출 정상 동작
- 네트워크 탭에서 요청 확인

**커밋 메시지**:
```
refactor: 유틸리티 함수 분리 (constants, formatters, api)

- utils/constants.js: 공통 상수 정의
- utils/formatters.js: 날짜/통화 포맷팅 함수
- utils/api.js: API 호출 래퍼
```

---

### Phase 3: 공통 컴포넌트 추출 (2일)
**목표**: 재사용 가능한 UI 컴포넌트 생성

#### Step 3-1: Modal.js
**기능**:
- 모달 열기/닫기
- 배경 클릭 시 닫기
- ESC 키 닫기
- 애니메이션

**추출 대상**:
- openTenantModal
- openWarehouseModal
- closeTenantModal
- closeWarehouseModal
- 기타 모달 함수들

**구현 예시**:
```javascript
// components/Modal.js
export class Modal {
  constructor(options = {}) {
    this.id = options.id || 'modal';
    this.title = options.title || '';
    this.content = options.content || '';
    this.size = options.size || 'md'; // sm, md, lg, xl
  }

  render() {
    const html = `
      <div id="${this.id}" class="fixed inset-0 z-50 ...">
        <div class="bg-white rounded-2xl ...">
          ${this.title ? `<div class="modal-header">${this.title}</div>` : ''}
          <div class="modal-body">${this.content}</div>
        </div>
      </div>
    `;
    return html;
  }

  open() { ... }
  close() { ... }
}
```

**체크리스트**:
- [ ] Modal 클래스 구현
- [ ] 기존 모달을 Modal 클래스로 교체
- [ ] 애니메이션 동작 확인
- [ ] 모든 모달 기능 테스트

#### Step 3-2: Table.js
**기능**:
- 데이터 테이블 렌더링
- 정렬
- 필터링
- 페이지네이션

**구현 예시**:
```javascript
// components/Table.js
export class DataTable {
  constructor(options = {}) {
    this.data = options.data || [];
    this.columns = options.columns || [];
    this.pagination = options.pagination || null;
  }

  render() { ... }
  sort(columnKey, direction) { ... }
  filter(filterFn) { ... }
  paginate(page, itemsPerPage) { ... }
}
```

**체크리스트**:
- [ ] DataTable 클래스 구현
- [ ] 컬럼 정의 표준화
- [ ] 기존 테이블 교체 (1-2개씩 점진적)
- [ ] 정렬/필터 동작 확인

#### Step 3-3: Form.js
**기능**:
- 폼 렌더링
- 검증
- 제출 처리

**체크리스트**:
- [ ] Form 클래스 구현
- [ ] 검증 로직 통합
- [ ] 기존 폼 교체
- [ ] 제출 동작 테스트

**커밋 메시지**:
```
refactor: 공통 컴포넌트 추출 (Modal, Table, Form)

- components/Modal.js: 재사용 가능한 모달 컴포넌트
- components/Table.js: 데이터 테이블 컴포넌트
- components/Form.js: 폼 컴포넌트
- 기존 코드를 컴포넌트로 교체
```

---

### Phase 4: 페이지 모듈 분리 (1주)
**목표**: 각 페이지를 독립 모듈로 분리

#### 우선순위 순서
1. **system.js** (가장 최근 작업, 익숙함)
2. **dashboard.js** (단순함)
3. **products.js** (중간 복잡도)
4. **sales.js** (복잡함)
5. 나머지 모듈들

#### Step 4-1: system.js 분리
**추출 범위**:
- `loadSystem()` 함수
- `renderSystemTenants()` 함수
- `renderSystemUsers()` 함수
- `renderPlanRequests()` 함수
- 모든 시스템 관리 관련 함수

**구현**:
```javascript
// modules/system.js
import { API } from '../utils/api.js';
import { Modal } from '../components/Modal.js';

export class SystemModule {
  constructor() {
    this.currentTab = 'tenants';
  }

  async load(container) {
    const content = await this.render();
    container.innerHTML = content;
    this.attachEventListeners();
  }

  async render() {
    return `<div>시스템 관리 UI</div>`;
  }

  attachEventListeners() { ... }
  
  // 기존 함수들
  async loadTenants() { ... }
  async loadUsers() { ... }
  async loadPlanRequests() { ... }
}
```

**체크리스트**:
- [ ] SystemModule 클래스 구현
- [ ] 기존 함수 이동
- [ ] app.js에서 import 및 사용
- [ ] 모든 시스템 관리 기능 테스트

**테스트 항목**:
- [ ] 조직 생성/수정/삭제
- [ ] 사용자 비밀번호 초기화
- [ ] 사용자 권한 변경
- [ ] 플랜 변경 요청 수락/거절

#### Step 4-2~4-8: 나머지 모듈 분리
**동일한 패턴으로 진행**:
- dashboard.js
- products.js
- sales.js
- inbound.js
- outbound.js
- customers.js
- stock.js
- claims.js

**각 모듈당 체크리스트**:
- [ ] 모듈 클래스 구현
- [ ] 기존 함수 이동
- [ ] 이벤트 리스너 연결
- [ ] 기능 테스트
- [ ] 커밋

**커밋 메시지 형식**:
```
refactor: [모듈명] 모듈 분리

- modules/[모듈명].js 생성
- [모듈명]Module 클래스 구현
- app.js에서 기존 코드 제거
- 모든 기능 정상 동작 확인
```

---

### Phase 5: app.js 슬림화 (1일)
**목표**: app.js를 최소한의 진입점으로 축소

**최종 app.js 구조**:
```javascript
// app.js (최종 목표: ~200줄)
import { API } from './utils/api.js';
import { DashboardModule } from './modules/dashboard.js';
import { ProductsModule } from './modules/products.js';
import { SalesModule } from './modules/sales.js';
import { SystemModule } from './modules/system.js';
// ... 기타 모듈

const modules = {
  dashboard: new DashboardModule(),
  products: new ProductsModule(),
  sales: new SalesModule(),
  system: new SystemModule(),
  // ... 기타
};

// 페이지 라우팅
async function loadPage(page) {
  const container = document.getElementById('content');
  const module = modules[page];
  
  if (module) {
    await module.load(container);
  }
}

// 네비게이션 설정
function setupNavigation() { ... }

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadUserInfo();
  loadPage('dashboard');
});
```

**체크리스트**:
- [ ] 모듈 import 통합
- [ ] 라우팅 로직 간소화
- [ ] 전역 변수 제거
- [ ] 이벤트 리스너 정리
- [ ] 최종 파일 크기 확인 (~200줄 목표)

**검증**:
- app.js 라인 수: 8,841 → ~200줄
- 모듈 파일 수: 1 → ~20개

**커밋 메시지**:
```
refactor: app.js 슬림화 및 모듈 라우팅 구현

- app.js를 진입점으로만 사용
- 모든 기능을 모듈로 위임
- 라우팅 로직 간소화
- 전역 변수 및 이벤트 리스너 정리
```

---

### Phase 6: 빌드 최적화 (0.5일)
**목표**: 번들 크기 최적화 및 성능 개선

#### Step 6-1: Vite 설정 최적화
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['axios'],
          'modules': [
            './public/static/modules/dashboard.js',
            './public/static/modules/products.js',
            // ... 기타
          ],
          'components': [
            './public/static/components/Modal.js',
            './public/static/components/Table.js',
            // ... 기타
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
```

**체크리스트**:
- [ ] 코드 스플리팅 설정
- [ ] Chunk 크기 최적화
- [ ] Tree shaking 확인
- [ ] 빌드 크기 측정

**성능 목표**:
- 번들 크기: 443KB → ~300KB (30% 감소)
- 초기 로딩: 측정 → 30% 개선

**커밋 메시지**:
```
perf: Vite 빌드 최적화 및 코드 스플리팅

- 모듈별 chunk 분리
- vendor chunk 분리
- Tree shaking 적용
- 번들 크기 30% 감소
```

---

### Phase 7: 테스트 및 검증 (1-2일)
**목표**: 전체 기능 테스트 및 버그 수정

#### 테스트 체크리스트

**기본 기능**:
- [ ] 로그인/로그아웃
- [ ] 네비게이션 (모든 메뉴)
- [ ] 페이지 전환

**대시보드**:
- [ ] 통계 데이터 로드
- [ ] 차트 렌더링
- [ ] 최근 활동 표시

**상품 관리**:
- [ ] 상품 목록 조회
- [ ] 상품 생성
- [ ] 상품 수정
- [ ] 상품 삭제
- [ ] 검색/필터

**영업 관리**:
- [ ] 견적서 생성
- [ ] 견적서 수정
- [ ] PDF 다운로드
- [ ] 검색/필터

**입고 관리**:
- [ ] 발주 목록
- [ ] 발주 생성
- [ ] 상태 변경

**출고 관리**:
- [ ] 간편 출고
- [ ] 출고 이력
- [ ] 장바구니 기능
- [ ] Excel 다운로드

**재고 관리**:
- [ ] 재고 조회
- [ ] 재고 조정
- [ ] 이력 조회

**거래처 관리**:
- [ ] 거래처 목록
- [ ] 거래처 생성
- [ ] 거래처 수정
- [ ] 거래처 삭제

**클레임 관리**:
- [ ] 클레임 목록
- [ ] 클레임 등록
- [ ] 상태 변경

**시스템 관리**:
- [ ] 조직 관리 (생성/수정/삭제/상세)
- [ ] 사용자 관리 (비밀번호 초기화/권한 변경)
- [ ] 플랜 변경 요청 (수락/거절)

**공통 기능**:
- [ ] 모달 (열기/닫기/애니메이션)
- [ ] 테이블 (정렬/필터/페이지네이션)
- [ ] 폼 (검증/제출)
- [ ] 토스트 알림

**성능 테스트**:
- [ ] 초기 로딩 시간 측정
- [ ] 페이지 전환 속도
- [ ] 메모리 사용량
- [ ] 네트워크 요청 수

**브라우저 호환성**:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**커밋 메시지**:
```
test: 전체 기능 테스트 및 버그 수정

- 모든 페이지 기능 검증
- 발견된 버그 수정
- 성능 측정 및 개선
- 브라우저 호환성 확인
```

---

### Phase 8: 문서화 (0.5일)
**목표**: 리팩토링 결과 문서화

#### 작성할 문서

**1. REFACTORING_SUMMARY.md**
```markdown
# 리팩토링 결과 요약

## Before vs After
- 파일 수: 1 → 20+
- app.js 라인 수: 8,841 → ~200
- 번들 크기: 443KB → ~300KB
- 초기 로딩: [측정값] → [개선값]

## 주요 변경사항
...

## 마이그레이션 가이드
...
```

**2. ARCHITECTURE.md**
```markdown
# 프론트엔드 아키텍처

## 디렉토리 구조
...

## 모듈 설명
...

## 개발 가이드
...
```

**3. MIGRATION_GUIDE.md**
```markdown
# 마이그레이션 가이드

## 롤백 방법
...

## 새 기능 추가 방법
...

## 문제 해결
...
```

**체크리스트**:
- [ ] REFACTORING_SUMMARY.md 작성
- [ ] ARCHITECTURE.md 작성
- [ ] MIGRATION_GUIDE.md 작성
- [ ] README.md 업데이트

**커밋 메시지**:
```
docs: 리팩토링 결과 문서화

- REFACTORING_SUMMARY.md: 요약 및 성과
- ARCHITECTURE.md: 새로운 아키텍처 설명
- MIGRATION_GUIDE.md: 마이그레이션 가이드
- README.md 업데이트
```

---

## 🚨 위험 관리

### 예상 문제 및 대응

**문제 1: 특정 기능이 작동하지 않음**
- **원인**: import 경로 오류, 누락된 함수
- **대응**: 
  1. 해당 모듈 커밋 이전으로 되돌리기
  2. 누락된 부분 확인 및 추가
  3. 다시 테스트

**문제 2: 빌드 실패**
- **원인**: 문법 오류, 순환 참조
- **대응**:
  1. 빌드 에러 메시지 확인
  2. 해당 파일 수정
  3. `npm run build` 재실행

**문제 3: 성능 저하**
- **원인**: 과도한 모듈 분리, 비효율적인 import
- **대응**:
  1. 번들 분석 도구 사용
  2. 불필요한 import 제거
  3. 코드 스플리팅 재조정

**문제 4: 프로덕션 배포 후 이슈**
- **대응**:
  1. 즉시 이전 버전으로 롤백
  2. 로컬에서 재현 및 수정
  3. 충분한 테스트 후 재배포

---

## 📊 진행 상황 추적

### Daily 체크리스트

**매일 작업 시작 시**:
- [ ] 작업 브랜치 확인
- [ ] 최신 코드 pull
- [ ] 의존성 확인 (`npm install`)

**매일 작업 종료 시**:
- [ ] 변경 사항 커밋
- [ ] 빌드 테스트
- [ ] 기능 테스트
- [ ] 작업 내용 문서화

### Weekly 체크리스트

**매주 금요일**:
- [ ] 주간 진행 상황 리뷰
- [ ] 발견된 이슈 정리
- [ ] 다음 주 계획 수립
- [ ] 백업 확인

---

## 📅 타임라인

```
Week 1:
  Day 1-2: Phase 0-1 (준비 및 구조 생성)
  Day 3-4: Phase 2 (유틸리티 분리)
  Day 5: Phase 3 시작 (Modal)

Week 2:
  Day 1-2: Phase 3 완료 (Table, Form)
  Day 3-5: Phase 4 시작 (system, dashboard, products)

Week 3:
  Day 1-3: Phase 4 완료 (나머지 모듈)
  Day 4: Phase 5-6 (app.js 슬림화, 빌드 최적화)
  Day 5: Phase 7-8 (테스트, 문서화)
```

---

## ✅ 최종 검증

### 머지 전 체크리스트

**코드 품질**:
- [ ] 모든 빌드 에러 해결
- [ ] ESLint 경고 해결
- [ ] 콘솔 에러/경고 없음

**기능**:
- [ ] 모든 페이지 정상 동작
- [ ] 모든 CRUD 기능 테스트
- [ ] 모든 모달/폼 동작 확인

**성능**:
- [ ] 번들 크기 목표 달성 (30% 감소)
- [ ] 초기 로딩 시간 목표 달성 (30% 개선)
- [ ] 메모리 누수 없음

**문서화**:
- [ ] 모든 문서 작성 완료
- [ ] README 업데이트
- [ ] 주석 추가

**배포 준비**:
- [ ] 프로덕션 빌드 성공
- [ ] 로컬에서 프로덕션 빌드 테스트
- [ ] 롤백 절차 문서화

---

## 🎯 Success Metrics

### 정량적 지표

**Before**:
- Files: 1
- Lines: 8,841
- Bundle Size: 443KB
- Functions: 244
- Loading Time: [측정 필요]

**Target After**:
- Files: 20+
- app.js Lines: ~200
- Bundle Size: ~300KB (-30%)
- Functions per File: ~15-20
- Loading Time: -30%

### 정성적 지표
- ✅ 코드 가독성 향상
- ✅ 유지보수 용이성 증가
- ✅ 버그 발생률 감소
- ✅ 기능 추가 속도 증가
- ✅ 팀원 온보딩 시간 단축

---

## 📞 문제 발생 시 연락처

**긴급 롤백 필요 시**:
1. `git checkout main`
2. `git reset --hard pre-refactoring-backup-2026-01-12`
3. `git push origin main --force` (주의!)
4. Cloudflare Pages에서 이전 배포 버전으로 되돌리기

**슬랙/이메일로 팀에 공유**

---

**작성 완료**: 2026-01-12  
**다음 리뷰 예정**: 각 Phase 완료 시  
**최종 검토**: Phase 8 완료 후
