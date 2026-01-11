import { Hono } from 'hono'
import type { Bindings } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

// 입고/발주 목록 조회
app.get('/', async (c) => {
    const { DB } = c.env
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const status = c.req.query('status') || ''
    const startDate = c.req.query('start_date') || ''
    const endDate = c.req.query('end_date') || ''

    const offset = (page - 1) * limit

    // 기본 쿼리: stock_movements + products JOIN
    // movement_type이 '입고'인 것만 조회. 
    // 실제 발주 테이블이 없으므로 재고 이동 내역을 발주 내역으로 매핑.
    let baseQuery = `
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    WHERE sm.movement_type = '입고'
  `

    const params: any[] = []

    if (search) {
        baseQuery += ` AND (p.name LIKE ? OR p.supplier LIKE ?)`
        params.push(`%${search}%`, `%${search}%`)
    }

    // status 필터: 현재는 '입고' 내역만 있으므로 'RECEIVED'만 매칭되거나 전체 조회.
    // 발주(ORDERED) 데이터는 없으므로 필터 시 결과가 없을 수 있음.
    if (status) {
        if (status === 'RECEIVED') {
            // 아무것도 안함 (기본이 입고이므로)
        } else {
            // 다른 상태는 데이터가 없음
            return c.json({ success: true, data: [], meta: { page, limit, total: 0, totalPages: 0 } })
        }
    }

    if (startDate) {
        baseQuery += ` AND date(sm.created_at) >= ?`
        params.push(startDate)
    }

    if (endDate) {
        baseQuery += ` AND date(sm.created_at) <= ?`
        params.push(endDate)
    }

    // 총 개수 조회
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`
    const countResult = await DB.prepare(countQuery).bind(...params).first<any>()
    const total = countResult?.total || 0
    const totalPages = Math.ceil(total / limit)

    // 데이터 조회
    const dataQuery = `
    SELECT 
      sm.id,
      sm.created_at,
      sm.quantity,
      p.name as product_name,
      p.supplier,
      p.purchase_price,
      (sm.quantity * p.purchase_price) as total_amount
    ${baseQuery}
    ORDER BY sm.created_at DESC 
    LIMIT ? OFFSET ?
  `

    params.push(limit, offset) // LIMIT, OFFSET 파라미터 추가

    // ... 쿼리 실행 ...
    const { results } = await DB.prepare(dataQuery).bind(...params).all()

    // [UI 구현용 가상 데이터] 발주 완료 상태(ORDERED)의 데이터를 강제로 추가하여 상세 입고 기능을 테스트할 수 있게 함
    // 실제 DB에는 입고완료된 내역만 있으므로, 이 시뮬레이션 데이터가 없으면 '상세입고' 기능을 쓸 수 없음.
    const mockPending = (page === 1 && !search && (!status || status === 'ORDERED')) ? [
        {
            id: 999901,
            created_at: new Date().toISOString(),
            quantity: 2000,
            product_name: '토이맨 3단바켓',
            supplier: '올리브영랜드',
            purchase_price: 1000,
            total_amount: 2000000,
            is_mock: true // 식별자
        },
        {
            id: 999902,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            quantity: 50,
            product_name: '프리미엄 노트북 가방',
            supplier: '삼성물산',
            purchase_price: 35000,
            total_amount: 1750000,
            is_mock: true
        }
    ] : [];

    const combinedResults = [...mockPending, ...results];

    // 데이터 가공
    const formattedResults = combinedResults.map((item: any) => {
        const d = new Date(item.created_at)
        const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '')

        // 가상 데이터는 'ORDERED'(발주완료), 실제 데이터는 'RECEIVED'(입고완료)
        const status = item.is_mock ? 'ORDERED' : 'RECEIVED';
        const poNumber = item.is_mock
            ? (item.id === 999901 ? 'PO-20251212-010' : `PO-${dateStr}-${String(item.id).slice(-3)}`)
            : `PO-${dateStr}-${String(item.id).padStart(3, '0')}`;

        return {
            id: item.id,
            po_number: poNumber,
            supplier: item.supplier || '알 수 없음',
            product_names: item.product_name || '상품 정보 없음',
            status: status,
            amount: item.total_amount || 0,
            expected_date: item.is_mock ? '2026-01-20' : item.created_at.split(' ')[0],
            created_at: item.created_at,
            // 상세 모달을 위한 추가 정보
            quantity: item.quantity,
            unit_price: item.purchase_price
        }
    })

    // Mock 데이터가 추가되었으므로 Total 조정
    const finalTotal = total + mockPending.length;

    return c.json({
        success: true,
        data: formattedResults,
        meta: {
            page,
            limit,
            total: finalTotal,
            totalPages: Math.ceil(finalTotal / limit)
        }
    })
})

export default app
