import { Hono } from 'hono'
import type { Bindings } from '../types'

const router = new Hono<{ Bindings: Bindings }>()

// 로그인 API
router.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  
  // TODO: 실제 인증 로직 구현
  // 임시로 간단한 검증
  if (!email || !password) {
    return c.json({ success: false, error: '이메일과 비밀번호를 입력해주세요.' }, 400)
  }

  // 임시 사용자 데이터 (나중에 DB 조회로 변경)
  if (email === 'admin@wow3d.com' && password === 'admin') {
    return c.json({
      success: true,
      data: {
        token: 'temp-token-' + Date.now(),
        refreshToken: 'temp-refresh-' + Date.now(),
        user: {
          id: 1,
          email: 'admin@wow3d.com',
          name: '관리자',
          role: 'admin'
        }
      }
    })
  }

  return c.json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
})

// 회원가입 API
router.post('/register', async (c) => {
  const { email, password, name, phone, company_name, plan } = await c.req.json()
  
  if (!email || !password || !name) {
    return c.json({ success: false, error: '필수 정보를 입력해주세요.' }, 400)
  }

  // TODO: 실제 회원가입 로직 구현
  // 임시 응답
  return c.json({
    success: true,
    data: {
      token: 'temp-token-' + Date.now(),
      refreshToken: 'temp-refresh-' + Date.now(),
      user: {
        id: Date.now(),
        email,
        name,
        role: 'user',
        plan: plan || 'FREE'
      }
    }
  })
})

export default router
