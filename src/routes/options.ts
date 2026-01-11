import { Hono } from 'hono'
import { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// Get all option groups with values
app.get('/', async (c) => {
    const { DB } = c.env

    const groups = await DB.prepare('SELECT * FROM option_groups ORDER BY created_at DESC').all()
    const values = await DB.prepare('SELECT * FROM option_values').all()

    const result = groups.results.map((g: any) => ({
        ...g,
        values: values.results.filter((v: any) => v.group_id === g.id)
    }))

    return c.json({ success: true, data: result })
})

// Create option group
app.post('/', async (c) => {
    const { DB } = c.env
    const { name, values } = await c.req.json<{ name: string, values: any[] }>()

    if (!name) return c.json({ error: 'Group name is required' }, 400)

    try {
        const group = await DB.prepare('INSERT INTO option_groups (name) VALUES (?)').bind(name).run()
        const groupId = group.meta.last_row_id;

        if (values && Array.isArray(values) && values.length > 0) {
            const stmt = DB.prepare('INSERT INTO option_values (group_id, name, extra_price) VALUES (?, ?, ?)')
            const batch = values.map((v: any) => stmt.bind(groupId, v.name, v.extra_price || 0))
            await DB.batch(batch)
        }

        return c.json({ success: true, message: 'Created' })
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500)
    }
})

// Update option group
app.put('/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')
    const { name, values } = await c.req.json<{ name: string, values: any[] }>()

    try {
        await DB.prepare('UPDATE option_groups SET name = ? WHERE id = ?').bind(name, id).run()

        // Check if group exists
        // Delete existing values
        await DB.prepare('DELETE FROM option_values WHERE group_id = ?').bind(id).run()

        // Insert new values
        if (values && Array.isArray(values) && values.length > 0) {
            const stmt = DB.prepare('INSERT INTO option_values (group_id, name, extra_price) VALUES (?, ?, ?)')
            const batch = values.map((v: any) => stmt.bind(id, v.name, v.extra_price || 0))
            await DB.batch(batch)
        }

        return c.json({ success: true, message: 'Updated' })
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500)
    }
})

// Delete option group
app.delete('/:id', async (c) => {
    const { DB } = c.env
    const id = c.req.param('id')

    try {
        await DB.prepare('DELETE FROM option_groups WHERE id = ?').bind(id).run()
        await DB.prepare('DELETE FROM option_values WHERE group_id = ?').bind(id).run()

        return c.json({ success: true, message: 'Deleted' })
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500)
    }
})

export default app
