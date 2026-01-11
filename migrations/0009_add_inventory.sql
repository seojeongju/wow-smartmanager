-- 1. 창고 데이터 시딩 (이미 존재하면 무시)
INSERT OR IGNORE INTO warehouses (id, name, location) VALUES (1, '기본 창고', '본사');
INSERT OR IGNORE INTO warehouses (id, name, location) VALUES (2, '서울 지사', '서울 강남구');
INSERT OR IGNORE INTO warehouses (id, name, location) VALUES (3, '구미 공장', '경북 구미시');

-- 2. 재고 테이블 생성 (Inventory)
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(warehouse_id, product_id)
);

-- 3. 기존 제품 재고를 기본 창고(ID 1)로 이동 (이미 있으면 무시)
INSERT OR IGNORE INTO inventory (warehouse_id, product_id, quantity)
SELECT 1, id, current_stock FROM products;

-- 4. 재고 이동 이력에 창고 ID 추가 (컬럼이 없을 때만 추가하는 문법은 없으므로 에러 처리 필요할 수 있음. 하지만 마이그레이션 파일은 순차 실행되므로 가정함)
-- D1에서는 ALTER TABLE ADD COLUMN IF NOT EXISTS를 지원하지 않을 수 있음. 
-- 다만 Local D1은 파일 기반이라 괜찮을 수 있음. 
-- 안전을 위해 컬럼 추가 시도는 별도 트랜잭션이나 에러 무시가 어려움.
-- 이미 컬럼이 있다면 에러가 나겠지만, 현재 스키마 확인 결과 없으므로 추가.
ALTER TABLE stock_movements ADD COLUMN warehouse_id INTEGER DEFAULT 1;

-- 5. 테스트 데이터: 서울(2), 구미(3) 창고에 재고 추가
INSERT OR IGNORE INTO inventory (warehouse_id, product_id, quantity)
SELECT 2, id, CAST(purchase_price / 1000 AS INTEGER) FROM products ORDER BY id DESC LIMIT 5;

INSERT OR IGNORE INTO inventory (warehouse_id, product_id, quantity)
SELECT 3, id, CAST(purchase_price / 500 AS INTEGER) FROM products ORDER BY id ASC LIMIT 5;
