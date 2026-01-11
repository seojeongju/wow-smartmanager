-- Settings 테이블 생성
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 회사 정보 삽입
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (
    'company_info',
    '{"company_name":"(주)와우쓰리디","ceo_name":"홍길동","business_number":"123-45-67890","email":"info@wow3d.com","phone":"054-454-2237","fax":"054-454-2238","address":"경북 구미시 3공단3로 302","address_detail":"2층","logo_url":""}',
    CURRENT_TIMESTAMP
);
