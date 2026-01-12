import { Hono, Context } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'

// API 라우트 import
import productsRouter from './routes/products'
import customersRouter from './routes/customers'
import salesRouter from './routes/sales'
import stockRouter from './routes/stock'
import dashboardRouter from './routes/dashboard'
import claimsRouter from './routes/claims'
import usersRouter from './routes/users'
import outboundRouter from './routes/outbound'
import authRouter from './routes/auth'
import settingsRouter from './routes/settings'
import warehousesRouter from './routes/warehouses'
import inboundRouter from './routes/inbound'
import suppliersRouter from './routes/suppliers'
import optionsRouter from './routes/options'
import pricesRouter from './routes/prices'
import systemRouter from './routes/system'

const app = new Hono<{ Bindings: Bindings }>()

// CORS 활성화
app.use('/api/*', cors())

// API 라우트 등록
app.route('/api/auth', authRouter)
app.route('/api/products', productsRouter)
app.route('/api/customers', customersRouter)
app.route('/api/sales', salesRouter)
app.route('/api/stock', stockRouter)
app.route('/api/dashboard', dashboardRouter)
app.route('/api/claims', claimsRouter)
app.route('/api/users', usersRouter)
app.route('/api/outbound', outboundRouter)
app.route('/api/settings', settingsRouter)
app.route('/api/warehouses', warehousesRouter)
app.route('/api/inbound', inboundRouter)
app.route('/api/suppliers', suppliersRouter)
app.route('/api/options', optionsRouter)
app.route('/api/prices', pricesRouter)
app.route('/api/system', systemRouter)

// 로그인 페이지
app.get('/login', (c: Context) => {
    return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>로그인 - WOW-Smart Manager</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <style>
            body {
                font-family: 'Inter', 'Noto Sans KR', sans-serif;
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            }
        </style>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#14b8a6',
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-5xl">
            <!-- 로그인 카드 -->
            <div class="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
                <div class="grid md:grid-cols-2 gap-0">
                    <!-- 왼쪽: 서비스 소개 -->
                    <div class="p-12 bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-white flex flex-col justify-center">
                        <div class="mb-8">
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span class="text-2xl font-bold">W</span>
                                </div>
                            </div>
                            <h1 class="text-3xl font-bold mb-1">WOW</h1>
                            <p class="text-2xl font-bold text-teal-400">Smart Manager</p>
                        </div>
                        
                        <p class="text-slate-300 mb-8">
                            WOW Smart Manager는 단순한 관리 도어<br>
                            데이터를 통한 비즈니스 통찰을 제공합니다.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white">Real-time Stock Tracking</h3>
                                    <p class="text-sm text-slate-400">실시간 재고 추적 시스템</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white">Smart Sales Insights</h3>
                                    <p class="text-sm text-slate-400">스마트 판매 데이터 인사이트</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 오른쪽: 로그인 폼 -->
                    <div class="p-12 bg-slate-800/30">
                        <div class="mb-8">
                            <h2 class="text-3xl font-bold text-white mb-2">환영합니다</h2>
                            <p class="text-slate-400">로그인하여 서비스를 시작하세요</p>
                        </div>
                        
                        <!-- 탭 -->
                        <div class="flex gap-2 mb-8 bg-slate-700/50 p-1 rounded-xl">
                            <button id="loginTabBtn" onclick="switchTab('login')" class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-white bg-teal-500 shadow-lg">
                                로그인
                            </button>
                            <button id="registerTabBtn" onclick="switchTab('register')" class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-slate-400">
                                회원가입
                            </button>
                        </div>
                        
                        <!-- 로그인 폼 -->
                        <form id="loginForm" onsubmit="handleLogin(event)">
                            <div class="space-y-4 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">이메일 주소</label>
                                    <input type="email" id="loginEmail" placeholder="super@wow3d.com" 
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">비밀번호</label>
                                    <input type="password" id="loginPassword" placeholder="••••••••"
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                                </div>
                            </div>
                            
                            <button type="submit" class="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transform hover:-translate-y-0.5">
                                로그인하기
                            </button>
                            
                            <p class="text-center text-sm text-slate-400 mt-6">
                                가입 시간은 누구나보다 빠릅니다. 
                                <a href="#" class="text-teal-400 hover:text-teal-300 font-medium">이용약관 및 개인정보처리방침</a>
                            </p>
                        </form>
                        
                        <!-- 회원가입 폼 -->
                        <form id="registerForm" class="hidden" onsubmit="handleRegister(event)">
                            <div class="space-y-4 mb-6">
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">이메일</label>
                                    <input type="email" id="regEmail" required
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">비밀번호</label>
                                    <input type="password" id="regPassword" required
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">이름</label>
                                    <input type="text" id="regName" required
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">전화번호</label>
                                    <input type="tel" id="regPhone"
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">회사명</label>
                                    <input type="text" id="regCompany"
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-2">플랜</label>
                                    <select id="regPlan"
                                        class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                                        <option value="FREE">Free Starter (₩0/월)</option>
                                        <option value="STANDARD">Standard Business (₩9,900/월)</option>
                                        <option value="ENTERPRISE">Enterprise Pro (₩29,900/월)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" class="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/30">
                                회원가입
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- 하단 가격 정책 -->
            <div class="mt-12 text-center">
                <p class="text-teal-400 text-xs font-semibold tracking-wider uppercase mb-4">PRICING MODELS</p>
                <h3 class="text-3xl font-bold text-white mb-3">비즈니스에 맞는 최적의 플랜</h3>
                <p class="text-slate-400 mb-10">합리적인 요금으로 시작하는 스마트한 관리의 첫걸음</p>
                
                <div class="grid md:grid-cols-3 gap-6">
                    <!-- Free Starter -->
                    <div class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-teal-500/50 transition-all">
                        <h4 class="text-white font-bold text-xl mb-2">Free Starter</h4>
                        <div class="mb-6">
                            <span class="text-4xl font-bold text-white">₩0</span>
                            <span class="text-slate-400">/month</span>
                        </div>
                        <p class="text-sm text-slate-400 mb-6">가장 빠른 시작으로 입문<br>최소 비용 관리 시작하세요</p>
                        <ul class="text-left space-y-3 text-sm text-slate-300">
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                상품 등록 최대 100개
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                1인 사용자 계정
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                기본 수출 관리
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Standard Business (추천) -->
                    <div class="bg-gradient-to-br from-teal-500/20 to-teal-600/20 backdrop-blur-xl border-2 border-teal-500 rounded-2xl p-8 relative transform scale-105">
                        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                            POPULAR
                        </div>
                        <h4 class="text-white font-bold text-xl mb-2">Standard Business</h4>
                        <div class="mb-6">
                            <span class="text-4xl font-bold text-white">₩9,900</span>
                            <span class="text-slate-300">/month</span>
                        </div>
                        <p class="text-sm text-slate-300 mb-6">단계적인 성장을 성취하는<br>담을 위한 전문성과 관리 기능</p>
                        <ul class="text-left space-y-3 text-sm text-white">
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                상품 등록 최대 1,000개
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                사용자 계정 최대 5명
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                데이터 백업 대시보드
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                주간 실적 리포트
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Enterprise Pro -->
                    <div class="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                        <h4 class="text-white font-bold text-xl mb-2">Enterprise Pro</h4>
                        <div class="mb-6">
                            <span class="text-4xl font-bold text-white">₩29,900</span>
                            <span class="text-slate-400">/month</span>
                        </div>
                        <p class="text-sm text-slate-400 mb-6">최고 수준의 비즈니스 스케<br>확장 기능을 가능하게 하는 리더</p>
                        <ul class="text-left space-y-3 text-sm text-slate-300">
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                상품 및 사용자 무제한
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                API 및 웹훅 연동 가능
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                실시간 재고 관리
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                우선 기술 지원 제공
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            const API_BASE = '/api';
            
            function switchTab(tab) {
                const loginForm = document.getElementById('loginForm');
                const registerForm = document.getElementById('registerForm');
                const loginBtn = document.getElementById('loginTabBtn');
                const registerBtn = document.getElementById('registerTabBtn');
                
                if (tab === 'login') {
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                    loginBtn.classList.add('text-white', 'bg-teal-500', 'shadow-lg');
                    loginBtn.classList.remove('text-slate-400');
                    registerBtn.classList.add('text-slate-400');
                    registerBtn.classList.remove('text-white', 'bg-teal-500', 'shadow-lg');
                } else {
                    loginForm.classList.add('hidden');
                    registerForm.classList.remove('hidden');
                    registerBtn.classList.add('text-white', 'bg-teal-500', 'shadow-lg');
                    registerBtn.classList.remove('text-slate-400');
                    loginBtn.classList.add('text-slate-400');
                    loginBtn.classList.remove('text-white', 'bg-teal-500', 'shadow-lg');
                }
            }
            
            async function handleLogin(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                try {
                    const res = await axios.post(\`\${API_BASE}/auth/login\`, { email, password });
                    if (res.data.success) {
                        localStorage.setItem('token', res.data.data.token);
                        localStorage.setItem('refreshToken', res.data.data.refreshToken);
                        localStorage.setItem('user', JSON.stringify(res.data.data.user));
                        window.location.href = '/';
                    }
                } catch (err) {
                    alert(err.response?.data?.error || '로그인 실패');
                }
            }
            
            async function handleRegister(e) {
                e.preventDefault();
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const name = document.getElementById('regName').value;
                const phone = document.getElementById('regPhone').value;
                const company_name = document.getElementById('regCompany').value;
                const plan = document.getElementById('regPlan').value;
                try {
                    const res = await axios.post(\`\${API_BASE}/auth/register\`, {
                        email, password, name, phone, company_name, plan
                    });
                    if (res.data.success) {
                        alert('회원가입이 완료되었습니다. 자동 로그인됩니다.');
                        localStorage.setItem('token', res.data.data.token);
                        localStorage.setItem('refreshToken', res.data.data.refreshToken);
                        localStorage.setItem('user', JSON.stringify(res.data.data.user));
                        window.location.href = '/';
                    }
                } catch (err) {
                    alert(err.response?.data?.error || '회원가입 실패');
                }
            }
        </script>
    </body>
    </html>
    `)
})

// 메인 페이지
app.get('/', (c: Context) => {
    return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>(주)와우쓰리디 판매관리</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', 'Noto Sans KR', sans-serif;
                background-color: #f8fafc; /* Slate 50 */
            }
            
            /* Custom Scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }

            .nav-link {
                transition: all 0.2s ease-in-out;
            }
            
            .nav-link.active {
                background: #4f46e5; /* Indigo 600 */
                color: white;
                box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
            }
            
            .nav-link:not(.active):hover {
                background: #1e293b; /* Slate 800 */
                color: #e2e8f0;
            }

            .glass-header {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(8px);
            }
        </style>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#4f46e5', // Indigo 600
                            secondary: '#64748b', // Slate 500
                        },
                        fontFamily: {
                            sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="text-slate-800 antialiased">
        <div id="app" class="flex h-screen overflow-hidden">
            <!-- 사이드바 -->
            <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
                <div class="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">W</div>
                        <div>
                            <h1 class="text-white font-bold text-lg leading-none">WOW3D</h1>
                            <p class="text-xs text-slate-500 font-medium mt-0.5">Sales Manager</p>
                        </div>
                    </div>
                </div>

                <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    <!-- 분석 및 현황 -->
                    <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">분석 및 현황</p>
                    <a href="#" data-page="dashboard" class="nav-link active flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-chart-pie w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">대시보드</span>
                    </a>

                    <!-- 영업 및 물류 -->
                    <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">영업 및 물류</p>
                    
                    <!-- 판매 관리 (확장 가능) -->
                    <div class="submenu-container">
                        <button class="nav-link w-full flex items-center justify-between px-3 py-2.5 rounded-lg group" onclick="toggleSubmenu('sales-submenu')">
                            <div class="flex items-center">
                                <i class="fas fa-cash-register w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                                <span class="font-medium text-sm">판매 관리</span>
                            </div>
                            <i class="fas fa-chevron-down text-xs transition-transform duration-200" id="sales-submenu-icon"></i>
                        </button>
                        <div id="sales-submenu" class="submenu hidden ml-8 mt-1 space-y-1">
                            <a href="#" data-page="sales" data-tab="pos" class="nav-link flex items-center px-3 py-2 rounded-lg group text-sm">
                                <i class="fas fa-shopping-cart w-4 text-center mr-2 text-slate-500 group-hover:text-emerald-400 transition-colors text-xs"></i>
                                <span class="font-medium text-slate-400 group-hover:text-white transition-colors">POS (판매등록)</span>
                            </a>
                            <a href="#" data-page="sales" data-tab="orders" class="nav-link flex items-center px-3 py-2 rounded-lg group text-sm">
                                <i class="fas fa-truck w-4 text-center mr-2 text-slate-500 group-hover:text-blue-400 transition-colors text-xs"></i>
                                <span class="font-medium text-slate-400 group-hover:text-white transition-colors">주문/배송 관리</span>
                            </a>
                            <a href="#" data-page="sales" data-tab="claims" class="nav-link flex items-center px-3 py-2 rounded-lg group text-sm">
                                <i class="fas fa-undo w-4 text-center mr-2 text-slate-500 group-hover:text-amber-400 transition-colors text-xs"></i>
                                <span class="font-medium text-slate-400 group-hover:text-white transition-colors">반품/교환 관리</span>
                            </a>
                        </div>
                    </div>

                    <a href="#" data-page="outbound" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-truck-loading w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">출고 관리</span>
                    </a>
                    <a href="#" data-page="inbound" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-dolly w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">입고/발주 관리</span>
                    </a>
                    <a href="#" data-page="stock" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-warehouse w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">재고 관리</span>
                    </a>
                    <a href="#" data-page="invoice" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-file-invoice w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">거래명세서 출력</span>
                    </a>

                    <!-- 기준 정보 -->
                    <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">기준 정보</p>
                    
                    <!-- 상품 관리 (확장 가능) -->
                    <div class="submenu-container">
                        <button class="nav-link w-full flex items-center justify-between px-3 py-2.5 rounded-lg group" onclick="toggleSubmenu('products-submenu')">
                            <div class="flex items-center">
                                <i class="fas fa-box w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                                <span class="font-medium text-sm">상품 관리</span>
                            </div>
                            <i class="fas fa-chevron-down text-xs transition-transform duration-200" id="products-submenu-icon"></i>
                        </button>
                        <div id="products-submenu" class="submenu hidden ml-8 mt-1 space-y-1">
    <a href="#" data-page="products" class="nav-link flex items-center px-3 py-2 rounded-lg group text-sm">
        <i class="fas fa-list w-4 text-center mr-2 text-slate-500 group-hover:text-teal-400 transition-colors text-xs"></i>
        <span class="font-medium text-slate-400 group-hover:text-white transition-colors">품목 정보 관리</span>
    </a>
    <a href="#" data-page="option-presets" class="nav-link flex items-center px-3 py-2 rounded-lg group text-sm">
        <i class="fas fa-tags w-4 text-center mr-2 text-slate-500 group-hover:text-teal-400 transition-colors text-xs"></i>
        <span class="font-medium text-slate-400 group-hover:text-white transition-colors">옵션 프리셋 관리</span>
    </a>
    <a href="#" data-page="price-policies" class="nav-link flex items-center px-3 py-2 rounded-lg group text-sm">
        <i class="fas fa-hand-holding-usd w-4 text-center mr-2 text-slate-500 group-hover:text-teal-400 transition-colors text-xs"></i>
        <span class="font-medium text-slate-400 group-hover:text-white transition-colors">가격 정책 관리</span>
    </a>
</div>                        
                        </div>

                    <a href="#" data-page="customers" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-users w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">고객 관리</span>
                    </a>
                    
                    <!-- 시스템 -->
                    <p class="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">시스템</p>
                    <a href="#" data-page="system" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-shield-alt w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">시스템 관리</span>
                    </a>
                    <a href="#" data-page="settings" class="nav-link flex items-center px-3 py-2.5 rounded-lg group">
                        <i class="fas fa-cog w-5 text-center mr-3 group-hover:text-white transition-colors"></i>
                        <span class="font-medium text-sm">설정</span>
                    </a>
                </nav>
                
                <div class="p-4 border-t border-slate-800 bg-slate-900">
                    <div class="flex items-center gap-3 px-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md" id="user-avatar">
                            U
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white truncate" id="user-name">Loading...</p>
                            <p class="text-xs text-slate-500 truncate" id="user-email">...</p>
                        </div>
                        <button onclick="logout()" class="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-800" title="로그아웃">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>

            <!-- 메인 컨텐츠 -->
            <div class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
                <!-- 헤더 -->
                <header class="h-16 glass-header border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
                    <div class="flex items-center">
                        <h2 id="page-title" class="text-xl font-bold text-slate-800">대시보드</h2>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-right hidden sm:block">
                            <p class="text-xs font-medium text-slate-500" id="current-date"></p>
                            <p class="text-sm font-bold text-slate-700 font-mono" id="current-time"></p>
                        </div>
                        <button class="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
                            <i class="fas fa-bell text-lg"></i>
                        </button>
                    </div>
                </header>
                
                <main id="content" class="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <!-- 동적 컨텐츠 영역 -->
                </main>
            </div>
        </div>

        <script>
            // 현재 시간 표시
            function updateTime() {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = now.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                document.getElementById('current-time').textContent = timeStr;
                document.getElementById('current-date').textContent = dateStr;
            }
            updateTime();
            setInterval(updateTime, 1000);

            // 서브메뉴 토글 함수
            window.toggleSubmenu = function(id) {
                const submenu = document.getElementById(id);
                const icon = document.getElementById(id + '-icon');
                
                if (submenu.classList.contains('hidden')) {
                    submenu.classList.remove('hidden');
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    submenu.classList.add('hidden');
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        </script>
        <script type="module" src="/static/app.js?v=${Date.now()}"></script>
    </body>
    </html>
  `)
})

export default app
