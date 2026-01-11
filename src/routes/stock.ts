import { Hono } from 'hono'
import type { Bindings, StockMovementRequest } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// 창고별 재고 현황 조회 (메인)
app.get('/', async (c) => {
  const { DB } = c.env
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit
  const search = c.req.query('search') || ''
  const warehouseId = c.req.query('warehouse_id') || ''

  let query = `
    SELECT 
      i.id, i.warehouse_id, i.product_id, i.quantity, i.updated_at,
      p.name as product_name, p.sku, p.category,
      w.name as warehouse_name
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    JOIN warehouses w ON i.warehouse_id = w.id
    WHERE 1=1
  `
  const params: any[] = []

  if (warehouseId) {
    query += ` AND i.warehouse_id = ?`
    params.push(warehouseId)
  }

  if (search) {
    query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`
    params.push(`%${search}%`, `%${search}%`)
  }

  // Count
  const countRes = await DB.prepare(`SELECT COUNT(*) as total FROM (${query})`).bind(...params).first<any>()
  const total = countRes.total

  // Data
  query += ` ORDER BY i.updated_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const { results } = await DB.prepare(query).bind(...params).all()

  return c.json({
    success: true,
    data: results,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

// 재고 이동 내역 조회 (필터/페이지네이션 적용)
app.get('/movements', async (c) => {
  const { DB } = c.env
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit

  const search = c.req.query('search') || ''
  const movementType = c.req.query('movement_type') || ''
  const warehouseId = c.req.query('warehouse_id') || ''
  const startDate = c.req.query('start_date') || ''
  const endDate = c.req.query('end_date') || ''

  let query = `
    SELECT sm.*, 
           p.name as product_name, p.sku, 
           w.name as warehouse_name
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    LEFT JOIN warehouses w ON sm.warehouse_id = w.id
    WHERE 1=1
  `
  const params: any[] = []

  if (search) {
    query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`
    params.push(`%${search}%`, `%${search}%`)
  }

  if (movementType && movementType !== '전체') {
    query += ` AND sm.movement_type = ?`
    params.push(movementType)
  }

  if (warehouseId) {
    query += ` AND sm.warehouse_id = ?`
    params.push(warehouseId)
  }

  if (startDate) {
    query += ` AND date(sm.created_at) >= ?`
    params.push(startDate)
  }

  if (endDate) {
    query += ` AND date(sm.created_at) <= ?`
    params.push(endDate)
  }

  // Count
  const countRes = await DB.prepare(`SELECT COUNT(*) as total FROM (${query})`).bind(...params).first<any>()
  const total = countRes.total || 0

  // Data
  query += ` ORDER BY sm.created_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const { results } = await DB.prepare(query).bind(...params).all()

  return c.json({
    success: true,
    data: results,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

// 재고 입고
app.post('/in', async (c) => {
  const { DB } = c.env
  const body = await c.req.json<any>()
  const quantity = parseInt(body.quantity)
  const warehouseId = body.warehouse_id || 1

  if (quantity <= 0) return c.json({ success: false, error: '수량은 0보다 커야 합니다.' }, 400)

  // 1. Inventory Update
  const exists = await DB.prepare(`SELECT id, quantity FROM inventory WHERE warehouse_id = ? AND product_id = ?`)
    .bind(warehouseId, body.product_id).first<any>()

  if (exists) {
    await DB.prepare(`UPDATE inventory SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(quantity, exists.id).run()
  } else {
    try {
      await DB.prepare(`INSERT INTO inventory (warehouse_id, product_id, quantity) VALUES (?, ?, ?)`)
        .bind(warehouseId, body.product_id, quantity).run()
    } catch (e) {
      return c.json({ success: false, error: '재고 생성 실패' }, 500)
    }
  }

  // 2. Products Total Update
  await DB.prepare(`UPDATE products SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(quantity, body.product_id).run()

  // 3. Log
  await DB.prepare(`
    INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reason, notes)
    VALUES (?, ?, '입고', ?, ?, ?)
  `).bind(body.product_id, warehouseId, quantity, body.reason || '입고', body.notes || null).run()

  return c.json({ success: true, message: '입고 처리되었습니다.' })
})

// 재고 출고
app.post('/out', async (c) => {
  const { DB } = c.env
  const body = await c.req.json<any>()
  const quantity = parseInt(body.quantity)
  const warehouseId = body.warehouse_id || 1

  if (quantity <= 0) return c.json({ success: false, error: '수량은 0보다 커야 합니다.' }, 400)

  // Check Inventory
  const inv = await DB.prepare(`SELECT id, quantity FROM inventory WHERE warehouse_id = ? AND product_id = ?`)
    .bind(warehouseId, body.product_id).first<any>()

  if (!inv || inv.quantity < quantity) {
    return c.json({ success: false, error: `해당 창고의 재고가 부족합니다. (현재: ${inv ? inv.quantity : 0})` }, 400)
  }

  // Update Inventory
  await DB.prepare(`UPDATE inventory SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(quantity, inv.id).run()

  // Update Products Total
  await DB.prepare(`UPDATE products SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(quantity, body.product_id).run()

  // Log
  await DB.prepare(`
    INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reason, notes)
    VALUES (?, ?, '출고', ?, ?, ?)
  `).bind(body.product_id, warehouseId, -quantity, body.reason || '출고', body.notes || null).run()

  return c.json({ success: true, message: '출고 처리되었습니다.' })
})

// 재고 조정
app.post('/adjust', async (c) => {
  const { DB } = c.env
  const body = await c.req.json<any>()
  const newStock = parseInt(body.new_stock)
  const warehouseId = body.warehouse_id || 1

  const inv = await DB.prepare(`SELECT id, quantity FROM inventory WHERE warehouse_id = ? AND product_id = ?`)
    .bind(warehouseId, body.product_id).first<any>()

  let currentQty = inv ? inv.quantity : 0
  let diff = newStock - currentQty

  if (diff === 0) return c.json({ success: false, error: '변동 없음' }, 400)

  if (inv) {
    await DB.prepare(`UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(newStock, inv.id).run()
  } else {
    await DB.prepare(`INSERT INTO inventory (warehouse_id, product_id, quantity) VALUES (?, ?, ?)`)
      .bind(warehouseId, body.product_id, newStock).run()
  }

  await DB.prepare(`UPDATE products SET current_stock = current_stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(diff, body.product_id).run()

  await DB.prepare(`
        INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reason, notes)
        VALUES (?, ?, '조정', ?, ?, ?)
    `).bind(body.product_id, warehouseId, diff, body.reason || '재고 조정', body.notes || `조정: ${currentQty} -> ${newStock}`).run()

  return c.json({ success: true, message: '조정 완료' })
})

// 재고 현황 요약
app.get('/summary', async (c) => {
  const { DB } = c.env
  const summary = await DB.prepare(`
    SELECT 
      COUNT(*) as total_products,
      SUM(current_stock) as total_stock,
      SUM(current_stock * purchase_price) as total_stock_value
    FROM products
    WHERE is_active = 1
  `).first()
  return c.json({ success: true, data: summary })
})

export default app
