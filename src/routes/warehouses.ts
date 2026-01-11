import { Hono } from 'hono'
import type { Bindings, Warehouse } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// 창고 목록 조회
app.get('/', async (c) => {
    const { DB } = c.env
    const { results } = await DB.prepare('SELECT * FROM warehouses ORDER BY is_active DESC, created_at DESC').all<Warehouse>()
    return c.json({ success: true, data: results })
})

// 창고 생성
app.post('/', async (c) => {
    const { DB } = c.env
    const body = await c.req.json<any>()

    if (!body.name) {
        return c.json({ success: false, error: '창고명은 필수입니다.' }, 400)
    }

    const { success, meta } = await DB.prepare(`
        INSERT INTO warehouses (name, location, description, is_active)
        VALUES (?, ?, ?, ?)
    `).bind(
        body.name,
        body.location || null,
        body.description || null,
        body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
    ).run()

    if (success) {
        return c.json({ success: true, message: '창고가 등록되었습니다.', data: { id: meta.last_row_id } })
    } else {
        return c.json({ success: false, error: '창고 등록에 실패했습니다.' }, 500)
    }
})

// 창고 수정
app.put('/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    const body = await c.req.json<any>()

    const { success } = await DB.prepare(`
        UPDATE warehouses 
        SET name = ?, location = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).bind(
        body.name,
        body.location || null,
        body.description || null,
        body.is_active ? 1 : 0,
        id
    ).run()

    if (success) {
        return c.json({ success: true, message: '창고 정보가 수정되었습니다.' })
    } else {
        return c.json({ success: false, error: '창고 수정에 실패했습니다.' }, 500)
    }
})

// 창고 삭제
app.delete('/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')

    // 실제 삭제 대신 비활성화 처리 또는 삭제
    // 여기서는 삭제 구현
    const { success } = await DB.prepare('DELETE FROM warehouses WHERE id = ?').bind(id).run()

    if (success) {
        return c.json({ success: true, message: '창고가 삭제되었습니다.' })
    } else {
        return c.json({ success: false, error: '창고 삭제에 실패했습니다.' }, 500)
    }
})

export default app
