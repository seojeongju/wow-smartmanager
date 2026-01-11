import { Hono } from 'hono'
import { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// Get all grade prices
app.get('/grades', async (c) => {
    const { DB } = c.env
    const results = await DB.prepare('SELECT * FROM price_by_grade').all()
    return c.json({ success: true, data: results.results })
})

// Update grade prices (Batch)
app.post('/grades', async (c) => {
    const { DB } = c.env
    const { entries } = await c.req.json<{ entries: { product_id: number, grade: string, price: number }[] }>()

    if (!entries || !Array.isArray(entries)) return c.json({ error: 'Invalid data' }, 400)

    const stmt = DB.prepare(`
    INSERT INTO price_by_grade (product_id, grade, price) 
    VALUES (?, ?, ?) 
    ON CONFLICT(product_id, grade) DO UPDATE SET price = excluded.price, updated_at = CURRENT_TIMESTAMP
  `)

    const batch = entries.map(e => stmt.bind(e.product_id, e.grade, e.price))
    await DB.batch(batch)

    return c.json({ success: true, message: 'Saved' })
})

// Get customer prices
app.get('/customers', async (c) => {
    const { DB } = c.env
    const customerId = c.req.query('customerId')

    let query = 'SELECT * FROM price_by_customer'
    let params: any[] = []

    if (customerId) {
        query += ' WHERE customer_id = ?'
        params.push(customerId)
    }

    const results = await DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results.results })
})

// Update customer prices
app.post('/customers', async (c) => {
    const { DB } = c.env
    const { entries } = await c.req.json<{ entries: { product_id: number, customer_id: number, price: number }[] }>()

    if (!entries || !Array.isArray(entries)) return c.json({ error: 'Invalid data' }, 400)

    const stmt = DB.prepare(`
        INSERT INTO price_by_customer (product_id, customer_id, price)
        VALUES (?, ?, ?)
        ON CONFLICT(product_id, customer_id) DO UPDATE SET price = excluded.price, updated_at = CURRENT_TIMESTAMP
    `)

    const batch = entries.map(e => stmt.bind(e.product_id, e.customer_id, e.price))
    await DB.batch(batch)

    return c.json({ success: true, message: 'Saved' })
})

export default app
