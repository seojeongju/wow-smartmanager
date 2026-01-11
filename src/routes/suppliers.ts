import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// 목록 조회
app.get('/', async (c) => {
    const { DB } = c.env
    const search = c.req.query('search') || ''

    let query = `SELECT * FROM suppliers`
    const params: any[] = []

    if (search) {
        query += ` WHERE name LIKE ? OR contact_person LIKE ?`
        params.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY created_at DESC`

    const { results } = await DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
})

// 등록
app.post('/', async (c) => {
    const { DB } = c.env
    const body = await c.req.json()
    const { name, contact_person, phone, email, address } = body

    if (!name) return c.json({ success: false, error: '공급사명은 필수입니다.' }, 400)

    try {
        const res = await DB.prepare(
            `INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)`
        ).bind(name, contact_person, phone, email, address).run()

        return c.json({ success: true, id: res.meta.last_row_id })
    } catch (e: any) {
        if (e.message.includes('UNIQUE')) {
            return c.json({ success: false, error: '이미 존재하는 공급사명입니다.' }, 409)
        }
        return c.json({ success: false, error: e.message }, 500)
    }
})

// 수정
app.put('/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    const body = await c.req.json()
    const { name, contact_person, phone, email, address } = body

    try {
        await DB.prepare(
            `UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
        ).bind(name, contact_person, phone, email, address, id).run()

        return c.json({ success: true })
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500)
    }
})

// 삭제
app.delete('/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    await DB.prepare(`DELETE FROM suppliers WHERE id=?`).bind(id).run()
    return c.json({ success: true })
})

export default app
