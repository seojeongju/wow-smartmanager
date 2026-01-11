-- 사용자 테이블에 조직 ID 컬럼 추가
-- ALTER TABLE users ADD COLUMN tenant_id INTEGER;

-- 더미 사용자 데이터 추가 (시스템 관리 예시용)
INSERT OR IGNORE INTO users (name, email, role, tenant_id, created_at) VALUES 
('Test User', 'test@test.com', 'OWNER', 2, datetime('now', '-30 days')),
('Super Admin', 'super@wow3d.com', 'SUPER_ADMIN', 8, datetime('now', '-40 days')),
('System Admin', 'admin@system.com', 'SUPER_ADMIN', 5, datetime('now', '-40 days')),
('서정주', 'jayseo36@gmail.com', 'ADMIN', 8, datetime('now', '-38 days')),
('황기환', 'hkh6660@naver.com', 'ADMIN', 8, datetime('now', '-38 days')),
('서은비', 'seb5536@naver.com', 'ADMIN', 8, datetime('now', '-38 days')),
('관리자', 'admin@3dcookiehd.co.kr', 'OWNER', 6, datetime('now', '-38 days')),
('와우', 'wow3d@wow3d.com', 'OWNER', 7, datetime('now', '-39 days'));
