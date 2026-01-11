import { Hono } from 'hono'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// === 회사 정보 ===

// 회사 정보 조회
router.get('/company', async (c) => {
    const { DB } = c.env
    const result = await DB.prepare(`
        SELECT * FROM settings WHERE key = 'company_info' LIMIT 1
    `).first<any>()

    const defaultData = {
        company_name: '(주)와우쓰리디',
        ceo_name: '홍길동',
        business_number: '123-45-67890',
        email: 'info@wow3d.com',
        phone: '054-454-2237',
        fax: '054-454-2238',
        address: '경북 구미시 3공단3로 302',
        address_detail: '2층',
        logo_url: ''
    }

    return c.json({
        success: true,
        data: result?.value ? JSON.parse(result.value) : defaultData
    })
})

// 회사 정보 수정
router.put('/company', async (c) => {
    const { DB } = c.env
    const data = await c.req.json<any>()

    await DB.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES ('company_info', ?, CURRENT_TIMESTAMP)
    `).bind(JSON.stringify(data)).run()

    return c.json({
        success: true,
        message: '회사 정보가 저장되었습니다.'
    })
})

// === 팀 설정 ===

// 팀 멤버 목록 조회
router.get('/team', async (c) => {
    const { DB } = c.env
    const { results } = await DB.prepare(`
        SELECT id, name, email, role, created_at 
        FROM users 
        WHERE tenant_id = ? 
        ORDER BY created_at DESC
    `).bind(1).all() // TODO: Get actual tenant_id from auth

    return c.json({
        success: true,
        data: results || []
    })
})

// 팀 멤버 초대
router.post('/team/invite', async (c) => {
    const { email, role } = await c.req.json<any>()

    // TODO: Send invitation email
    return c.json({
        success: true,
        message: '초대 이메일이 발송되었습니다.'
    })
})

// === 플랜 설정 ===

// 플랜 정보 조회
router.get('/plan', async (c) => {
    const { DB } = c.env
    const tenant = await DB.prepare(`
        SELECT plan, status FROM tenants WHERE id = ? LIMIT 1
    `).bind(1).first<any>() // TODO: Get actual tenant_id

    return c.json({
        success: true,
        data: {
            current_plan: tenant?.plan || 'FREE',
            status: tenant?.status || 'ACTIVE',
            features: {
                max_users: tenant?.plan === 'FREE' ? 3 : (tenant?.plan === 'PRO' ? 20 : 100),
                max_products: tenant?.plan === 'FREE' ? 100 : (tenant?.plan === 'PRO' ? 1000 : -1),
                storage_gb: tenant?.plan === 'FREE' ? 1 : (tenant?.plan === 'PRO' ? 10 : 100)
            }
        }
    })
})

// 플랜 변경 요청
router.post('/plan/upgrade', async (c) => {
    const { DB } = c.env
    const { requested_plan } = await c.req.json<any>()

    // Create plan change request
    await DB.prepare(`
        INSERT INTO plan_requests (tenant_id, current_plan, requested_plan, status, requested_at)
        VALUES (?, ?, ?, 'PENDING', CURRENT_TIMESTAMP)
    `).bind(1, 'FREE', requested_plan).run()

    return c.json({
        success: true,
        message: '플랜 변경 요청이 제출되었습니다.'
    })
})

// === API 설정 ===

// API 키 조회
router.get('/api-keys', async (c) => {
    const { DB } = c.env
    const result = await DB.prepare(`
        SELECT * FROM settings WHERE key = 'api_keys' LIMIT 1
    `).first<any>()

    return c.json({
        success: true,
        data: result?.value ? JSON.parse(result.value) : []
    })
})

// API 키 생성
router.post('/api-keys', async (c) => {
    const { name } = await c.req.json<any>()
    const apiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // TODO: Save to DB
    return c.json({
        success: true,
        data: { key: apiKey, name, created_at: new Date().toISOString() }
    })
})

// === 보안 설정 ===

// 보안 설정 조회
router.get('/security', async (c) => {
    const { DB } = c.env
    const result = await DB.prepare(`
        SELECT * FROM settings WHERE key = 'security_settings' LIMIT 1
    `).first<any>()

    const defaultData = {
        two_factor_enabled: false,
        session_timeout: 30,
        ip_whitelist: [],
        password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_number: true,
            require_special: true
        }
    }

    return c.json({
        success: true,
        data: result?.value ? JSON.parse(result.value) : defaultData
    })
})

// 보안 설정 수정
router.put('/security', async (c) => {
    const { DB } = c.env
    const data = await c.req.json<any>()

    await DB.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES ('security_settings', ?, CURRENT_TIMESTAMP)
    `).bind(JSON.stringify(data)).run()

    return c.json({
        success: true,
        message: '보안 설정이 저장되었습니다.'
    })
})

// Legacy endpoints (for compatibility)
router.get('/profile', async (c) => c.redirect('/api/settings/company'))
router.get('/business', async (c) => c.redirect('/api/settings/company'))
router.get('/system', async (c) => c.redirect('/api/settings/security'))

export default router
