import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// --- Tenants ---

app.get('/tenants', async (c) => {
    const { DB } = c.env
    const { results } = await DB.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all()
    return c.json({ success: true, data: results })
})

app.post('/tenants', async (c) => {
    const { DB } = c.env
    const body = await c.req.json<any>()

    if (!body.name) return c.json({ success: false, error: 'Name is required' }, 400)

    const res = await DB.prepare('INSERT INTO tenants (name, plan, status) VALUES (?, ?, ?)')
        .bind(body.name, body.plan || 'FREE', 'ACTIVE')
        .run()

    return c.json({ success: true, message: 'Tenant created', id: res.meta.last_row_id })
})

app.put('/tenants/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    const body = await c.req.json<any>()

    const updates: string[] = []
    const params: any[] = []

    if (body.name) { updates.push('name = ?'); params.push(body.name); }
    if (body.plan) { updates.push('plan = ?'); params.push(body.plan); }
    if (body.status) { updates.push('status = ?'); params.push(body.status); }

    if (updates.length === 0) return c.json({ success: false, error: 'No fields to update' }, 400)

    params.push(id)
    await DB.prepare(`UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

    return c.json({ success: true, message: 'Tenant updated' })
})

app.delete('/tenants/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    await DB.prepare('DELETE FROM tenants WHERE id = ?').bind(id).run()
    return c.json({ success: true, message: 'Tenant deleted' })
})

// --- Users (System Wide) ---
app.get('/users', async (c) => {
    const { DB } = c.env
    const { results } = await DB.prepare(`
        SELECT u.*, t.name as tenant_name 
        FROM users u 
        LEFT JOIN tenants t ON u.tenant_id = t.id 
        ORDER BY u.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
})

// Reset user password to default
app.post('/users/:id/reset-password', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')

    // Default password: "reset1234" (you should hash this in production)
    const defaultPassword = 'reset1234'

    await DB.prepare('UPDATE users SET password = ? WHERE id = ?')
        .bind(defaultPassword, id)
        .run()

    return c.json({
        success: true,
        message: '비밀번호가 초기화되었습니다.',
        default_password: defaultPassword
    })
})

// Change user role
app.post('/users/:id/change-role', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    const body = await c.req.json<any>()

    if (!body.role) {
        return c.json({ success: false, error: 'Role is required' }, 400)
    }

    const validRoles = ['ADMIN', 'MANAGER', 'STAFF']
    if (!validRoles.includes(body.role)) {
        return c.json({ success: false, error: 'Invalid role' }, 400)
    }

    await DB.prepare('UPDATE users SET role = ? WHERE id = ?')
        .bind(body.role, id)
        .run()

    return c.json({
        success: true,
        message: `권한이 ${body.role}(으)로 변경되었습니다.`
    })
})


// --- Plan Requests ---

app.get('/plan-requests', async (c) => {
    const { DB } = c.env
    const { results } = await DB.prepare(`
        SELECT pr.*, t.name as tenant_name 
        FROM plan_requests pr
        LEFT JOIN tenants t ON pr.tenant_id = t.id 
        ORDER BY pr.requested_at DESC
    `).all()
    return c.json({ success: true, data: results })
})

app.post('/plan-requests/:id/approve', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')

    // Find request
    const req = await DB.prepare('SELECT * FROM plan_requests WHERE id = ?').bind(id).first<any>()
    if (!req) return c.json({ success: false, error: 'Request not found' }, 404)
    if (req.status !== 'PENDING') return c.json({ success: false, error: 'Request already processed' }, 400)

    // Update Tenant
    await DB.prepare('UPDATE tenants SET plan = ? WHERE id = ?')
        .bind(req.requested_plan, req.tenant_id)
        .run()

    // Update Request
    await DB.prepare('UPDATE plan_requests SET status = ?, status_changed_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind('APPROVED', id)
        .run()

    return c.json({ success: true, message: 'Plan approved' })
})

app.post('/plan-requests/:id/reject', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')

    const req = await DB.prepare('SELECT * FROM plan_requests WHERE id = ?').bind(id).first<any>()
    if (!req) return c.json({ success: false, error: 'Request not found' }, 404)
    if (req.status !== 'PENDING') return c.json({ success: false, error: 'Request already processed' }, 400)

    await DB.prepare('UPDATE plan_requests SET status = ?, status_changed_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind('REJECTED', id)
        .run()

    return c.json({ success: true, message: 'Plan rejected' })
})


// --- Stats ---
app.get('/stats', async (c) => {
    const { DB } = c.env
    const tenantCount = await DB.prepare('SELECT count(*) as c FROM tenants').first<any>()
    const userCount = await DB.prepare('SELECT count(*) as c FROM users').first<any>()

    return c.json({
        success: true,
        data: {
            total_tenants: tenantCount.c,
            active_users: userCount.c,
            db_size_mb: 45.2, // Mock (D1 size not easily available via simple query)
            system_health: 'GOOD'
        }
    })
})

export default app
