# 리팩토링 롤백 가이드

**긴급 연락처**: [팀 슬랙 채널]  
**작성일**: 2026-01-12

---

## 🚨 긴급 롤백 절차

### 상황 1: 전체 리팩토링 취소 (최악의 경우)

**시나리오**: 리팩토링된 코드가 프로덕션에서 심각한 문제 발생

```bash
# 1. 즉시 이전 버전으로 되돌리기
git checkout main
git reset --hard pre-refactoring-backup-2026-01-12

# 2. 강제 푸시 (주의!)
git push origin main --force

# 3. Cloudflare Pages 롤백
# Cloudflare Dashboard → Pages → Deployments
# "pre-refactoring-backup-2026-01-12" 배포 버전 찾아서 "Rollback" 클릭
```

**예상 소요 시간**: 5-10분  
**서비스 다운타임**: 2-5분

---

### 상황 2: 특정 Phase만 롤백

**시나리오**: Phase 4에서 문제 발생, Phase 3까지는 정상

```bash
# 1. 문제있는 커밋 찾기
git log --oneline

# 2. 해당 커밋 되돌리기 (예: Phase 4-1 커밋)
git revert <commit-hash>

# 3. 충돌 해결 (필요시)
# ... 충돌 파일 수정 ...
git add .
git revert --continue

# 4. 푸시
git push origin refactoring/frontend-modularization
```

**예상 소요 시간**: 10-30분  
**서비스 다운타임**: 없음 (작업 브랜치)

---

### 상황 3: 특정 파일만 롤백

**시나리오**: modules/system.js에만 문제, 다른 건 정상

```bash
# 1. 특정 파일만 이전 버전으로 복구
git checkout pre-refactoring-backup-2026-01-12 -- public/static/app.js

# 2. 변경사항 확인
git diff

# 3. 테스트 후 커밋
git add public/static/app.js
git commit -m "revert: system.js 롤백 - app.js 이전 버전 복구"
```

---

## 📋 롤백 의사결정 트리

```
문제 발생
    ↓
프로덕션 환경인가?
    ↓ Yes
    심각도는?
        ↓ Critical (서비스 다운)
        → 상황 1: 전체 롤백
        ↓ High (일부 기능 오류)
        → 상황 2: Phase 롤백
        ↓ Medium (특정 기능만)
        → 상황 3: 파일 롤백
    ↓ No (개발 환경)
    → 정상적인 수정 진행
```

---

## 🔍 롤백 전 체크리스트

**프로덕션 롤백 전 필수 확인**:
- [ ] 이슈 내용 문서화
- [ ] 재현 가능한지 확인
- [ ] 다른 해결 방법 있는지 검토
- [ ] 팀원에게 알림
- [ ] 백업 태그 존재 확인
- [ ] 롤백 영향 범위 파악

---

## 💾 백업 확인 방법

```bash
# 백업 태그 목록 확인
git tag

# 특정 태그 상세 정보
git show pre-refactoring-backup-2026-01-12

# 원격 저장소에 태그 있는지 확인
git ls-remote --tags origin
```

**예상 출력**:
```
pre-refactoring-backup-2026-01-12
```

---

## 🧪 롤백 후 테스트 절차

### 로컬 테스트
```bash
# 1. 의존성 재설치
npm install

# 2. 빌드
npm run build

# 3. 개발 서버 시작
npm run dev

# 4. 브라우저에서 테스트
# http://localhost:5173
```

### 테스트 체크리스트
- [ ] 로그인 가능
- [ ] 대시보드 로딩
- [ ] 주요 기능 5개 테스트
- [ ] 콘솔 에러 없음
- [ ] 네트워크 에러 없음

---

## 📊 롤백 로그

### 템플릿
```markdown
## 롤백 #[번호]

**날짜**: YYYY-MM-DD HH:mm
**담당자**: [이름]
**롤백 타입**: [전체/Phase/파일]
**원인**: [문제 설명]
**영향 범위**: [기능/페이지]
**복구 시간**: [X분]
**후속 조치**: [계획]
```

### 롤백 이력
_(롤백 발생 시 여기에 기록)_

---

## 🛡️ 롤백 방지 체크리스트

**각 Phase 시작 전**:
- [ ] 이전 Phase 완전히 완료
- [ ] 모든 테스트 통과
- [ ] 커밋 완료
- [ ] 로컬에서 빌드 성공

**각 Phase 완료 후**:
- [ ] 기능 테스트 완료
- [ ] 회귀 테스트 완료
- [ ] 코드 리뷰 (가능하면)
- [ ] 문서 업데이트

**프로덕션 배포 전**:
- [ ] 전체 체크리스트 통과
- [ ] 성능 테스트 완료
- [ ] 롤백 계획 확인
- [ ] 모니터링 준비

---

## 🔧 문제 해결 가이드

### 문제: 빌드 실패
```bash
# 1. 캐시 삭제
rm -rf node_modules dist
npm install

# 2. 다시 빌드
npm run build

# 3. 여전히 실패하면 롤백
```

### 문제: import 에러
```
Uncaught SyntaxError: Cannot use import statement outside a module
```

**해결**:
```html
<!-- index.html에서 type="module" 확인 -->
<script type="module" src="/static/app.js"></script>
```

### 문제: 함수 undefined
```
Uncaught ReferenceError: loadDashboard is not defined
```

**해결**:
- 함수가 제대로 export되었는지 확인
- import 경로가 올바른지 확인
- 함수 이름 오타 확인

---

## 📞 에스컬레이션

### Level 1: 본인 해결 (30분)
- 문서 확인
- 로그 분석
- 재현 시도

### Level 2: 팀원 도움 (1시간)
- 슬랙에 문의
- 페어 프로그래밍
- 다른 관점 검토

### Level 3: 긴급 롤백 (즉시)
- 프로덕션 영향
- 해결 방법 불명확
- 시간 초과

---

## 📝 사후 분석 템플릿

**롤백 발생 시 작성**:

```markdown
# 롤백 사후 분석

## 개요
- 날짜:
- 롤백 타입:
- 영향 범위:

## 타임라인
- XX:XX - 문제 발견
- XX:XX - 롤백 결정
- XX:XX - 롤백 실행
- XX:XX - 정상 복구

## 근본 원인
[문제의 진짜 원인]

## 즉각 조치
[롤백 내용]

## 장기 해결책
[재발 방지 대책]

## 배운 점
[팀이 배운 교훈]
```

---

## ✅ 롤백 성공 기준

**롤백이 성공적으로 완료되었다고 판단하는 기준**:

1. **기능**: 모든 주요 기능 정상 동작
2. **빌드**: 에러 없이 빌드 성공
3. **성능**: 롤백 전 수준으로 복구
4. **데이터**: 데이터 손실 없음
5. **사용자**: 사용자 불편 최소화

---

**마지막 업데이트**: 2026-01-12  
**다음 리뷰**: 리팩토링 시작 전
