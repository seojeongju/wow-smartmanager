CREATE TABLE warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_warehouses_timestamp 
AFTER UPDATE ON warehouses
BEGIN
  UPDATE warehouses SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
