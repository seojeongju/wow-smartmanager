-- 조직(Tenant) 테이블
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'FREE', -- FREE, BASIC, PRO, ENTERPRISE
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, PENDING
  user_count INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 플랜 변경 요청 테이블
CREATE TABLE IF NOT EXISTS plan_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  tenant_name TEXT, -- 쿼리 편의를 위해 중복 저장 or Join
  current_plan TEXT,
  requested_plan TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 초기 데이터 (더미)
INSERT INTO tenants (name, plan, status, user_count, product_count, created_at) VALUES 
('Jetoid AI', 'FREE', 'ACTIVE', 0, 0, datetime('now')),
('Test Co', 'FREE', 'ACTIVE', 0, 0, datetime('now', '-1 day')),
('Test Corp', 'FREE', 'ACTIVE', 0, 0, datetime('now', '-1 day')),
('Test Co', 'BASIC', 'ACTIVE', 1, 0, datetime('now', '-30 days')),
('SYSTEM_ADMIN', 'ENTERPRISE', 'ACTIVE', 1, 0, datetime('now', '-36 days')),
('3D쿠키홍대센터', 'BASIC', 'ACTIVE', 1, 0, datetime('now', '-38 days')),
('(주)와우3D', 'FREE', 'ACTIVE', 1, 0, datetime('now', '-39 days')),
('(주)파우브라더', 'PRO', 'ACTIVE', 6, 44, datetime('now', '-39 days'));
