-- 테스트용 플랜 변경 요청 데이터 추가
INSERT INTO plan_requests (tenant_id, current_plan, requested_plan, status, requested_at) VALUES 
(4, 'BASIC', 'PRO', 'PENDING', datetime('now', '-2 hours')),
(2, 'FREE', 'BASIC', 'PENDING', datetime('now', '-1 day'));
