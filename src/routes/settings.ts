import { Hono } from 'hono'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// 회원 정보 조회
router.get('/profile', async (c) => {
    // TODO: 인증된 사용자 정보 가져오기
    // 임시 데이터
    return c.json({
        success: true,
        data: {
            id: 1,
            email: 'admin@wow3d.com',
            name: '관리자',
            phone: '010-0000-0000',
            company_name: '(주)와우쓰리디',
            role: 'admin',
            created_at: '2025-01-01'
        }
    })
})

// 회원 정보 수정
router.put('/profile', async (c) => {
    const { name, phone, company_name } = await c.req.json()

    // TODO: DB 업데이트
    return c.json({
        success: true,
        message: '회원 정보가 수정되었습니다.'
    })
})

// 사업자 정보 조회
router.get('/business', async (c) => {
    // TODO: DB 조회
    return c.json({
        success: true,
        data: {
            business_name: '(주)와우쓰리디',
            business_number: '123-45-67890',
            ceo_name: '홍길동',
            address: '서울시 강남구',
            phone: '02-1234-5678',
            fax: '02-1234-5679'
        }
    })
})

// 사업자 정보 수정
router.put('/business', async (c) => {
    const data = await c.req.json()

    // TODO: DB 업데이트
    return c.json({
        success: true,
        message: '사업자 정보가 수정되었습니다.'
    })
})

// 로고 업로드
router.post('/logo', async (c) => {
    // TODO: 파일 업로드 처리
    // Cloudflare R2 또는 D1에 저장
    return c.json({
        success: true,
        message: '로고가 업로드되었습니다.',
        data: {
            logo_url: '/images/logo.png'
        }
    })
})

// 시스템 설정 조회
router.get('/system', async (c) => {
    return c.json({
        success: true,
        data: {
            currency: 'KRW',
            timezone: 'Asia/Seoul',
            date_format: 'YYYY-MM-DD',
            low_stock_threshold: 10
        }
    })
})

// 시스템 설정 수정
router.put('/system', async (c) => {
    const data = await c.req.json()

    // TODO: DB 업데이트
    return c.json({
        success: true,
        message: '시스템 설정이 저장되었습니다.'
    })
})

export default router
