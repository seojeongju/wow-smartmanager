-- 프로덕션 DB 확인용 SQL
-- Cloudflare Dashboard > D1 > SQL Console에서 실행

-- 1. plan_requests 테이블 구조 확인
PRAGMA table_info(plan_requests);

-- 2. 현재 plan_requests 데이터 확인
SELECT pr.*, t.name as tenant_name 
FROM plan_requests pr 
LEFT JOIN tenants t ON pr.tenant_id = t.id;

-- 3. tenants 테이블 확인
SELECT id, name, plan FROM tenants;

-- 4. 테스트 데이터가 없다면 추가
INSERT INTO plan_requests (tenant_id, current_plan, requested_plan, status, requested_at) 
SELECT id, plan, 'PRO', 'PENDING', datetime('now')
FROM tenants 
WHERE plan != 'PRO' 
LIMIT 2;
