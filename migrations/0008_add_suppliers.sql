-- Create suppliers table
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Validate existing suppliers from products and insert them
INSERT OR IGNORE INTO suppliers (name, contact_person, phone)
SELECT DISTINCT supplier, '담당자 미정', ''
FROM products 
WHERE supplier IS NOT NULL AND supplier != '';

-- Update sample data contacts (optional, for better UI)
UPDATE suppliers SET contact_person = '김철수 팀장', phone = '010-1234-5678' WHERE name = '삼성전자';
UPDATE suppliers SET contact_person = '이영희 대리', phone = '010-9876-5432' WHERE name = 'LG전자';
