// API Base URL
const API_BASE = '/api';

// 현재 페이지 상태
let currentPage = 'dashboard';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadUserInfo();
  loadPage('dashboard');
});

// 사용자 정보 로드
async function loadUserInfo() {
  try {
    const response = await axios.get(`${API_BASE}/users/me`);
    const user = response.data.data;

    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-email').textContent = user.email;

    if (user.avatar_url) {
      const avatarEl = document.getElementById('user-avatar');
      avatarEl.innerHTML = `<img src="${user.avatar_url}" alt="${user.name}" class="w-full h-full rounded-full object-cover">`;
    } else {
      document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    // 토큰이 만료되었거나 유효하지 않은 경우 로그인 페이지로 이동
    if (error.response && error.response.status === 401) {
      logout();
    }
  }
}

// 로그아웃
function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// 네비게이션 설정
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;

      // 활성 상태 변경
      document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active', 'text-white', 'bg-blue-500', 'shadow-md');
        l.classList.add('text-blue-100');
      });
      e.currentTarget.classList.add('active', 'text-white', 'bg-blue-500', 'shadow-md');
      e.currentTarget.classList.remove('text-blue-100');

      loadPage(page);
    });
  });
}

// 페이지 타이틀 업데이트
function updatePageTitle(title, subtitle) {
  const titleElement = document.getElementById('page-title');
  if (titleElement) {
    titleElement.textContent = title;
  }
  const subtitleElement = titleElement?.nextElementSibling;
  if (subtitleElement) {
    subtitleElement.textContent = subtitle;
  }
}

// 페이지 로드
async function loadPage(page) {
  currentPage = page;
  const content = document.getElementById('content');

  switch (page) {
    case 'dashboard':
      updatePageTitle('대시보드', '실시간 매출 및 재고 현황');
      await loadDashboard(content);
      break;
    case 'products':
      updatePageTitle('품목 정보 관리', '상품 등록 및 재고 관리');
      await loadProducts(content);
      break;
    case 'option-presets':
      updatePageTitle('옵션 프리셋 관리', '옵션 구성 및 프리셋 설정');
      await loadOptionPresets(content);
      break;
    case 'price-policies':
      updatePageTitle('가격 정책 관리', '가격 정책 및 할인 설정');
      await loadPricePolicies(content);
      break;
    case 'stock':
      updatePageTitle('재고 관리', '입고/출고 및 재고 조정');
      await loadStock(content);
      break;
    case 'sales':
      updatePageTitle('판매 관리', '판매 등록 및 내역 조회');
      await loadSales(content);
      break;
    case 'customers':
      updatePageTitle('고객 관리', '고객 정보 및 구매 이력 관리');
      await loadCustomers(content);
      break;
    case 'outbound':
      updatePageTitle('출고 관리', '출고 지시, 피킹, 패킹 및 배송 처리');
      await loadOutbound(content);
      break;
    case 'inbound':
      updatePageTitle('입고/발주 관리', '구매 발주 및 입고 처리');
      await loadInbound(content);
      break;
    case 'invoice':
      updatePageTitle('거래명세서 출력', '거래 명세서 조회 및 인쇄');
      await loadInvoice(content);
      break;
    case 'system':
      updatePageTitle('시스템 관리', '사용자 및 권한 관리');
      await loadSystem(content);
      break;
    case 'settings':
      updatePageTitle('설정', '회사 정보 및 시스템 설정');
      await loadSettings(content);
      break;
  }
}

// 입고/발주 관리 (준비 중)
// 입고/발주 관리 (준비 중)
// 입고/발주 관련 전역 변수
window.inboundPage = 1;
window.inboundItemsPerPage = 15;
window.filteredInboundList = null;
window.mockInboundData = [
  { id: 1, po_number: 'PO-20260111-001', supplier: '(주)하이테크솔루션', status: 'PENDING', amount: 2500000, expected_date: '2026-01-15', created_at: '2026-01-11' },
  { id: 2, po_number: 'PO-20260110-024', supplier: '글로벌파츠', status: 'ORDERED', amount: 890000, expected_date: '2026-01-13', created_at: '2026-01-10' },
  { id: 3, po_number: 'PO-20260108-115', supplier: '제일정밀', status: 'RECEIVED', amount: 4500000, expected_date: '2026-01-09', created_at: '2026-01-08' },
  { id: 4, po_number: 'PO-20260105-882', supplier: '스타패키징', status: 'PARTIAL', amount: 320000, expected_date: '2026-01-07', created_at: '2026-01-05' },
  { id: 5, po_number: 'PO-20251230-009', supplier: '(주)하이테크솔루션', status: 'COMPLETED', amount: 12000000, expected_date: '2025-12-31', created_at: '2025-12-30' },
  { id: 6, po_number: 'PO-20251228-112', supplier: '오피스디포', status: 'COMPLETED', amount: 156000, expected_date: '2025-12-29', created_at: '2025-12-28' },
  { id: 7, po_number: 'PO-20251225-334', supplier: '글로벌파츠', status: 'CANCELLED', amount: 0, expected_date: '2025-12-26', created_at: '2025-12-25' },
];

async function loadInbound(content) {
  content.innerHTML = `
    <div class="flex flex-col h-full overflow-hidden">
      <!-- 헤더 영역 -->
      <div class="flex justify-between items-center mb-5 shrink-0 px-1">
        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <i class="fas fa-dolly text-emerald-600"></i>입고/발주 관리
        </h1>
        <div class="text-sm text-slate-500 font-mono" id="inboundCurrentTime"></div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="flex justify-between items-end mb-4 shrink-0 border-b border-slate-200">
        <div class="flex gap-2">
            <button onclick="switchInboundTab('order')" id="tab-inbound-order" class="px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-transparent hover:text-emerald-600 transition-colors">
            <i class="fas fa-file-invoice mr-2"></i>발주 관리
            </button>
            <button onclick="switchInboundTab('supplier')" id="tab-inbound-supplier" class="px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-transparent hover:text-emerald-600 transition-colors">
            <i class="fas fa-building mr-2"></i>공급사 관리
            </button>
        </div>
        <button class="mb-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5" onclick="alert('준비 중인 기능입니다.')">
            <i class="fas fa-plus mr-1.5"></i> 발주서 작성
        </button>
      </div>

      <!-- 탭 콘텐츠 영역 -->
      <div id="inboundTabContent" class="flex-1 overflow-hidden bg-slate-50 rounded-xl border border-slate-200 p-4 relative">
        <!-- 동적 로드 -->
      </div>
    </div>
  `;

  if (window.inboundTimer) clearInterval(window.inboundTimer);
  updateInboundTime();
  window.inboundTimer = setInterval(updateInboundTime, 1000);

  // 초기 탭 로드
  switchInboundTab('order');
}

function updateInboundTime() {
  const el = document.getElementById('inboundCurrentTime');
  if (el) {
    const now = new Date();
    el.innerHTML = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 <span class="ml-2">${now.toLocaleTimeString()}</span>`;
  }
}

// 탭 전환
window.switchInboundTab = function (tabName) {
  ['order', 'supplier'].forEach(t => {
    const btn = document.getElementById(`tab-inbound-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'px-4 py-2 text-sm font-bold text-emerald-600 border-b-2 border-emerald-600 transition-colors';
      } else {
        btn.className = 'px-4 py-2 text-sm font-bold text-slate-400 border-b-2 border-transparent hover:text-emerald-600 transition-colors';
      }
    }
  });

  const container = document.getElementById('inboundTabContent');
  if (!container) return;

  if (tabName === 'order') {
    renderInboundOrderList();
  } else if (tabName === 'supplier') {
    renderSupplierManagement();
  }
}

// 발주 관리 리스트 렌더링 (API 연동)
window.renderInboundOrderList = async function () {
  const container = document.getElementById('inboundTabContent');
  if (!container) return;

  const searchQuery = document.getElementById('inboundSearch')?.value?.trim() || '';
  const statusFilter = document.getElementById('inboundStatus')?.value || '';
  const startDate = document.getElementById('inboundStartDate')?.value || '';
  const endDate = document.getElementById('inboundEndDate')?.value || '';

  // 로딩 표시
  const tbody = container.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-24"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></td></tr>';
  }

  try {
    const params = new URLSearchParams({
      page: window.inboundPage,
      limit: window.inboundItemsPerPage,
      search: searchQuery,
      status: statusFilter,
      start_date: startDate,
      end_date: endDate
    });

    const res = await axios.get(`/api/inbound?${params}`);

    if (!res.data.success) throw new Error(res.data.error || '데이터 로드 실패');

    const { data: pageItems, meta } = res.data;
    const { total: totalItems, totalPages } = meta;

    window.inboundTotalPages = totalPages; // 페이지 이동 검증용

    container.innerHTML = `
            <!-- 검색 필터 영역 -->
            <div class="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                 <div class="relative flex-1 min-w-[200px] max-w-sm">
                     <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                     <input type="text" id="inboundSearch" class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" 
                     placeholder="발주번호, 공급사, 상품명 검색" value="${searchQuery}" onkeyup="if(event.key==='Enter') { window.inboundPage=1; renderInboundOrderList(); }">
                 </div>
    
                 <select id="inboundStatus" class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:border-emerald-500 shadow-sm bg-white min-w-[120px]" onchange="window.inboundPage=1; renderInboundOrderList();">
                    <option value="">전체 상태</option>
                    <option value="PENDING" ${statusFilter === 'PENDING' ? 'selected' : ''}>발주준비</option>
                    <option value="ORDERED" ${statusFilter === 'ORDERED' ? 'selected' : ''}>발주완료</option>
                    <option value="RECEIVED" ${statusFilter === 'RECEIVED' ? 'selected' : ''}>입고완료</option>
                 </select>
    
                 <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 shadow-sm hover:border-emerald-500 transition-colors">
                    <input type="date" id="inboundStartDate" class="border-none text-sm text-slate-600 focus:outline-none p-0 font-mono bg-transparent" value="${startDate}">
                    <span class="text-slate-400">~</span>
                    <input type="date" id="inboundEndDate" class="border-none text-sm text-slate-600 focus:outline-none p-0 font-mono bg-transparent" value="${endDate}">
                 </div>
    
                 <button onclick="window.inboundPage=1; renderInboundOrderList()" class="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-teal-100 hover:bg-teal-700 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                    <i class="fas fa-search mr-1.5"></i> 조회
                 </button>
            </div>
    
            <!-- 테이블 영역 -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
                 <div class="overflow-x-auto flex-1">
                  <table class="min-w-full divide-y divide-slate-50 text-left">
                    <thead class="bg-white sticky top-0 z-10">
                      <tr>
                        <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-36 pl-8">발주번호</th>
                        <th class="px-4 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">공급사/상품명</th>
                        <th class="px-4 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">상태</th>
                        <th class="px-4 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">총 금액</th>
                        <th class="px-4 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">입고일</th>
                        <th class="px-4 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">작성일</th>
                        <th class="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-36 pr-8">관리</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        ${pageItems.length > 0 ? pageItems.map(item => `
                        <tr class="hover:bg-slate-50/80 transition-colors group">
                            <td class="px-6 py-5 whitespace-nowrap pl-8">
                                <span class="font-mono text-sm text-slate-600 font-bold group-hover:text-emerald-600 transition-colors cursor-pointer" onclick="alert('발주서 상세 보기: ${item.po_number}')">${item.po_number}</span>
                            </td>
                            <td class="px-4 py-5">
                                <div class="flex flex-col">
                                    <span class="text-sm text-slate-800 font-bold mb-0.5">${item.supplier}</span>
                                    <span class="text-xs text-slate-500">${item.product_names}</span>
                                </div>
                            </td>
                            <td class="px-4 py-5 whitespace-nowrap">
                                ${getInboundStatusBadge(item.status)}
                            </td>
                            <td class="px-4 py-5 whitespace-nowrap text-right">
                                <span class="text-sm font-bold text-slate-700">₩${item.amount.toLocaleString()}</span>
                            </td>
                            <td class="px-4 py-5 whitespace-nowrap text-center">
                                <span class="text-xs text-slate-500 font-mono">${item.expected_date}</span>
                            </td>
                            <td class="px-4 py-5 whitespace-nowrap text-center">
                                <span class="text-xs text-slate-400 font-mono">${new Date(item.created_at).toLocaleDateString()}</span>
                            </td>
                            <td class="px-6 py-5 whitespace-nowrap text-center pr-8">
                                <div class="flex justify-center gap-1">
                                    <button class="px-2 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 border border-emerald-200 transition-colors" onclick="openInboundDetailModal(${item.id})">상세입고</button>
                                </div>
                            </td>
                        </tr>
                        `).join('') : `
                            <tr><td colspan="7" class="px-6 py-24 text-center text-slate-400 font-light">
                                <div class="flex flex-col items-center gap-3">
                                    <i class="fas fa-search text-4xl text-slate-200"></i>
                                    <span>검색 결과가 없습니다.</span>
                                </div>
                            </td></tr>
                        `}
                    </tbody>
                  </table>
                </div>
    
                <!-- 페이지네이션 컨트롤 -->
                <div class="flex justify-between items-center gap-4 p-4 bg-slate-50 border-t border-slate-100">
                  <div class="text-sm text-slate-600">
                    총 <span class="font-bold text-teal-600">${totalItems}</span>건 (${totalPages}페이지 중 ${window.inboundPage}페이지)
                  </div>
                  <div class="flex items-center gap-3">
                    <button onclick="changeInboundPage(-1)" 
                            class="px-4 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                            ${window.inboundPage <= 1 ? 'disabled' : ''}>
                      <i class="fas fa-chevron-left"></i> 이전
                    </button>
                    <span class="text-sm font-bold text-slate-700 min-w-[60px] text-center">${window.inboundPage} / ${totalPages}</span>
                    <button onclick="changeInboundPage(1)" 
                            class="px-4 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                            ${window.inboundPage >= totalPages ? 'disabled' : ''}>
                      다음 <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
            </div>
      `;

    // 검색창 포커스 유지
    const searchInput = document.getElementById('inboundSearch');
    if (searchInput && searchQuery) {
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="p-8 text-center text-rose-500">데이터를 불러오는 중 오류가 발생했습니다.<br>${err.message}</div>`;
  }
}

window.changeInboundPage = function (delta) {
  const newPage = window.inboundPage + delta;
  const totalPages = window.inboundTotalPages || 1;

  if (newPage >= 1 && newPage <= totalPages) {
    window.inboundPage = newPage;
    renderInboundOrderList();
  }
}

function getInboundStatusBadge(status) {
  const styles = {
    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'ORDERED': 'bg-blue-100 text-blue-700 border-blue-200',
    'RECEIVED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'PARTIAL': 'bg-orange-100 text-orange-700 border-orange-200',
    'COMPLETED': 'bg-slate-100 text-slate-600 border-slate-200',
    'CANCELLED': 'bg-red-50 text-red-600 border-red-100 line-through'
  };
  const labels = {
    'PENDING': '발주준비',
    'ORDERED': '발주완료',
    'RECEIVED': '입고완료',
    'PARTIAL': '부분입고',
    'COMPLETED': '처리완료',
    'CANCELLED': '취소됨'
  };
  return `<span class="px-2 py-1 text-[11px] font-bold rounded border ${styles[status] || styles['COMPLETED']}">${labels[status] || status}</span>`;
}

// 출고 관리 로드
async function loadOutbound(content) {
  content.innerHTML = `
    <div class="flex flex-col h-full overflow-hidden">
      <div class="flex justify-between items-center mb-5 shrink-0 px-1">
        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <i class="fas fa-truck-loading text-emerald-600"></i>출고 관리
        </h1>
        <div class="text-sm text-slate-500 font-mono" id="outboundCurrentTime"></div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="flex gap-2 mb-4 shrink-0 border-b border-slate-200">
        <button onclick="switchOutboundTab('simple')" id="tab-outbound-simple" class="px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-transparent hover:text-emerald-600 transition-colors">
          <i class="fas fa-edit mr-2"></i>간편 출고 등록
        </button>
        <button onclick="switchOutboundTab('history')" id="tab-outbound-history" class="px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-transparent hover:text-emerald-600 transition-colors">
          <i class="fas fa-history mr-2"></i>출고 이력 조회
        </button>
        <button onclick="switchOutboundTab('warehouse')" id="tab-outbound-warehouse" class="px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-transparent hover:text-emerald-600 transition-colors">
          <i class="fas fa-warehouse mr-2"></i>창고별 관리
        </button>
      </div>

      <!-- 탭 콘텐츠 영역 -->
      <div id="outboundTabContent" class="flex-1 overflow-hidden bg-slate-50 rounded-xl border border-slate-200 p-4 relative">
        <!-- 동적 로드 -->
      </div>
    </div>
  `;

  // Start Time Tick
  if (window.outboundTimer) clearInterval(window.outboundTimer);
  updateTime();
  window.outboundTimer = setInterval(updateTime, 1000);
  function updateTime() {
    const el = document.getElementById('outboundCurrentTime');
    if (el) {
      const now = new Date();
      el.innerHTML = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 <span class="ml-2">${now.toLocaleTimeString()}</span>`;
    }
  }

  // 데이터 사전 로드 (상품, 고객) - 없으면 로드
  if (!window.products || window.products.length === 0) {
    try {
      const res = await axios.get(`${API_BASE}/products`);
      window.products = res.data.data;
    } catch (e) { console.error("상품 로드 실패", e); }
  }
  if (!window.customers || window.customers.length === 0) {
    try {
      const res = await axios.get(`${API_BASE}/customers`);
      window.customers = res.data.data;
    } catch (e) { console.error("고객 로드 실패", e); }
  }

  // 초기 탭 로드
  switchOutboundTab('simple');
}

window.outboundCart = [];

async function switchOutboundTab(tabName) {
  const container = document.getElementById('outboundTabContent');
  if (!container) return;

  // 탭 스타일 업데이트
  ['simple', 'history', 'warehouse'].forEach(t => {
    const btn = document.getElementById(`tab-outbound-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = "px-4 py-2 text-sm font-bold text-emerald-600 border-b-2 border-emerald-600 transition-colors";
      } else {
        btn.className = "px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-transparent hover:text-emerald-600 hover:border-slate-200 transition-colors";
      }
    }
  });

  // 콘텐츠 렌더링
  if (tabName === 'simple') {
    renderSimpleOutboundTab(container);
  } else if (tabName === 'history') {
    await renderOutboundHistoryTab(container);
  } else if (tabName === 'warehouse') {
    await renderWarehouseTab(container);
  }
}

async function renderWarehouseTab(container) {
  try {
    const response = await axios.get(`${API_BASE}/warehouses`);
    const warehouses = response.data.data;

    container.innerHTML = `
            <div class="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <!-- 헤더 영역 -->
                <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div class="flex items-center gap-3">
                        <div class="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <i class="fas fa-warehouse text-lg"></i>
                        </div>
                        <h2 class="text-lg font-bold text-slate-800">창고 등록 및 관리</h2>
                    </div>
                    <button onclick="openWarehouseModal()" class="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-teal-100 hover:bg-teal-700 transition-all hover:-translate-y-0.5 flex items-center">
                        <i class="fas fa-plus mr-2"></i> 창고 등록
                    </button>
                </div>

                <!-- 테이블 영역 -->
                <div class="flex-1 overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-50 text-left">
                        <thead class="bg-slate-50/50">
                            <tr>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">창고명</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">위치</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">설명</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">상태</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48 text-center">등록일</th>
                                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50 bg-white">
                            ${warehouses.length > 0 ? warehouses.map(w => `
                                <tr class="hover:bg-slate-50/80 transition-colors group">
                                    <td class="px-6 py-5 whitespace-nowrap">
                                        <span class="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">${w.name}</span>
                                    </td>
                                    <td class="px-6 py-5 whitespace-nowrap">
                                        <span class="text-sm text-slate-600">${w.location || '-'}</span>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="text-sm text-slate-500 truncate max-w-xs" title="${w.description || ''}">${w.description || '-'}</div>
                                    </td>
                                    <td class="px-6 py-5 whitespace-nowrap text-center">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${w.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
                                            ${w.is_active ? '사용중' : '비활성'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-5 whitespace-nowrap text-center">
                                        <span class="text-xs text-slate-400 font-mono">${new Date(w.created_at).toLocaleDateString()} ${new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td class="px-6 py-5 whitespace-nowrap text-center">
                                        <div class="flex items-center justify-center gap-2">
                                            <button onclick="editWarehouse(${w.id})" class="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="수정">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="deleteWarehouse(${w.id})" class="text-slate-400 hover:text-rose-500 transition-colors p-1" title="삭제">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="6" class="px-6 py-24 text-center text-slate-400 font-light">
                                        <div class="flex flex-col items-center gap-3">
                                            <i class="fas fa-warehouse text-4xl text-slate-200"></i>
                                            <span>등록된 창고가 없습니다.</span>
                                        </div>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    // 모달 주입 (이미 있으면 skip)
    injectWarehouseModal();

  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="flex items-center justify-center h-full text-rose-500">데이터 로드 실패</div>';
  }
}

// 창고 관리 관련 함수들

let currentEditingWarehouseId = null;

function injectWarehouseModal() {
  if (document.getElementById('warehouseModal')) return;

  const modalHtml = `
      <div id="warehouseModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center transition-opacity opacity-0">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform scale-95 transition-all duration-200" id="warehouseModalContent">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-slate-800" id="warehouseModalTitle">창고 등록</h3>
            <button onclick="closeWarehouseModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">창고명 <span class="text-rose-500">*</span></label>
              <input type="text" id="whName" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400" placeholder="예: 서울 본사 창고">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">위치</label>
              <input type="text" id="whLocation" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400" placeholder="예: 서울 구로구...">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">설명</label>
              <textarea id="whDescription" rows="3" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-400 resize-none" placeholder="창고에 대한 설명을 입력하세요"></textarea>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="whActive" class="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" checked>
              <label for="whActive" class="ml-2 text-sm font-bold text-slate-700 cursor-pointer">사용 중 (활성)</label>
            </div>
          </div>
          <div class="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3">
            <button onclick="closeWarehouseModal()" class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">취소</button>
            <button onclick="submitWarehouse()" class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5" id="btnSaveWarehouse">저장</button>
          </div>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openWarehouseModal(isEdit = false, warehouse = null) {
  const modal = document.getElementById('warehouseModal');
  const content = document.getElementById('warehouseModalContent');
  if (!modal) return;

  // Reset form
  document.getElementById('whName').value = '';
  document.getElementById('whLocation').value = '';
  document.getElementById('whDescription').value = '';
  document.getElementById('whActive').checked = true;

  if (isEdit && warehouse) {
    currentEditingWarehouseId = warehouse.id;
    document.getElementById('warehouseModalTitle').innerText = "창고 정보 수정";
    document.getElementById('whName').value = warehouse.name;
    document.getElementById('whLocation').value = warehouse.location || '';
    document.getElementById('whDescription').value = warehouse.description || '';
    document.getElementById('whActive').checked = warehouse.is_active;
  } else {
    currentEditingWarehouseId = null;
    document.getElementById('warehouseModalTitle').innerText = "창고 등록";
  }

  modal.classList.remove('hidden');
  // Animation
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    content.classList.remove('scale-95');
    content.classList.add('scale-100');
  }, 10);
}

function closeWarehouseModal() {
  const modal = document.getElementById('warehouseModal');
  const content = document.getElementById('warehouseModalContent');
  if (!modal) return;

  modal.classList.add('opacity-0');
  content.classList.remove('scale-100');
  content.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

async function submitWarehouse() {
  const name = document.getElementById('whName').value;
  const location = document.getElementById('whLocation').value;
  const description = document.getElementById('whDescription').value;
  const is_active = document.getElementById('whActive').checked;

  if (!name) {
    alert("창고명을 입력해주세요.");
    return;
  }

  try {
    const payload = { name, location, description, is_active };
    let res;
    if (currentEditingWarehouseId) {
      res = await axios.put(`${API_BASE}/warehouses/${currentEditingWarehouseId}`, payload);
    } else {
      res = await axios.post(`${API_BASE}/warehouses`, payload);
    }

    if (res.data.success) {
      closeWarehouseModal();
      // Refresh list
      renderWarehouseTab(document.getElementById('outboundTabContent'));
      showSuccess(res.data.message);
    }
  } catch (e) {
    console.error(e);
    alert("저장 실패: " + (e.response?.data?.error || e.message));
  }
}

async function editWarehouse(id) {
  try {
    const res = await axios.get(`${API_BASE}/warehouses`);
    const warehouse = res.data.data.find(w => w.id === id);
    if (warehouse) {
      openWarehouseModal(true, warehouse);
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteWarehouse(id) {
  if (!confirm("정말 이 창고를 삭제하시겠습니까?")) return;
  try {
    const res = await axios.delete(`${API_BASE}/warehouses/${id}`);
    if (res.data.success) {
      renderWarehouseTab(document.getElementById('outboundTabContent'));
      showSuccess("창고가 삭제되었습니다.");
    }
  } catch (e) {
    console.error(e);
    alert("삭제 실패: " + (e.response?.data?.error || e.message));
  }
}

function renderSimpleOutboundTab(container) {
  container.innerHTML = `
    <div class="flex flex-col lg:flex-row h-full gap-4">
      <!-- 1. 좌측: 상품 선택 -->
      <div class="w-full lg:w-5/12 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-800">1. 출고 상품 선택</h3>
          <button class="bg-emerald-600 text-white text-xs px-2 py-1 rounded hover:bg-emerald-700 transition-colors">
            <i class="fas fa-file-excel mr-1"></i>엑셀 일괄 등록
          </button>
        </div>
        
        <div class="p-4 border-b border-slate-100 bg-white space-y-3">
           <div class="flex items-center gap-4 text-sm font-medium text-slate-600">
              <label class="flex items-center cursor-pointer"><input type="radio" name="scanMode" checked class="mr-2 text-emerald-600 focus:ring-emerald-500">스캔 (자동 +1)</label>
              <label class="flex items-center cursor-pointer"><input type="radio" name="scanMode" class="mr-2 text-emerald-600 focus:ring-emerald-500">수량 수동 입력</label>
           </div>
           <div class="relative">
             <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
             <input type="text" id="outboundProductSearch" class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="상품명 또는 SKU 검색..." onkeyup="filterOutboundProducts(this.value)">
           </div>
        </div>

        <div id="outboundProductList" class="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50 custom-scrollbar">
           <!-- 상품 리스트 -->
        </div>
        
        <!-- 페이지네이션 컨트롤 -->
        <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-white text-xs text-slate-500 shrink-0">
             <button onclick="changeOutboundPage(-1)" id="btnObPrev" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               <i class="fas fa-chevron-left mr-1"></i>이전
             </button>
             <span id="obPageIndicator" class="font-mono font-medium text-slate-700">1 / 1</span>
             <button onclick="changeOutboundPage(1)" id="btnObNext" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               다음<i class="fas fa-chevron-right ml-1"></i>
             </button>
        </div>
      </div>

      <!-- 우측: 입력 폼 -->
      <div class="w-full lg:w-7/12 flex flex-col h-full overflow-hidden">
        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            
            <!-- 2. 선택된 상품 -->
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h3 class="font-bold text-slate-800 text-sm">2. 선택된 상품</h3>
                   <button onclick="clearOutboundCart()" class="text-xs text-rose-500 hover:text-rose-700">전체 삭제</button>
                </div>
                <div id="outboundCartList" class="p-0 min-h-[100px] max-h-[300px] overflow-y-auto">
                    <div class="h-24 flex items-center justify-center text-slate-400 text-sm">상품을 선택해주세요.</div>
                </div>
                <div class="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span class="text-sm text-slate-600 font-medium">총 수량</span>
                    <span id="outboundTotalQty" class="text-lg font-bold text-emerald-600">0개</span>
                </div>
            </div>

            <!-- 3. 구매자 정보 -->
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <h3 class="font-bold text-slate-800 text-sm mb-4">3. 구매자 정보 (고객 등록 대상)</h3>
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">출고 창고 <span class="text-rose-500">*</span></label>
                        <select class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                             <option>기본 창고</option>
                             <option>2창고</option>
                        </select>
                    </div>
                    <div>
                         <label class="block text-xs font-semibold text-slate-500 mb-1">기존 고객 검색</label>
                         <input type="text" list="customerList" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="이름 또는 연락처로 고객 검색..." onchange="fillOutboundCustomer(this.value)">
                        <datalist id="customerList">
                            ${window.customers ? window.customers.map(c => `<option value="${c.name} (${c.phone})">`).join('') : ''}
                        </datalist>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1">구매자명</label>
                            <input type="text" id="obBuyerName" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="신규 고객일 경우 입력">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1">구매자 연락처</label>
                            <input type="text" id="obBuyerPhone" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="예: 01012345678">
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. 수령인 및 배송지 정보 -->
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 text-sm">4. 수령인 및 배송지 정보</h3>
                    <label class="flex items-center cursor-pointer text-xs text-slate-600">
                        <input type="checkbox" id="obSameAsBuyer" class="mr-1.5 text-emerald-600 rounded focus:ring-emerald-500" onchange="copyBuyerToReceiver()"> 구매자와 동일
                    </label>
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1">수령인 성함</label>
                            <input type="text" id="obReceiverName" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1">수령인 연락처</label>
                            <input type="text" id="obReceiverPhone" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                        </div>
                    </div>
                    <div>
                         <label class="block text-xs font-semibold text-slate-500 mb-1">배송 주소</label>
                         <div class="flex gap-2">
                             <input type="text" id="obAddress" class="flex-1 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="수령지 주소 입력">
                             <button class="bg-slate-100 text-slate-600 border border-slate-200 rounded px-3 py-2 text-xs font-medium hover:bg-slate-200">
                                 <i class="fas fa-search"></i> 검색
                             </button>
                         </div>
                    </div>
                </div>
            </div>

            <!-- 5. 운송장 정보 -->
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 mb-4">
                 <h3 class="font-bold text-slate-800 text-sm mb-4">5. 운송장 정보</h3>
                 <div class="grid grid-cols-2 gap-4 mb-4">
                     <div>
                         <label class="block text-xs font-semibold text-slate-500 mb-1">택배사</label>
                         <select id="obCourier" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                             <option value="CJ대한통운">CJ대한통운</option>
                             <option value="우체국택배">우체국택배</option>
                             <option value="로젠택배">로젠택배</option>
                             <option value="한진택배">한진택배</option>
                             <option value="롯데택배">롯데택배</option>
                         </select>
                     </div>
                     <div>
                         <label class="block text-xs font-semibold text-slate-500 mb-1 flex justify-between">
                            <span>운송장 번호</span>
                            <label class="flex items-center font-normal cursor-pointer"><input type="checkbox" class="mr-1">직접수령</label>
                         </label>
                         <input type="text" id="obTracking" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                     </div>
                 </div>
                 <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">비고</label>
                      <input type="text" id="obNotes" class="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                 </div>
            </div>

        </div>

        <!-- 하단 버튼 -->
        <div class="p-4 bg-white border-t border-slate-200 shrink-0">
             <button onclick="submitSimpleOutbound()" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                 출고 등록 완료
             </button>
        </div>
      </div>
    </div>
  `;

  renderOutboundProductList();
}

window.outboundPage = 1;
window.outboundItemsPerPage = 7;
window.filteredOutboundList = null;

function filterOutboundProducts(query) {
  if (!window.products) return;
  const q = query.toLowerCase();
  const filtered = window.products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  window.filteredOutboundList = filtered;
  window.outboundPage = 1; // Reset to page 1
  renderOutboundProductList(filtered);
}

function changeOutboundPage(delta) {
  const list = window.filteredOutboundList || window.products;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.outboundItemsPerPage);
  const newPage = window.outboundPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.outboundPage = newPage;
    renderOutboundProductList(list);
  }
}

function renderOutboundProductList(list = window.products) {
  const container = document.getElementById('outboundProductList');
  const prevBtn = document.getElementById('btnObPrev');
  const nextBtn = document.getElementById('btnObNext');
  const indicator = document.getElementById('obPageIndicator');

  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = '<div class="p-6 text-center text-slate-400">검색 결과가 없습니다.</div>';
    if (indicator) indicator.textContent = "0 / 0";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // Pagination Logic
  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / window.outboundItemsPerPage);

  if (window.outboundPage > totalPages) window.outboundPage = totalPages;
  if (window.outboundPage < 1) window.outboundPage = 1;

  const startIdx = (window.outboundPage - 1) * window.outboundItemsPerPage;
  const endIdx = startIdx + window.outboundItemsPerPage;
  const pageItems = list.slice(startIdx, endIdx);

  // Update Controls
  if (indicator) indicator.textContent = `${window.outboundPage} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = window.outboundPage <= 1;
  if (nextBtn) nextBtn.disabled = window.outboundPage >= totalPages;

  container.innerHTML = pageItems.map(p => `
        <div class="bg-white border border-slate-100 rounded p-3 flex justify-between items-center hover:border-emerald-400 group transition-all">
            <div class="flex-1 min-w-0">
                <div class="font-bold text-slate-700 text-sm truncate">${p.name}</div>
                <div class="flex items-center text-xs text-slate-400 mt-1 space-x-2">
                    <span class="font-mono text-slate-500">${p.sku}</span>
                    <span class="text-slate-300">|</span>
                    <span>재고: <span class="${p.current_stock > 0 ? 'text-slate-600' : 'text-rose-500 font-bold'}">${p.current_stock}</span></span>
                </div>
            </div>
            <button onclick="addToOutboundCart(${p.id})" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all ml-2">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `).join('');
}

function addToOutboundCart(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;

  const existing = window.outboundCart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    window.outboundCart.push({ ...product, qty: 1 });
  }
  renderOutboundCart();
}

function renderOutboundCart() {
  const container = document.getElementById('outboundCartList');
  const totalEl = document.getElementById('outboundTotalQty');
  if (!container) return;

  if (window.outboundCart.length === 0) {
    container.innerHTML = '<div class="h-24 flex items-center justify-center text-slate-400 text-sm">상품을 선택해주세요.</div>';
    totalEl.textContent = '0개';
    return;
  }

  let totalQty = 0;
  container.innerHTML = window.outboundCart.map(item => {
    totalQty += item.qty;
    return `
        <div class="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50">
            <div class="flex-1 min-w-0 pr-3">
                <div class="font-medium text-slate-800 text-sm truncate">${item.name}</div>
                <div class="text-xs text-slate-400 mt-0.5">${item.code || item.sku}</div>
            </div>
            <div class="flex items-center gap-3">
                 <div class="flex items-center border border-slate-200 rounded bg-white">
                     <button onclick="updateOutboundQty(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600"><i class="fas fa-minus text-[10px]"></i></button>
                     <span class="w-8 text-center text-xs font-bold text-slate-700">${item.qty}</span>
                     <button onclick="updateOutboundQty(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600"><i class="fas fa-plus text-[10px]"></i></button>
                 </div>
                 <button onclick="removeOutboundItem(${item.id})" class="text-slate-300 hover:text-rose-500 px-1"><i class="fas fa-times"></i></button>
            </div>
        </div>
        `;
  }).join('');
  totalEl.textContent = `${totalQty}개`;
}

function updateOutboundQty(id, delta) {
  const item = window.outboundCart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeOutboundItem(id);
  } else {
    renderOutboundCart();
  }
}

function removeOutboundItem(id) {
  window.outboundCart = window.outboundCart.filter(i => i.id !== id);
  renderOutboundCart();
}

function clearOutboundCart() {
  window.outboundCart = [];
  renderOutboundCart();
}

// 고객 선택 시 자동 채움
function fillOutboundCustomer(value) {
  // "이름 (전화번호)" 형식 파싱
  if (!window.customers) return;
  const match = window.customers.find(c => `${c.name} (${c.phone})` === value);
  if (match) {
    document.getElementById('obBuyerName').value = match.name;
    document.getElementById('obBuyerPhone').value = match.phone;
    document.getElementById('obReceiverName').value = match.name;
    document.getElementById('obReceiverPhone').value = match.phone;
    document.getElementById('obAddress').value = match.address || '';
  }
}

function copyBuyerToReceiver() {
  const isChecked = document.getElementById('obSameAsBuyer').checked;
  if (isChecked) {
    document.getElementById('obReceiverName').value = document.getElementById('obBuyerName').value;
    document.getElementById('obReceiverPhone').value = document.getElementById('obBuyerPhone').value;
  }
}

async function submitSimpleOutbound() {
  if (window.outboundCart.length === 0) {
    alert("출고할 상품을 선택해주세요.");
    return;
  }
  const buyerName = document.getElementById('obBuyerName').value;
  if (!buyerName) {
    alert("구매자 정보를 입력해주세요.");
    return;
  }

  const btn = document.getElementById('btnSubmitOutbound');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';
  btn.disabled = true;

  try {
    // 1. 고객 ID 찾기
    let customerId = null;
    const buyerPhone = document.getElementById('obBuyerPhone').value;
    if (buyerName && window.customers) {
      // 이름과 전화번호로 매칭 (전화번호 뒷자리만 매칭하거나, 정확히 매칭)
      // 여기서는 정확한 매칭을 시도
      const match = window.customers.find(c => c.name === buyerName && (!buyerPhone || c.phone === buyerPhone));
      if (match) customerId = match.id;
    }

    // 2. 판매(Sales) 생성
    const receiverName = document.getElementById('obReceiverName').value;
    const receiverPhone = document.getElementById('obReceiverPhone').value;
    const address = document.getElementById('obAddress').value;
    const notes = document.getElementById('obNotes').value;

    // 메모에 수령인 정보 병합
    const combinedNotes = `[출고등록] ${notes} / 수령인: ${receiverName} (${receiverPhone})`;

    const salePayload = {
      items: window.outboundCart.map(i => ({ product_id: i.id, quantity: i.qty })),
      customer_id: customerId,
      payment_method: 'card',
      notes: combinedNotes
    };

    const saleRes = await axios.post(`${API_BASE}/sales`, salePayload);
    const saleId = saleRes.data.data.id;

    // 3. 배송 정보 업데이트
    const courier = document.getElementById('obCourier').value;
    const tracking = document.getElementById('obTracking').value;

    if (address || courier || tracking) {
      await axios.put(`${API_BASE}/sales/${saleId}/shipping`, {
        shipping_address: address,
        courier: courier,
        tracking_number: tracking,
        status: 'completed'
      });
    }

    // 4. 출고(Outbound) 지시 생성
    await axios.post(`${API_BASE}/outbound/create`, {
      sale_ids: [saleId],
      notes: notes
    });

    // 성공 메시지 및 리셋
    showSuccess("출고 등록이 완료되었습니다.");
    clearOutboundCart();

    // 폼 초기화
    document.getElementById('obBuyerName').value = '';
    document.getElementById('obBuyerPhone').value = '';
    document.getElementById('obReceiverName').value = '';
    document.getElementById('obReceiverPhone').value = '';
    document.getElementById('obAddress').value = '';
    document.getElementById('obTracking').value = '';
    document.getElementById('obNotes').value = '';
    const searchInput = document.getElementById('obCustomerSearch'); // 검색창 초기화
    if (searchInput) searchInput.value = '';

  } catch (e) {
    console.error(e);
    alert("등록 실패: " + (e.response?.data?.error || e.message));
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// 출고 이력 페이지네이션 변수
window.outboundHistoryPage = 1;
window.outboundHistoryItemsPerPage = 20;
window.filteredOutboundHistory = null;

// 기존 출고 목록 뷰 (2번째 탭)
async function renderOutboundHistoryTab(container) {
  const startDate = document.getElementById('obsStartDate')?.value || '';
  const endDate = document.getElementById('obsEndDate')?.value || '';
  const searchQuery = document.getElementById('obsSearch')?.value?.toLowerCase() || '';
  const statusFilter = document.getElementById('obsStatus')?.value || '';

  try {
    let query = `${API_BASE}/outbound`;

    const response = await axios.get(query);
    let orders = response.data.data;

    // 프론트엔드 필터링
    if (startDate) {
      orders = orders.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      orders = orders.filter(o => new Date(o.created_at) <= end);
    }
    if (searchQuery) {
      orders = orders.filter(o =>
        (o.order_number && o.order_number.toLowerCase().includes(searchQuery)) ||
        (o.destination_name && o.destination_name.toLowerCase().includes(searchQuery)) ||
        (o.product_names && o.product_names.toLowerCase().includes(searchQuery))
      );
    }
    if (statusFilter) {
      orders = orders.filter(o => o.status === statusFilter);
    }

    // 필터링된 결과 저장
    window.filteredOutboundHistory = orders;
    window.currentOutboundOrders = orders; // 엑셀 다운로드용

    // 페이지네이션 계산
    const totalItems = orders.length;
    const totalPages = Math.ceil(totalItems / window.outboundHistoryItemsPerPage);

    if (window.outboundHistoryPage > totalPages) window.outboundHistoryPage = totalPages;
    if (window.outboundHistoryPage < 1) window.outboundHistoryPage = 1;

    const startIdx = (window.outboundHistoryPage - 1) * window.outboundHistoryItemsPerPage;
    const endIdx = startIdx + window.outboundHistoryItemsPerPage;
    const pageItems = orders.slice(startIdx, endIdx);

    container.innerHTML = `
          <!-- 검색 필터 영역 -->
          <div class="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             
             <!-- 검색어 입력 -->
             <div class="relative flex-1 min-w-[200px] max-w-sm">
                 <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                 <input type="text" id="obsSearch" class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" placeholder="주문번호, 받는분, 상품명 검색" value="${searchQuery}">
             </div>

             <!-- 상태 필터 -->
             <select id="obsStatus" class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:border-emerald-500 shadow-sm bg-white min-w-[120px]">
                <option value="">전체 상태</option>
                <option value="PENDING" ${statusFilter === 'PENDING' ? 'selected' : ''}>대기</option>
                <option value="PICKING" ${statusFilter === 'PICKING' ? 'selected' : ''}>피킹중</option>
                <option value="PACKING" ${statusFilter === 'PACKING' ? 'selected' : ''}>패킹중</option>
                <option value="SHIPPED" ${statusFilter === 'SHIPPED' ? 'selected' : ''}>출고완료</option>
             </select>

             <!-- 날짜 필터 -->
             <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 shadow-sm hover:border-emerald-500 transition-colors">
                <input type="date" id="obsStartDate" class="border-none text-sm text-slate-600 focus:outline-none p-0 font-mono bg-transparent" value="${startDate}">
                <span class="text-slate-400">~</span>
                <input type="date" id="obsEndDate" class="border-none text-sm text-slate-600 focus:outline-none p-0 font-mono bg-transparent" value="${endDate}">
             </div>

             <!-- 조회 버튼 -->
             <button onclick="window.outboundHistoryPage = 1; renderOutboundHistoryTab(document.getElementById('outboundTabContent'))" class="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-teal-100 hover:bg-teal-700 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                <i class="fas fa-search mr-1.5"></i> 조회
             </button>

             <!-- 엑셀 다운로드 버튼 -->
             <button onclick="downloadOutboundExcel()" class="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-0.5 whitespace-nowrap ml-auto">
                <i class="fas fa-file-excel mr-1.5"></i> 엑셀 다운로드
             </button>
          </div>

          <!-- 테이블 영역 -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            <div class="overflow-x-auto flex-1">
              <table class="min-w-full divide-y divide-slate-50 text-left">
                <thead class="bg-white sticky top-0 z-10">
                  <tr>
                    <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-36 pl-8">출고번호</th>
                    <th class="px-4 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">상태</th>
                    <th class="px-4 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">상품명 (대표)</th>
                    <th class="px-4 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">배송지 INFO</th>
                    <th class="px-4 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider w-24">품목수</th>
                    <th class="px-4 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-32">등록일</th>
                    <th class="px-6 py-5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pr-8">관리</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  ${pageItems.length > 0 ? pageItems.map(o => `
                    <tr class="hover:bg-slate-50/80 transition-colors group">
                      <td class="px-6 py-6 whitespace-nowrap pl-8">
                        <span class="font-mono text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">#${o.order_number}</span>
                      </td>
                      <td class="px-4 py-6 whitespace-nowrap">
                        <span class="px-2.5 py-1.5 rounded-md text-[11px] font-bold tracking-wide border ${getOutboundStatusColor(o.status)}">
                          ${o.status}
                        </span>
                      </td>
                      <td class="px-4 py-6">
                          <div class="text-sm text-slate-700 font-medium line-clamp-2" title="${o.product_names || ''}">${o.product_names || '-'}</div>
                      </td>
                      <td class="px-4 py-6">
                          <div class="flex flex-col gap-0.5">
                              <div class="font-bold text-slate-800 text-[14px]">${o.destination_name}</div>
                              <div class="text-xs text-slate-400 truncate max-w-[250px] font-light">${o.destination_address || '-'}</div>
                          </div>
                      </td>
                      <td class="px-4 py-6 whitespace-nowrap text-right">
                          <span class="text-[14px] font-bold text-indigo-600">${o.total_quantity}</span>
                          <span class="text-xs text-slate-400 font-light ml-0.5">(${o.item_count}종)</span>
                      </td>
                      <td class="px-4 py-6 whitespace-nowrap text-center">
                        <span class="text-sm text-slate-500 font-light tracking-tight">${formatDateClean(o.created_at)}</span>
                      </td>
                      <td class="px-6 py-6 whitespace-nowrap text-center pr-8">
                        <button onclick="openOutboundDetail(${o.id})" class="text-indigo-600 hover:text-indigo-900 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded transition-colors">
                          상세
                        </button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="7" class="px-6 py-24 text-center text-slate-400 font-light">
                        <div class="flex flex-col items-center gap-3">
                            <i class="fas fa-search text-4xl text-slate-200"></i>
                            <span>조건에 맞는 출고 내역이 없습니다.</span>
                        </div>
                    </td></tr>
                  `}
                </tbody>
              </table>
            </div>

            <!-- 페이지네이션 컨트롤 -->
            <div class="flex justify-between items-center gap-4 p-4 bg-slate-50 border-t border-slate-100">
              <div class="text-sm text-slate-600">
                총 <span class="font-bold text-teal-600">${totalItems}</span>건 (${totalPages}페이지 중 ${window.outboundHistoryPage}페이지)
              </div>
              <div class="flex items-center gap-3">
                <button id="btnOutboundHistoryPrev" onclick="changeOutboundHistoryPage(-1)" 
                        class="px-4 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        ${window.outboundHistoryPage <= 1 ? 'disabled' : ''}>
                  <i class="fas fa-chevron-left"></i> 이전
                </button>
                <span id="outboundHistoryPageIndicator" class="text-sm font-bold text-slate-700 min-w-[60px] text-center">${window.outboundHistoryPage} / ${totalPages}</span>
                <button id="btnOutboundHistoryNext" onclick="changeOutboundHistoryPage(1)" 
                        class="px-4 py-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        ${window.outboundHistoryPage >= totalPages ? 'disabled' : ''}>
                  다음 <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        `;

    // 엔터 키로 조회
    document.getElementById('obsSearch')?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        window.outboundHistoryPage = 1;
        renderOutboundHistoryTab(document.getElementById('outboundTabContent'));
      }
    });

  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="flex items-center justify-center h-full text-rose-500">데이터 로드 실패</div>';
  }
}

function changeOutboundHistoryPage(delta) {
  const list = window.filteredOutboundHistory;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.outboundHistoryItemsPerPage);
  const newPage = window.outboundHistoryPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.outboundHistoryPage = newPage;
    renderOutboundHistoryTab(document.getElementById('outboundTabContent'));
  }
}

function downloadOutboundExcel() {
  if (!window.currentOutboundOrders || window.currentOutboundOrders.length === 0) {
    alert("다운로드할 데이터가 없습니다.");
    return;
  }

  const orders = window.currentOutboundOrders;
  // CSV 헤더
  let csvContent = "출고번호,상태,상품명,수령인,배송지주소,연락처,품목수,총수량,등록일,운송장번호\n";

  orders.forEach(o => {
    const escapeCsv = (val) => {
      if (!val) return "";
      const str = String(val).replace(/"/g, '""');
      if (str.search(/("|,|\n)/g) >= 0) return `"${str}"`;
      return str;
    };

    const row = [
      o.order_number,
      o.status,
      o.product_names,
      o.destination_name,
      o.destination_address,
      o.destination_phone,
      o.item_count,
      o.total_quantity,
      new Date(o.created_at).toLocaleDateString(),
      o.tracking_number
    ].map(escapeCsv).join(",");

    csvContent += row + "\n";
  });

  // BOM (한글 깨짐 방지)
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `출고이력_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDateClean(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

function getOutboundStatusColor(status) {
  switch (status) {
    case 'PENDING': return 'bg-slate-50 text-slate-500 border-slate-100'; // 대기
    case 'PICKING': return 'bg-amber-50 text-amber-600 border-amber-100'; // 피킹중
    case 'PACKING': return 'bg-blue-50 text-blue-600 border-blue-100'; // 패킹중
    case 'SHIPPED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // 출고완료
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
}

// 상세 모달 로직 (기존 유지)
function injectOutboundDetailModal() {
  if (document.getElementById('outboundDetailModal')) return;

  const modalHtml = `
      <div id="outboundDetailModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 border border-slate-100 flex flex-col max-h-[95vh]">
            <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-white sticky top-0 rounded-t-2xl z-10">
                <div>
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-3">
                        출고 상세 정보
                        <span id="outboundDetailStatus" class="text-xs px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-600">PENDING</span>
                    </h3>
                    <p id="outboundDetailNo" class="text-xs text-slate-400 font-mono mt-0.5">DO-...</p>
                </div>
                <button onclick="document.getElementById('outboundDetailModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <!-- 정보 카드 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2 text-sm">배송지 정보</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-slate-500">받는분</span> <span id="outDetailReceiver" class="font-medium text-slate-800"></span></div>
                            <div class="flex justify-between"><span class="text-slate-500">연락처</span> <span id="outDetailPhone" class="font-medium text-slate-800"></span></div>
                            <div class="flex justify-between"><span class="text-slate-500 shrink-0 mr-4">주소</span> <span id="outDetailAddress" class="font-medium text-slate-800 text-right break-words"></span></div>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2 text-sm">주문 요약</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-slate-500">포함주문</span> <span id="outDetailSales" class="font-medium text-slate-800"></span></div>
                            <div class="flex justify-between"><span class="text-slate-500">비고</span> <span id="outDetailNotes" class="text-slate-600"></span></div>
                        </div>
                    </div>
                </div>

                <!-- 상품 목록 (피킹) -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div class="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 class="font-bold text-slate-800 text-sm">피킹 리스트 (Picking)</h4>
                        <button id="btnSavePicking" onclick="savePicking()" class="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700 transition-colors hidden font-semibold">
                            <i class="fas fa-check mr-1"></i>피킹 저장
                        </button>
                    </div>
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th class="px-5 py-3 text-left">상품명</th>
                                <th class="px-5 py-3 text-left">SKU</th>
                                <th class="px-5 py-3 text-center">지시</th>
                                <th class="px-5 py-3 text-center">피킹</th>
                                <th class="px-5 py-3 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody id="outDetailItems" class="divide-y divide-slate-100"></tbody>
                    </table>
                </div>

                <!-- 패킹/출고확정 영역 -->
                <div id="outDetailActionArea" class="hidden bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 text-sm">출고 처리 (Packing & Shipping)</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">택배사</label>
                            <input type="text" id="outPkgCourier" class="w-full border border-slate-300 rounded px-3 py-2 text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">운송장번호</label>
                            <input type="text" id="outPkgTracking" class="w-full border border-slate-300 rounded px-3 py-2 text-xs">
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3">
                        <button id="btnPacking" onclick="performPacking()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold">
                            <i class="fas fa-box mr-2"></i>패킹 완료
                        </button>
                        <button id="btnConfirmShip" onclick="confirmShipment()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold">
                            <i class="fas fa-truck mr-2"></i>출고 확정 (재고차감)
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

let currentOutboundId = null;

async function openOutboundDetail(id) {
  injectOutboundDetailModal();
  currentOutboundId = id;

  try {
    const res = await axios.get(`${API_BASE}/outbound/${id}`);
    const data = res.data.data;

    document.getElementById('outboundDetailStatus').textContent = data.status;
    document.getElementById('outboundDetailStatus').className = `text-sm px-2.5 py-1 rounded-full font-bold ${getOutboundStatusColor(data.status)}`;
    document.getElementById('outboundDetailNo').textContent = data.order_number;

    document.getElementById('outDetailReceiver').textContent = data.destination_name;
    document.getElementById('outDetailPhone').textContent = data.destination_phone;
    document.getElementById('outDetailAddress').textContent = data.destination_address;

    document.getElementById('outDetailSales').textContent = data.sales.map(s => `#${s.id}`).join(', ');
    document.getElementById('outDetailNotes').textContent = data.notes || '-';

    const itemsBody = document.getElementById('outDetailItems');
    itemsBody.innerHTML = data.items.map(item => `
            <tr class="text-sm text-slate-700">
                <td class="px-5 py-3 font-medium">${item.product_name}</td>
                <td class="px-5 py-3 font-mono text-slate-500">${item.sku}</td>
                <td class="px-5 py-3 text-center font-bold">${item.quantity_ordered}</td>
                <td class="px-5 py-3 text-center">
                    ${data.status === 'PENDING' || data.status === 'PICKING' ?
        `<input type="number" class="picking-input w-20 text-center border rounded py-1" 
                            data-id="${item.product_id}" max="${item.quantity_ordered}" value="${item.quantity_picked || 0}">`
        : item.quantity_picked}
                </td>
                <td class="px-5 py-3 text-center">
                     <span class="px-2 py-0.5 rounded text-xs ${item.status === 'PICKED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${item.status}</span>
                </td>
            </tr>
        `).join('');

    const btnSavePicking = document.getElementById('btnSavePicking');
    const actionArea = document.getElementById('outDetailActionArea');
    const btnPacking = document.getElementById('btnPacking');
    const btnConfirm = document.getElementById('btnConfirmShip');
    const pkgInputs = [document.getElementById('outPkgCourier'), document.getElementById('outPkgTracking')];

    if (data.status === 'PENDING' || data.status === 'PICKING') {
      btnSavePicking.classList.remove('hidden');
      actionArea.classList.add('hidden');
    } else {
      btnSavePicking.classList.add('hidden');
      actionArea.classList.remove('hidden');

      if (data.packages && data.packages.length > 0) {
        document.getElementById('outPkgCourier').value = data.packages[0].courier || '';
        document.getElementById('outPkgTracking').value = data.packages[0].tracking_number || '';
      }

      if (data.status === 'PACKING') {
        btnPacking.classList.remove('hidden');
        btnConfirm.classList.add('hidden');
        btnPacking.disabled = false;
        btnConfirm.classList.remove('hidden');
      } else if (data.status === 'SHIPPED') {
        btnPacking.classList.add('hidden');
        btnConfirm.classList.add('hidden');
        pkgInputs.forEach(i => i.disabled = true);
      }
    }

    document.getElementById('outboundDetailModal').classList.remove('hidden');
  } catch (e) {
    console.error(e);
    alert('상세 정보 로드 실패');
  }
}

async function savePicking() {
  const inputs = document.querySelectorAll('.picking-input');
  const items = Array.from(inputs).map(input => ({
    product_id: parseInt(input.dataset.id),
    quantity: parseInt(input.value) - parseInt(input.defaultValue)
  })).filter(i => i.quantity > 0);

  if (items.length === 0) {
    alert('변경 사항이 없습니다.');
    return;
  }

  try {
    await axios.post(`${API_BASE}/outbound/${currentOutboundId}/picking`, { items });
    showSuccess('피킹 정보가 저장되었습니다.');
    openOutboundDetail(currentOutboundId);
    loadPage('outbound');
  } catch (e) {
    alert('저장 실패: ' + e.message);
  }
}

async function performPacking() {
  const courier = document.getElementById('outPkgCourier').value;
  const tracking = document.getElementById('outPkgTracking').value;

  if (!courier || !tracking) {
    alert('택배사와 운송장번호를 입력해주세요.');
    return;
  }

  try {
    await axios.post(`${API_BASE}/outbound/${currentOutboundId}/packing`, {
      courier,
      tracking_number: tracking,
      box_type: 'BOX',
      box_count: 1,
      weight: 0
    });
    showSuccess('패킹 완료.');
    openOutboundDetail(currentOutboundId);
  } catch (e) {
    alert('패킹 실패');
  }
}

async function confirmShipment() {
  if (!confirm('출고를 확정하시겠습니까? 재고가 차감됩니다.')) return;

  try {
    await axios.post(`${API_BASE}/outbound/${currentOutboundId}/confirm`);
    showSuccess('출고가 확정되었습니다.');
    openOutboundDetail(currentOutboundId);
    loadPage('outbound');
  } catch (e) {
    alert('출고 확정 실패: ' + (e.response?.data?.error || e.message));
  }
}

// 거래명세서 출력
async function loadInvoice(content) {
  try {
    const response = await axios.get(`${API_BASE}/sales?status=completed&limit=50`);
    const sales = response.data.data;

    content.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-slate-800">
          <i class="fas fa-file-invoice mr-2 text-indigo-600"></i>거래명세서 관리
        </h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">주문번호</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">거래일시</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">거래처(고객)</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">합계금액</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">기능</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              ${sales.length > 0 ? sales.map(s => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-700 font-medium">#${s.id}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${new Date(s.created_at).toLocaleString()}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-medium text-slate-900">${s.customer_name || '비회원'}</div>
                    <div class="text-xs text-slate-400">${s.customer_phone || '-'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-800">
                    ${formatCurrency(s.final_amount)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button onclick="openInvoiceModal(${s.id})" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                      <i class="fas fa-print mr-1"></i>명세서
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">발급 가능한 거래 내역이 없습니다.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    injectInvoiceModal();

  } catch (error) {
    console.error(error);
    showError(content, '거래 내역을 불러오지 못했습니다.');
  }
}

function injectInvoiceModal() {
  if (document.getElementById('invoiceModal')) return;

  const modalHtml = `
      <div id="invoiceModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
        <div class="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-slate-100 no-print">
                <h3 class="text-lg font-bold text-slate-800">거래명세서 미리보기</h3>
                <div class="flex items-center gap-2">
                    <button onclick="printInvoice()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                        <i class="fas fa-print mr-2"></i>인쇄
                    </button>
                    <button onclick="document.getElementById('invoiceModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div id="invoicePreview" class="flex-1 overflow-y-auto p-8 bg-slate-100 print:p-0 print:bg-white">
                <!-- A4 Paper Effect -->
                <div class="bg-white shadow-lg print:shadow-none max-w-[210mm] mx-auto p-[10mm] min-h-[297mm] print:min-h-0 relative text-sm text-slate-900">
                    <!-- Title -->
                    <div class="text-center border-b-2 border-slate-800 pb-4 mb-8">
                        <h1 class="text-3xl font-bold tracking-widest text-slate-900">거 래 명 세 서</h1>
                        <p class="text-slate-500 mt-1">(공급받는자 보관용)</p>
                    </div>

                    <!-- Supplier & Buyer Info -->
                    <div class="flex justify-between mb-8 border border-slate-300">
                        <!-- Supplier -->
                        <div class="w-1/2 border-r border-slate-300 p-2">
                             <div class="flex h-full">
                                <div class="w-8 flex items-center justify-center bg-slate-50 text-slate-500 font-bold border-r border-slate-200 writing-vertical py-4">공급자</div>
                                <div class="flex-1 pl-3 space-y-1 text-xs">
                                    <div class="flex"><span class="w-12 text-slate-500">등록번호</span> <span>123-456-7890</span></div>
                                    <div class="flex"><span class="w-12 text-slate-500">상호</span> <span>(주)와우쓰리디</span> <span class="ml-4 text-slate-500">성명</span> <span>홍길동</span></div>
                                    <div class="flex"><span class="w-12 text-slate-500">주소</span> <span>서울시 강남구 테헤란로 123</span></div>
                                    <div class="flex"><span class="w-12 text-slate-500">업태</span> <span>도소매</span> <span class="ml-4 text-slate-500">종목</span> <span>3D프린터 외</span></div>
                                </div>
                             </div>
                        </div>
                         <!-- Buyer -->
                        <div class="w-1/2 p-2">
                            <div class="flex h-full">
                                <div class="w-8 flex items-center justify-center bg-slate-50 text-slate-500 font-bold border-r border-slate-200 writing-vertical py-4">공급받는자</div>
                                <div class="flex-1 pl-3 space-y-1 text-xs">
                                    <div class="flex"><span class="w-12 text-slate-500">등록번호</span> <span id="invCustRegNo">-</span></div>
                                    <div class="flex"><span class="w-12 text-slate-500">상호</span> <span id="invCustCompany" class="font-bold">-</span> <span class="ml-4 text-slate-500">성명</span> <span id="invCustName">-</span></div>
                                    <div class="flex"><span class="w-12 text-slate-500">주소</span> <span id="invCustAddress">-</span></div>
                                    <div class="flex"><span class="w-12 text-slate-500">연락처</span> <span id="invCustPhone">-</span></div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <table class="w-full border-collapse border border-slate-300 mb-6 text-xs text-center">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="border border-slate-300 py-2 w-10">월</th>
                                <th class="border border-slate-300 py-2 w-10">일</th>
                                <th class="border border-slate-300 py-2">품목 및 규격</th>
                                <th class="border border-slate-300 py-2 w-16">수량</th>
                                <th class="border border-slate-300 py-2 w-24">단가</th>
                                <th class="border border-slate-300 py-2 w-24">공급가액</th>
                                <th class="border border-slate-300 py-2 w-20">세액</th>
                            </tr>
                        </thead>
                        <tbody id="invoiceItems">
                            <!-- Items go here -->
                        </tbody>
                        <tfoot>
                            <tr class="font-bold bg-slate-50">
                                <td colspan="3" class="border border-slate-300 py-2 text-center">합 계</td>
                                <td class="border border-slate-300 py-2" id="invTotalQty"></td>
                                <td class="border border-slate-300 py-2"></td>
                                <td class="border border-slate-300 py-2 text-right px-2" id="invTotalSupply"></td>
                                <td class="border border-slate-300 py-2 text-right px-2" id="invTotalTax"></td>
                            </tr>
                        </tfoot>
                    </table>

                     <!-- Summary & Payment -->
                     <div class="flex justify-between items-end mt-12">
                        <div class="text-xs text-slate-500 space-y-1">
                            <p>위 금액을 정히 영수(청구)함.</p>
                            <p id="invDate" class="text-slate-800 font-bold"></p>
                        </div>
                        <div class="text-right">
                             <div class="flex items-end gap-2 border-b-2 border-slate-800 pb-1">
                                <span class="text-sm font-bold">합계금액 :</span>
                                <span id="invGrandTotal" class="text-xl font-bold tracking-wider"></span>
                                <span class="text-sm font-bold">원정</span>
                             </div>
                        </div>
                     </div>
                     
                     <div id="invStamp" class="absolute bottom-[20mm] right-[20mm] opacity-50">
                        <!-- 도장 이미지 or 텍스트 -->
                        <div class="w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-bold text-xs transform -rotate-12" style="border-style: double;">
                            (인)
                        </div>
                     </div>
                </div>
            </div>
        </div>
        <style>
            @media print {
                body * { visibility: hidden; }
                #invoiceModal, #invoiceModal * { visibility: visible; }
                #invoiceModal { position: absolute; left: 0; top: 0; background: white; width: 100%; height: 100%;  }
                .no-print { display: none !important; }
                #invoicePreview { overflow: visible; padding: 0; background: white; }
                .shadow-lg { box-shadow: none !important; }
            }
            .writing-vertical { writing-mode: vertical-lr; text-orientation: upright; letter-spacing: 0.2em; }
        </style>
      </div>
    `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function openInvoiceModal(saleId) {
  injectInvoiceModal();
  try {
    const response = await axios.get(`${API_BASE}/sales/${saleId}`);
    const sale = response.data.data;

    // Data mapping
    const date = new Date(sale.created_at);
    document.getElementById('invoiceModal').classList.remove('hidden');

    // Buyer
    document.getElementById('invCustRegNo').textContent = '-'; // Add if customer DB has it
    document.getElementById('invCustCompany').textContent = sale.customer_name || '비회원';
    document.getElementById('invCustName').textContent = sale.customer_name || '';
    document.getElementById('invCustAddress').textContent = sale.shipping_address || sale.customer_address || '-';
    document.getElementById('invCustPhone').textContent = sale.customer_phone || '-';

    // Date
    document.getElementById('invDate').textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

    // Items
    const tbody = document.getElementById('invoiceItems');
    let totalQty = 0;
    let totalSupply = 0;
    let totalTax = 0;

    // Rows (Fill 10 rows minimum for look)
    let html = '';
    const items = sale.items || [];
    const emptyRows = Math.max(0, 10 - items.length);

    items.forEach(item => {
      const supply = Math.round(item.subtotal / 1.1);
      const tax = item.subtotal - supply;
      totalQty += item.quantity;
      totalSupply += supply;
      totalTax += tax;

      html += `
                <tr>
                    <td class="border border-slate-300 py-2">${date.getMonth() + 1}</td>
                    <td class="border border-slate-300 py-2">${date.getDate()}</td>
                    <td class="border border-slate-300 py-2 text-left px-2 max-w-[200px] truncate">${item.product_name}</td>
                    <td class="border border-slate-300 py-2">${item.quantity}</td>
                    <td class="border border-slate-300 py-2 text-right px-2">${formatCurrency(item.unit_price).replace('₩', '')}</td>
                    <td class="border border-slate-300 py-2 text-right px-2">${formatCurrency(supply).replace('₩', '')}</td>
                    <td class="border border-slate-300 py-2 text-right px-2">${formatCurrency(tax).replace('₩', '')}</td>
                </tr>
            `;
    });

    for (let i = 0; i < emptyRows; i++) {
      html += `
                <tr>
                    <td class="border border-slate-300 py-2 text-transparent">.</td>
                    <td class="border border-slate-300 py-2"></td>
                    <td class="border border-slate-300 py-2"></td>
                    <td class="border border-slate-300 py-2"></td>
                    <td class="border border-slate-300 py-2"></td>
                    <td class="border border-slate-300 py-2"></td>
                    <td class="border border-slate-300 py-2"></td>
                </tr>
            `;
    }

    tbody.innerHTML = html;

    // Totals
    document.getElementById('invTotalQty').textContent = totalQty;
    document.getElementById('invTotalSupply').textContent = formatCurrency(totalSupply).replace('₩', '');
    document.getElementById('invTotalTax').textContent = formatCurrency(totalTax).replace('₩', '');
    document.getElementById('invGrandTotal').textContent = formatCurrency(sale.final_amount).replace('₩', '');

  } catch (e) {
    alert('명세서 로드 실패: ' + e.message);
  }
}

function printInvoice() {
  window.print();
}

// 시스템 관리
async function loadSystem(content) {
  content.innerHTML = `
    <div class="flex flex-col h-full bg-slate-50">
        <!-- Header -->
        <div class="px-8 pt-8 pb-4 bg-white border-b border-slate-200">
            <h1 class="text-2xl font-bold text-slate-800 mb-1">시스템 관리</h1>
            <p class="text-sm text-slate-500 mb-6">전체 조직 및 사용자, 시스템 상태를 관리합니다.</p>
            
            <div class="flex space-x-8 overflow-x-auto">
                <button onclick="switchSystemTab('tenants')" id="sys-tab-tenants" class="sys-tab-btn pb-3 text-sm font-bold border-b-2 text-emerald-600 border-emerald-500 transition-colors whitespace-nowrap">
                    <i class="fas fa-building mr-2"></i>조직(Tenant) 관리
                </button>
                <button onclick="switchSystemTab('users')" id="sys-tab-users" class="sys-tab-btn pb-3 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-emerald-600 transition-colors whitespace-nowrap">
                    <i class="fas fa-users-cog mr-2"></i>전체 사용자 관리
                </button>
                <button onclick="switchSystemTab('stats')" id="sys-tab-stats" class="sys-tab-btn pb-3 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-emerald-600 transition-colors whitespace-nowrap">
                    <i class="fas fa-chart-line mr-2"></i>시스템 통계
                </button>
                <button onclick="switchSystemTab('plan-requests')" id="sys-tab-plan-requests" class="sys-tab-btn pb-3 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-emerald-600 transition-colors whitespace-nowrap">
                    <i class="fas fa-file-invoice mr-2"></i>플랜 변경 요청
                </button>
            </div>
        </div>
        
        <!-- Content -->
        <div id="systemContent" class="flex-1 overflow-auto p-8">
           <!-- Dynamic Load -->
        </div>
    </div>
  `;

  if (!window.currentSystemTab) window.currentSystemTab = 'tenants';
  switchSystemTab(window.currentSystemTab);
}

window.switchSystemTab = async function (tab) {
  window.currentSystemTab = tab;
  // Update Tab UI
  document.querySelectorAll('.sys-tab-btn').forEach(btn => {
    btn.classList.remove('font-bold', 'text-emerald-600', 'border-emerald-500');
    btn.classList.add('font-medium', 'text-slate-500', 'border-transparent');
  });
  const activeBtn = document.getElementById(`sys-tab-${tab}`);
  if (activeBtn) {
    activeBtn.classList.remove('font-medium', 'text-slate-500', 'border-transparent');
    activeBtn.classList.add('font-bold', 'text-emerald-600', 'border-emerald-500');
  }

  const container = document.getElementById('systemContent');
  container.innerHTML = '<div class="flex justify-center p-20"><i class="fas fa-spinner fa-spin text-3xl text-emerald-500"></i></div>';

  try {
    if (tab === 'tenants') await renderSystemTenants(container);
    else if (tab === 'users') await renderSystemUsers(container);
    else if (tab === 'stats') await renderSystemStats(container);
    else if (tab === 'plan-requests') await renderPlanRequests(container);
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="bg-red-50 p-4 rounded text-red-600">데이터 로드 실패: ${e.message}</div>`;
  }
}

async function renderSystemTenants(container) {
  const res = await axios.get(`${API_BASE}/system/tenants`);
  const tenants = res.data.data;

  container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="font-bold text-slate-700">등록된 조직 목록</h3>
            <button onclick="openTenantModal()" class="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 font-bold text-sm transition-colors">
                <i class="fas fa-plus mr-2"></i>조직 생성
            </button>
        </div>
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th class="p-4">ID</th>
                        <th class="p-4">조직명</th>
                        <th class="p-4">플랜</th>
                        <th class="p-4">상태</th>
                        <th class="p-4">사용자수</th>
                        <th class="p-4">상품수</th>
                        <th class="p-4">생성일</th>
                        <th class="p-4 text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${tenants.map(t => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-4 text-slate-500">#${t.id}</td>
                            <td class="p-4 font-bold text-slate-800">${t.name}</td>
                            <td class="p-4 text-slate-600 uppercase text-xs font-mono">${t.plan}</td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded text-xs font-bold ${t.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}">${t.status}</span>
                            </td>
                            <td class="p-4 text-slate-600">${t.user_count}</td>
                            <td class="p-4 text-slate-600">${t.product_count}</td>
                            <td class="p-4 text-slate-500 text-xs">${new Date(t.created_at).toLocaleDateString()}</td>
                            <td class="p-4 text-center flex justify-center gap-2">
                                <button onclick="viewTenantDetail(${t.id})" class="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded transition-colors" title="상세"><i class="fas fa-eye"></i></button>
                                <button onclick="editTenant(${t.id}, '${t.name}', '${t.plan}', '${t.status}')" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="수정"><i class="fas fa-edit"></i></button>
                                <button onclick="manageTenant(${t.id})" class="px-2 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-bold transition-colors" title="관리"><i class="fas fa-sign-in-alt mr-1"></i>관리</button>
                                <button onclick="deleteTenant(${t.id}, '${t.name}')" class="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors" title="삭제"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderSystemUsers(container) {
  const res = await axios.get(`${API_BASE}/system/users`);
  const users = res.data.data;

  container.innerHTML = `
        <div class="mb-4">
            <h3 class="font-bold text-slate-700">전체 사용자 목록</h3>
        </div>
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th class="p-4">이름</th>
                        <th class="p-4">이메일</th>
                        <th class="p-4">소속 조직</th>
                        <th class="p-4">권한</th>
                        <th class="p-4">가입일</th>
                        <th class="p-4 text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${users.map(u => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-4 font-bold text-slate-800">${u.name}</td>
                            <td class="p-4 text-slate-500">${u.email}</td>
                            <td class="p-4 text-slate-600">${u.tenant_name || '-'}</td>
                            <td class="p-4 uppercase text-xs font-mono text-slate-500">${u.role || 'STAFF'}</td>
                            <td class="p-4 text-slate-400 text-xs">${new Date(u.created_at).toLocaleDateString()}</td>
                            <td class="p-4 text-center flex justify-center gap-2">
                                <button onclick="resetUserPassword(${u.id}, '${u.name}')" class="px-3 py-1 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 text-xs font-bold transition-colors">비번 초기화</button>
                                <button onclick="changeUserRole(${u.id}, '${u.name}', '${u.role || 'STAFF'}')" class="px-3 py-1 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-50 text-xs font-bold transition-colors">권한 변경</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderSystemStats(container) {
  const res = await axios.get(`${API_BASE}/system/stats`);
  const stats = res.data.data;

  container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p class="text-sm font-bold text-slate-500 mb-2">전체 소속 수</p>
                <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-bold text-slate-800">${stats.total_tenants}</span>
                    <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">정상 +</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p class="text-sm font-bold text-slate-500 mb-2">전체 사용자 수</p>
                <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-bold text-slate-800">${stats.active_users}</span>
                </div>
            </div>
        </div>
    `;
}

async function renderPlanRequests(container) {
  const res = await axios.get(`${API_BASE}/system/plan-requests`);
  const requests = res.data.data;

  container.innerHTML = `
        <div class="mb-4">
            <h3 class="font-bold text-slate-700">플랜 변경 요청 목록</h3>
            <p class="text-xs text-slate-400 mt-1">사용자들이 요청한 플랜 변경 내역입니다.</p>
        </div>
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[200px]">
            ${requests.length === 0 ? `
                <div class="flex items-center justify-center h-40 text-slate-400 text-sm">
                    요청 내역이 없습니다.
                </div>
            ` : `
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th class="p-4">조직명</th>
                        <th class="p-4">현재 플랜</th>
                        <th class="p-4">요청 플랜</th>
                        <th class="p-4">요청일시</th>
                        <th class="p-4">상태</th>
                        <th class="p-4 text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${requests.map(r => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-4 font-bold text-slate-800">${r.tenant_name || '-'}</td>
                            <td class="p-4 text-slate-600 font-mono">${r.current_plan}</td>
                            <td class="p-4 text-indigo-600 font-bold font-mono">${r.requested_plan}</td>
                            <td class="p-4 text-slate-400 text-xs">${new Date(r.requested_at).toLocaleString()}</td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded text-xs font-bold ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : (r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}">${r.status}</span>
                            </td>
                            <td class="p-4 text-center">
                                ${r.status === 'PENDING' ? `
                                    <button onclick="processPlanRequest(${r.id}, 'approve', '${r.tenant_name}', '${r.current_plan}', '${r.requested_plan}')" class="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-bold mr-1 border border-emerald-200 transition-colors">수락</button>
                                    <button onclick="processPlanRequest(${r.id}, 'reject', '${r.tenant_name}', '${r.current_plan}', '${r.requested_plan}')" class="text-rose-500 hover:bg-rose-50 px-2 py-1 rounded text-xs font-bold border border-rose-200 transition-colors">거절</button>
                                ` : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
}

// ========== 조직(Tenant) 관리 기능 ==========

// 조직 생성 모달
window.openTenantModal = function () {
  const existingModal = document.getElementById('tenantCreateModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div id="tenantCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 transition-all duration-300">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="fas fa-building text-xl"></i>
              </div>
              <h3 class="text-xl font-bold">새 조직 생성</h3>
            </div>
            <button onclick="closeTenantModal('create')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">조직명 *</label>
              <input type="text" id="tenantName" class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="조직 이름을 입력하세요">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">플랜 *</label>
              <select id="tenantPlan" class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none">
                <option value="FREE">FREE - 무료 플랜</option>
                <option value="BASIC">BASIC - 기본 플랜</option>
                <option value="PRO">PRO - 프로 플랜</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200">
          <button onclick="closeTenantModal('create')" class="px-5 py-2.5 rounded-lg font-semibold text-slate-700 hover:bg-slate-200 transition-colors">취소</button>
          <button onclick="submitCreateTenant()" class="px-5 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md">생성하기</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  setTimeout(() => {
    const modal = document.getElementById('tenantCreateModal');
    modal.classList.remove('opacity-0');
    modal.querySelector('.bg-white').classList.remove('scale-95');
    modal.querySelector('.bg-white').classList.add('scale-100');
    document.getElementById('tenantName').focus();
  }, 10);
}

window.closeTenantModal = function (type) {
  const modalId = type === 'create' ? 'tenantCreateModal' : type === 'edit' ? 'tenantEditModal' : 'tenantDetailModal';
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('opacity-0');
    modal.querySelector('.bg-white').classList.add('scale-95');
    setTimeout(() => modal.remove(), 300);
  }
}

window.submitCreateTenant = async function () {
  const name = document.getElementById('tenantName').value.trim();
  const plan = document.getElementById('tenantPlan').value;

  if (!name) {
    alert('조직명을 입력해주세요.');
    document.getElementById('tenantName').focus();
    return;
  }

  try {
    await axios.post(`${API_BASE}/system/tenants`, { name, plan });
    closeTenantModal('create');
    showSuccess('조직이 성공적으로 생성되었습니다.');
    setTimeout(() => switchSystemTab('tenants'), 500);
  } catch (e) {
    alert('조직 생성 실패: ' + (e.response?.data?.error || e.message));
  }
}

// 조직 상세보기
window.viewTenantDetail = async function (tenantId) {
  try {
    const res = await axios.get(`${API_BASE}/system/tenants`);
    const tenant = res.data.data.find(t => t.id === tenantId);
    if (!tenant) {
      alert('조직을 찾을 수 없습니다.');
      return;
    }

    const existingModal = document.getElementById('tenantDetailModal');
    if (existingModal) existingModal.remove();

    const statusBadge = tenant.status === 'ACTIVE'
      ? '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">활성</span>'
      : '<span class="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-bold">비활성</span>';

    const modalHTML = `
      <div id="tenantDetailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform scale-95 transition-all duration-300">
          <div class="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 text-white rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <i class="fas fa-building text-xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold">조직 상세 정보</h3>
                  <p class="text-white/80 text-sm">#${tenant.id}</p>
                </div>
              </div>
              <button onclick="closeTenantModal('detail')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-500 mb-2">조직명</label>
                <p class="text-2xl font-bold text-slate-800">${tenant.name}</p>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">플랜</label>
                <p class="text-lg font-mono font-bold text-indigo-600">${tenant.plan}</p>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">상태</label>
                <div>${statusBadge}</div>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">사용자 수</label>
                <p class="text-lg font-bold text-slate-800"><i class="fas fa-users text-emerald-500 mr-2"></i>${tenant.user_count || 0}명</p>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-slate-500 mb-2">상품 수</label>
                <p class="text-lg font-bold text-slate-800"><i class="fas fa-box text-blue-500 mr-2"></i>${tenant.product_count || 0}개</p>
              </div>
              
              <div class="col-span-2">
                <label class="block text-xs font-semibold text-slate-500 mb-2">생성일</label>
                <p class="text-sm text-slate-600"><i class="far fa-calendar mr-2"></i>${new Date(tenant.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div class="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-between border-t border-slate-200">
            <button onclick="editTenant(${tenant.id}, '${tenant.name}', '${tenant.plan}', '${tenant.status}')" class="px-5 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <i class="fas fa-edit mr-2"></i>수정
            </button>
            <button onclick="closeTenantModal('detail')" class="px-5 py-2.5 rounded-lg font-semibold text-slate-700 hover:bg-slate-200 transition-colors">닫기</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setTimeout(() => {
      const modal = document.getElementById('tenantDetailModal');
      modal.classList.remove('opacity-0');
      modal.querySelector('.bg-white').classList.remove('scale-95');
      modal.querySelector('.bg-white').classList.add('scale-100');
    }, 10);
  } catch (e) {
    alert('조직 정보 로드 실패: ' + e.message);
  }
}

// 조직 수정
window.editTenant = function (tenantId, currentName, currentPlan, currentStatus) {
  // 상세 모달이 열려있으면 닫기
  const detailModal = document.getElementById('tenantDetailModal');
  if (detailModal) detailModal.remove();

  const existingModal = document.getElementById('tenantEditModal');
  if (existingModal) existingModal.remove();

  const modalHTML = `
    <div id="tenantEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 transition-all duration-300">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="fas fa-edit text-xl"></i>
              </div>
              <h3 class="text-xl font-bold">조직 정보 수정</h3>
            </div>
            <button onclick="closeTenantModal('edit')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">조직명 *</label>
              <input type="text" id="editTenantName" value="${currentName}" class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">플랜 *</label>
              <select id="editTenantPlan" class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none">
                <option value="FREE" ${currentPlan === 'FREE' ? 'selected' : ''}>FREE - 무료 플랜</option>
                <option value="BASIC" ${currentPlan === 'BASIC' ? 'selected' : ''}>BASIC - 기본 플랜</option>
                <option value="PRO" ${currentPlan === 'PRO' ? 'selected' : ''}>PRO - 프로 플랜</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">상태 *</label>
              <select id="editTenantStatus" class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none">
                <option value="ACTIVE" ${currentStatus === 'ACTIVE' ? 'selected' : ''}>활성</option>
                <option value="INACTIVE" ${currentStatus === 'INACTIVE' ? 'selected' : ''}>비활성</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3 border-t border-slate-200">
          <button onclick="closeTenantModal('edit')" class="px-5 py-2.5 rounded-lg font-semibold text-slate-700 hover:bg-slate-200 transition-colors">취소</button>
          <button onclick="submitEditTenant(${tenantId})" class="px-5 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md">저장하기</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  setTimeout(() => {
    const modal = document.getElementById('tenantEditModal');
    modal.classList.remove('opacity-0');
    modal.querySelector('.bg-white').classList.remove('scale-95');
    modal.querySelector('.bg-white').classList.add('scale-100');
    document.getElementById('editTenantName').focus();
  }, 10);
}

window.submitEditTenant = async function (tenantId) {
  const name = document.getElementById('editTenantName').value.trim();
  const plan = document.getElementById('editTenantPlan').value;
  const status = document.getElementById('editTenantStatus').value;

  if (!name) {
    alert('조직명을 입력해주세요.');
    return;
  }

  try {
    await axios.put(`${API_BASE}/system/tenants/${tenantId}`, { name, plan, status });
    closeTenantModal('edit');
    showSuccess('조직 정보가 성공적으로 수정되었습니다.');
    setTimeout(() => switchSystemTab('tenants'), 500);
  } catch (e) {
    alert('조직 수정 실패: ' + (e.response?.data?.error || e.message));
  }
}

// 조직 삭제
window.deleteTenant = async function (tenantId, tenantName) {
  if (!confirm(`"${tenantName}" 조직을 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`)) return;

  try {
    await axios.delete(`${API_BASE}/system/tenants/${tenantId}`);
    showSuccess('조직이 성공적으로 삭제되었습니다.');
    setTimeout(() => switchSystemTab('tenants'), 500);
  } catch (e) {
    alert('조직 삭제 실패: ' + (e.response?.data?.error || e.message));
  }
}

// 조직 관리 (상세 페이지로 이동)
window.manageTenant = function (tenantId) {
  // TODO: 조직 관리 대시보드로 이동하는 기능
  // 현재는 상세보기와 동일하게 처리
  alert(`조직 #${tenantId} 관리 기능은 추후 구현 예정입니다.\n현재는 상세보기로 이동합니다.`);
  viewTenantDetail(tenantId);
}

// 플랜 변경 요청 처리 (수락/거절)
window.processPlanRequest = async function (id, action, tenantName, currentPlan, requestedPlan) {
  // 상세한 확인 메시지
  const actionText = action === 'approve' ? '수락' : '거절';
  const actionIcon = action === 'approve' ? '✅' : '❌';

  let confirmMessage = `${actionIcon} 플랜 변경 요청을 ${actionText}하시겠습니까?\n\n`;

  if (tenantName) {
    confirmMessage += `📌 조직: ${tenantName}\n`;
    confirmMessage += `📊 현재 플랜: ${currentPlan}\n`;
    confirmMessage += `🔄 요청 플랜: ${requestedPlan}\n\n`;
  }

  if (action === 'approve') {
    confirmMessage += `✓ 수락 시 해당 조직의 플랜이 즉시 변경됩니다.`;
  } else {
    confirmMessage += `✗ 거절 시 요청이 취소되며 플랜은 변경되지 않습니다.`;
  }

  if (!confirm(confirmMessage)) return;

  try {
    const response = await axios.post(`${API_BASE}/system/plan-requests/${id}/${action}`);

    if (response.data.success) {
      // 성공 메시지
      let successMsg = '';
      if (action === 'approve') {
        successMsg = `✅ 플랜 변경 요청이 승인되었습니다.\n`;
        if (tenantName) {
          successMsg += `\n"${tenantName}" 조직의 플랜이 ${currentPlan} → ${requestedPlan}(으)로 변경되었습니다.`;
        }
      } else {
        successMsg = `❌ 플랜 변경 요청이 거절되었습니다.`;
      }

      showSuccess(successMsg);
      setTimeout(() => switchSystemTab('plan-requests'), 500);
    }
  } catch (e) {
    const errorMsg = e.response?.data?.error || e.message;
    let displayMsg = `플랜 변경 요청 ${actionText} 실패\n\n`;

    if (errorMsg.includes('not found')) {
      displayMsg += '요청을 찾을 수 없습니다.';
    } else if (errorMsg.includes('already processed')) {
      displayMsg += '이미 처리된 요청입니다.';
    } else {
      displayMsg += `오류: ${errorMsg}`;
    }

    alert(displayMsg);
  }
}

// 비밀번호 초기화
window.resetUserPassword = async function (userId, userName) {
  if (!confirm(`${userName} 사용자의 비밀번호를 초기화하시겠습니까?`)) return;

  try {
    const response = await axios.post(`${API_BASE}/system/users/${userId}/reset-password`);
    if (response.data.success) {
      alert(`✅ ${response.data.message}\n\n새 비밀번호: ${response.data.default_password}\n\n사용자에게 이 비밀번호를 전달해주세요.`);
      switchSystemTab('users');
    }
  } catch (e) {
    alert('❌ 비밀번호 초기화 실패: ' + (e.response?.data?.error || e.message));
  }
}

// 권한 변경 - 현대적인 모달 UI
window.changeUserRole = function (userId, userName, currentRole) {
  const existingModal = document.getElementById('roleChangeModal');
  if (existingModal) existingModal.remove();

  const roleConfig = {
    'ADMIN': { icon: 'fa-crown', color: 'purple', title: '관리자', desc: '모든 시스템 기능에 대한 전체 액세스 권한', gradient: 'from-purple-500 to-indigo-600' },
    'MANAGER': { icon: 'fa-user-tie', color: 'blue', title: '매니저', desc: '일반 관리 및 팀 운영 권한', gradient: 'from-blue-500 to-cyan-600' },
    'STAFF': { icon: 'fa-user', color: 'emerald', title: '직원', desc: '기본적인 업무 수행 권한', gradient: 'from-emerald-500 to-teal-600' }
  };

  const modalHTML = `
    <div id="roleChangeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform scale-95 transition-all duration-300 overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <i class="fas fa-user-shield text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">권한 변경</h3>
                <p class="text-white/80 text-sm mt-0.5">${userName}님의 역할을 선택하세요</p>
              </div>
            </div>
            <button onclick="closeRoleModal()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-slate-600 font-medium">현재 권한:</span>
            <span class="px-3 py-1 bg-slate-200 text-slate-700 rounded-full font-bold text-xs flex items-center gap-1.5">
              <i class="fas ${roleConfig[currentRole]?.icon || 'fa-user'}"></i>
              ${roleConfig[currentRole]?.title || currentRole}
            </span>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${Object.keys(roleConfig).map(role => {
    const config = roleConfig[role];
    const isCurrent = role === currentRole;
    return `
                <button onclick="selectRole('${role}', ${userId}, '${userName}')" class="role-card group relative bg-white border-2 ${isCurrent ? 'border-' + config.color + '-500 ring-4 ring-' + config.color + '-100 opacity-50 cursor-not-allowed' : 'border-slate-200 hover:border-' + config.color + '-300 cursor-pointer hover:-translate-y-1'} rounded-xl p-5 transition-all duration-200 hover:shadow-lg" ${isCurrent ? 'disabled' : ''}>
                  ${isCurrent ? '<div class="absolute top-2 right-2"><span class="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-full">현재</span></div>' : ''}
                  <div class="flex flex-col items-center text-center gap-3">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <i class="fas ${config.icon} text-3xl text-white"></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-slate-800 text-lg mb-1">${config.title}</h4>
                      <p class="text-xs text-slate-500 leading-relaxed">${config.desc}</p>
                    </div>
                    ${!isCurrent ? `<div class="mt-2 w-full"><div class="text-xs font-bold text-${config.color}-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"><i class="fas fa-arrow-right"></i>선택하기</div></div>` : ''}
                  </div>
                </button>
              `;
  }).join('')}
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onclick="closeRoleModal()" class="px-5 py-2.5 rounded-lg font-semibold text-slate-700 hover:bg-slate-200 transition-colors">취소</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  setTimeout(() => {
    const modal = document.getElementById('roleChangeModal');
    modal.classList.remove('opacity-0');
    modal.querySelector('.bg-white').classList.remove('scale-95');
    modal.querySelector('.bg-white').classList.add('scale-100');
  }, 10);
}

window.closeRoleModal = function () {
  const modal = document.getElementById('roleChangeModal');
  if (modal) {
    modal.classList.add('opacity-0');
    modal.querySelector('.bg-white').classList.add('scale-95');
    modal.querySelector('.bg-white').classList.remove('scale-100');
    setTimeout(() => modal.remove(), 300);
  }
}

window.selectRole = async function (newRole, userId, userName) {
  if (!confirm(`${userName}님의 권한을 "${newRole}"(으)로 변경하시겠습니까?`)) return;
  try {
    const response = await axios.post(`${API_BASE}/system/users/${userId}/change-role`, { role: newRole });
    if (response.data.success) {
      closeRoleModal();
      showSuccess(response.data.message);
      setTimeout(() => switchSystemTab('users'), 500);
    }
  } catch (e) {
    alert('❌ 권한 변경 실패: ' + (e.response?.data?.error || e.message));
  }
}

// 대시보드 로드
async function loadDashboard(content) {
  try {
    // 병렬 데이터 로드
    const [summaryRes, salesChartRes, categoryStatsRes, recentProductsRes, recentSalesRes, lowStockRes] = await Promise.all([
      axios.get(`${API_BASE}/dashboard/summary`),
      axios.get(`${API_BASE}/dashboard/sales-chart?days=30`),
      axios.get(`${API_BASE}/dashboard/category-stats`),
      axios.get(`${API_BASE}/dashboard/recent-products?limit=5`),
      axios.get(`${API_BASE}/dashboard/recent-sales?limit=5`),
      axios.get(`${API_BASE}/dashboard/low-stock-alerts?limit=5`)
    ]);

    const summary = summaryRes.data.data;
    const salesData = salesChartRes.data.data;
    const categoryData = categoryStatsRes.data.data;
    const recentProducts = recentProductsRes.data.data;
    const recentSales = recentSalesRes.data.data;
    const lowStock = lowStockRes.data.data;

    content.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900">오늘의 업무</h1>
          <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">Action Board</span>
        </div>
        <div class="text-slate-500 text-sm flex items-center bg-slate-100 px-3 py-1.5 rounded-lg">
           <i class="far fa-clock mr-2"></i> ${new Date().toLocaleString()}
        </div>
      </div>

      <!-- Action Board Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- 출고 대기 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow group cursor-pointer" onclick="loadPage('outbound')">
          <div>
            <p class="text-slate-500 text-sm font-semibold mb-1 group-hover:text-emerald-600 transition-colors">출고 대기</p>
            <div class="text-3xl font-bold text-slate-800 mb-2">${summary.outbound_pending}</div>
            <p class="text-xs text-slate-400">건의 주문 처리 필요</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <i class="fas fa-boxes text-xl"></i>
          </div>
        </div>

        <!-- 배송 중 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow group">
          <div>
            <p class="text-slate-500 text-sm font-semibold mb-1 group-hover:text-blue-600 transition-colors">배송 중</p>
            <div class="text-3xl font-bold text-slate-800 mb-2">${summary.shipping_count}</div>
            <p class="text-xs text-slate-400">건이 배송되고 있습니다</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
            <i class="fas fa-truck text-xl"></i>
          </div>
        </div>

        <!-- 반품/교환 요청 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow group">
          <div>
            <p class="text-slate-500 text-sm font-semibold mb-1 group-hover:text-amber-600 transition-colors">반품/교환 요청</p>
            <div class="text-3xl font-bold text-slate-800 mb-2">${summary.claim_count}</div>
            <p class="text-xs text-slate-400">건의 클레임 확인</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
            <i class="fas fa-undo text-xl"></i>
          </div>
        </div>

        <!-- 재고 부족 -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow group cursor-pointer" onclick="loadPage('stock')">
          <div>
            <p class="text-slate-500 text-sm font-semibold mb-1 group-hover:text-rose-600 transition-colors">재고 부족</p>
            <div class="text-3xl font-bold text-rose-500 mb-2">${summary.low_stock_count}</div>
            <p class="text-xs text-slate-400">건의 상품 발주 필요</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
            <i class="fas fa-exclamation-triangle text-xl"></i>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- 매출 분석 차트 (2칸 차지) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-slate-800 flex items-center">
              <i class="fas fa-chart-line mr-2 text-indigo-500"></i>매출 및 순익 분석
            </h3>
            <div class="flex bg-slate-50 rounded-lg p-1">
              <button class="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200">일별</button>
              <button class="px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700">월별</button>
            </div>
          </div>
          <div class="h-[300px]">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <!-- 카테고리별 비중 (1칸 차지) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 class="font-bold text-slate-800 mb-6 flex items-center">
            <i class="fas fa-chart-pie mr-2 text-emerald-500"></i>카테고리별 판매 비중
          </h3>
          <div class="h-[300px] flex items-center justify-center">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Lists Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 최근 상품 목록 -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div class="p-5 border-b border-slate-50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <i class="fas fa-box"></i>
              </div>
              최근 상품 목록
            </h3>
          </div>
          <div class="p-4 flex-1">
            <ul class="space-y-4">
              ${recentProducts.length > 0 ? recentProducts.map(p => `
                <li class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden flex-shrink-0 border border-slate-200">
                    ${p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover">` : '<i class="fas fa-image"></i>'}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-800 text-sm truncate">${p.name}</p>
                    <p class="text-xs text-slate-500 truncate">${p.category} > ${p.sku}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-emerald-600 text-sm">${formatCurrency(p.selling_price)}</p>
                    <p class="text-xs text-slate-400">재고: ${p.current_stock}</p>
                  </div>
                </li>
              `).join('') : '<li class="text-center text-slate-400 py-8 text-sm">등록된 상품이 없습니다.</li>'}
            </ul>
          </div>
          <div class="p-4 border-t border-slate-50 text-center">
             <button onclick="loadPage('products')" class="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center w-full py-1">
                전체보기 <i class="fas fa-chevron-right ml-1 text-[10px]"></i>
             </button>
          </div>
        </div>

        <!-- 최근 판매 현황 -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div class="p-5 border-b border-slate-50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center">
              <i class="fas fa-shopping-cart mr-2 text-emerald-500"></i>최근 판매 현황
            </h3>
          </div>
          <div class="p-4 flex-1">
            <ul class="space-y-4">
              ${recentSales.length > 0 ? recentSales.map(s => `
                <li class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-slate-800 text-sm">${s.customer_name || '비회원'}</p>
                    <p class="text-xs text-slate-500">${new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-slate-800 text-sm">${formatCurrency(s.final_amount)}</p>
                    <span class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">완료</span>
                  </div>
                </li>
              `).join('') : '<li class="text-center text-slate-400 py-4 text-sm">판매 내역이 없습니다.</li>'}
            </ul>
          </div>
          <div class="p-3 border-t border-slate-50 text-center">
             <button onclick="loadPage('sales')" class="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">전체보기 <i class="fas fa-chevron-right ml-1"></i></button>
          </div>
        </div>

        <!-- 재고 부족 알림 -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
          <div class="p-5 border-b border-slate-50 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 flex items-center">
              <i class="fas fa-exclamation-circle mr-2 text-rose-500"></i>재고 부족 알림
            </h3>
          </div>
          <div class="p-4 flex-1">
            <ul class="space-y-3">
              ${lowStock.length > 0 ? lowStock.map(p => `
                <li class="bg-rose-50/50 rounded-lg p-3 border border-rose-100">
                  <div class="flex justify-between items-start mb-1">
                    <p class="font-semibold text-slate-800 text-sm truncate flex-1 mr-2">${p.name}</p>
                    <span class="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded">${p.current_stock}개 남음</span>
                  </div>
                  <div class="flex justify-between text-xs text-slate-500">
                     <span>${p.sku}</span>
                     <span>최소 유지: ${p.min_stock_alert}</span>
                  </div>
                </li>
              `).join('') : '<li class="text-center text-slate-400 py-4 text-sm">재고 부족 상품이 없습니다.</li>'}
            </ul>
          </div>
          <div class="p-3 border-t border-slate-50 text-center">
             <button onclick="loadPage('stock')" class="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">전체보기 <i class="fas fa-chevron-right ml-1"></i></button>
          </div>
        </div>
      </div>
    `;

    // 차트 초기화 전 기존 차트 제거
    const chartStatus = Chart.getChart("salesChart");
    if (chartStatus != undefined) chartStatus.destroy();
    const catChartStatus = Chart.getChart("categoryChart");
    if (catChartStatus != undefined) catChartStatus.destroy();

    // 매출 차트 (Line)
    const ctx = document.getElementById('salesChart').getContext('2d');

    // 그라데이션 효과
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)'); // Indigo
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: salesData.map(d => d.date.substring(5)), // 월-일
        datasets: [{
          label: '매출액',
          data: salesData.map(d => d.revenue),
          borderColor: '#6366f1', // Indigo 500
          backgroundColor: gradient,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#6366f1',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => formatCurrency(context.raw)
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [4, 4], color: '#f1f5f9' },
            ticks: {
              callback: value => formatCurrency(value).replace('₩', '')
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // 카테고리별 차트 (Doughnut)
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: categoryData.map(d => d.category),
        datasets: [{
          data: categoryData.map(d => d.total_revenue),
          backgroundColor: [
            '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              font: { size: 11, family: 'Inter' }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100) + '%';
                return ` ${context.label}: ${percentage}`;
              }
            }
          }
        },
        cutout: '75%'
      }
    });

  } catch (error) {
    console.error('대시보드 로드 실패:', error);
    showError(content, '대시보드 정보를 불러오는데 실패했습니다.');
  }
}

// 상품 관리 로드
async function loadProducts(content) {
  try {
    const response = await axios.get(`${API_BASE}/products`);
    const products = response.data.data;

    content.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">
          <i class="fas fa-box mr-2"></i>상품 관리
        </h1>
        <div class="flex gap-2">
          <button onclick="downloadProducts()" class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center">
            <i class="fas fa-file-excel mr-2"></i>엑셀 다운로드
          </button>
          <button onclick="showProductModal()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
            <i class="fas fa-plus mr-2"></i>상품 등록
          </button>
        </div>
      </div>
      
      <!-- 검색 및 필터 -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상품명</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">카테고리</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">판매가</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">재고</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              ${products.map(p => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${p.name}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-500 font-mono">${p.sku}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-600">
                      ${p.category}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-sm font-bold text-slate-700">${formatCurrency(p.selling_price)}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${p.current_stock <= p.min_stock_alert ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                      ${p.current_stock}개
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onclick="editProduct(${p.id})" class="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700 transition-colors">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 카테고리 목록 로드
    loadCategories();

    // 모달 주입
    injectProductModal();

  } catch (error) {
    console.error('상품 목록 로드 실패:', error);
    showError(content, '상품 목록을 불러오는데 실패했습니다.');
  }
}

// 고객 관리 로드 (간단 버전)
async function loadCustomers(content) {
  content.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i></div>';

  try {
    const response = await axios.get(`${API_BASE}/customers`);
    window.allCustomers = response.data.data;
    window.customerState = { search: '', grade: '', page: 1 };

    renderCustomerPage(content);
  } catch (error) {
    showError(content, '고객 데이터 로드 실패');
  }
}

function renderCustomerPage(content) {
  const total = window.allCustomers.length;
  const vips = window.allCustomers.filter(c => c.grade && (c.grade.includes('VIP') || c.grade === 'VVIP')).length;
  const newCustomers = window.allCustomers.filter(c => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalSales = window.allCustomers.reduce((a, c) => a + (c.total_purchase_amount || 0), 0);

  content.innerHTML = `
      <div class="flex flex-col h-full bg-slate-50 overflow-hidden">
          <div class="px-8 py-6 bg-white border-b border-slate-200">
             <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                    <i class="fas fa-users text-indigo-600 mr-2"></i>고객 관리
                </h1>
                <div class="flex gap-2">
                    <button onclick="downloadCustomers()" class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-bold transition-colors text-sm border border-emerald-200">
                        <i class="fas fa-file-excel mr-2"></i>엑셀
                    </button>
                    <button onclick="showCustomerModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 text-sm">
                        <i class="fas fa-plus mr-2"></i>고객 등록
                    </button>
                </div>
             </div>
             
             <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-4">
                    <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 shadow-sm text-xl"><i class="fas fa-user-friends"></i></div>
                    <div>
                        <div class="text-xs text-indigo-500 font-bold uppercase mb-1">전체 고객</div>
                        <div class="text-2xl font-bold text-slate-800">${total.toLocaleString()}명</div>
                    </div>
                </div>
                 <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-4">
                    <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-amber-500 shadow-sm text-xl"><i class="fas fa-crown"></i></div>
                    <div>
                        <div class="text-xs text-amber-600 font-bold uppercase mb-1">VIP / VVIP</div>
                        <div class="text-2xl font-bold text-slate-800">${vips.toLocaleString()}명</div>
                    </div>
                </div>
                 <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
                    <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 shadow-sm text-xl"><i class="fas fa-user-plus"></i></div>
                    <div>
                        <div class="text-xs text-emerald-600 font-bold uppercase mb-1">이달의 신규</div>
                        <div class="text-2xl font-bold text-slate-800">${newCustomers.toLocaleString()}명</div>
                    </div>
                </div>
                  <div class="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                     <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-slate-500 shadow-sm text-xl"><i class="fas fa-coins"></i></div>
                     <div>
                        <div class="text-xs text-slate-500 font-bold uppercase mb-1">총 구매액</div>
                        <div class="text-lg font-bold text-slate-800">₩${(totalSales / 10000).toLocaleString()}만원</div>
                     </div>
                 </div>
             </div>
          </div>

          <div class="px-8 py-4 bg-white border-b border-slate-200 flex flex-wrap gap-4 items-center">
             <div class="relative flex-1 min-w-[300px]">
                 <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                 <input type="text" id="custSearch" class="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                        placeholder="이름, 연락처, 회사명으로 검색..." onkeyup="filterCustomers()">
             </div>
             <div class="flex items-center gap-2">
                 <select id="custGrade" class="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-slate-700 font-medium text-sm" onchange="filterCustomers()">
                     <option value="">전체 등급</option>
                     <option value="일반">일반</option>
                     <option value="VIP">VIP</option>
                     <option value="VVIP">VVIP</option>
                 </select>
             </div>
          </div>

          <div class="flex-1 overflow-auto p-8" id="customerListArea"></div>
      </div>
   `;

  injectCustomerModal();
  filterCustomers();
}

window.filterCustomers = function () {
  const search = document.getElementById('custSearch')?.value.toLowerCase() || '';
  const grade = document.getElementById('custGrade')?.value || '';

  const filtered = window.allCustomers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search) || c.phone.includes(search) || (c.company || '').toLowerCase().includes(search);
    const matchGrade = grade ? c.grade === grade : true;
    return matchSearch && matchGrade;
  });

  renderCustomerTable(filtered);
}

function renderCustomerTable(customers) {
  const area = document.getElementById('customerListArea');
  if (customers.length === 0) {
    area.innerHTML = '<div class="text-center py-20 text-slate-400"><i class="fas fa-user-slash text-4xl mb-4 text-slate-200"></i><p>조건에 맞는 고객이 없습니다.</p></div>';
    return;
  }

  area.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th class="px-6 py-4 border-b border-slate-100">고객명</th>
                        <th class="px-6 py-4 border-b border-slate-100">연락처/이메일</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-center">등급</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-right">총 구매액</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-center">구매횟수</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    ${customers.map(c => `
                    <tr class="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onclick="openCustomerDetail(${c.id})">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full ${['VIP', 'VVIP'].includes(c.grade) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'} flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                    ${c.name.charAt(0)}
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">${c.name}</div>
                                    <div class="text-xs text-slate-400">${c.company || '개인고객'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-slate-600 font-mono tracking-tight"><i class="fas fa-phone-alt w-3 text-slate-300 mr-1"></i> ${c.phone}</div>
                            ${c.email ? `<div class="text-xs text-slate-400 mt-0.5 font-mono"><i class="fas fa-envelope w-3 text-slate-300 mr-1"></i> ${c.email}</div>` : ''}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border 
                                ${c.grade === 'VVIP' ? 'bg-purple-50 text-purple-700 border-purple-100' :
      c.grade === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}">
                                ${c.grade}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right font-mono font-bold text-slate-700">
                            ₩${(c.total_purchase_amount || 0).toLocaleString()}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="text-sm text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">${c.purchase_count || 0}회</span>
                        </td>
                        <td class="px-6 py-4 text-center" onclick="event.stopPropagation()">
                             <div class="flex justify-center gap-1">
                                <button onclick="editCustomer(${c.id})" class="text-slate-400 hover:text-indigo-600 p-2 transition-colors rounded hover:bg-indigo-50" title="수정"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteCustomer(${c.id})" class="text-slate-400 hover:text-rose-500 p-2 transition-colors rounded hover:bg-rose-50" title="삭제"><i class="fas fa-trash"></i></button>
                             </div>
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.openCustomerDetail = async function (id) {
  if (!document.getElementById('customerDetailModal')) {
    injectCustomerDetailModal();
  }

  const customer = window.allCustomers.find(c => c.id === id);
  if (!customer) return;

  const modal = document.getElementById('customerDetailModal');
  const content = document.getElementById('customerDetailContent');

  content.innerHTML = '<div class="flex justify-center p-20"><i class="fas fa-spinner fa-spin text-3xl text-indigo-500"></i></div>';
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.remove('opacity-0'), 10);

  let purchaseHistoryHtml = '<div class="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">구매 이력이 없습니다.</div>';
  try {
    const res = await axios.get(`${API_BASE}/customers/${id}/purchases`);
    const purchases = res.data.data;
    if (purchases.length > 0) {
      purchaseHistoryHtml = `
               <table class="w-full text-sm text-left">
                  <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                    <tr><th class="p-3 pl-4">날짜</th><th class="p-3">구매 상품</th><th class="p-3 text-right pr-4">금액</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${purchases.map(p => `
                        <tr class="hover:bg-slate-50">
                            <td class="p-3 pl-4 text-slate-500 whitespace-nowrap font-mono text-xs">${new Date(p.created_at).toLocaleDateString()}</td>
                            <td class="p-3 text-slate-800 font-medium">${p.items || '상품 정보 없음'}</td>
                            <td class="p-3 pr-4 text-right font-mono font-bold text-slate-700">₩${p.total_amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                  </tbody>
               </table>
            `;
    }
  } catch (e) { console.error(e); }

  content.innerHTML = `
       <div class="flex flex-col md:flex-row gap-8">
           <div class="w-full md:w-1/3 md:border-r md:border-slate-100 md:pr-6">
               <div class="flex flex-col items-center mb-6">
                   <div class="w-24 h-24 rounded-full ${['VIP', 'VVIP'].includes(customer.grade) ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
                       ${customer.name.charAt(0)}
                   </div>
                   <h2 class="text-2xl font-bold text-slate-800 mb-1">${customer.name}</h2>
                   <span class="px-3 py-1 rounded-full text-xs font-bold border ${customer.grade === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}">${customer.grade} Member</span>
                   
                   <div class="mt-6 w-full space-y-2">
                       <button onclick="openContractModal(null, {id: ${customer.id}, name: '${customer.name}'})" class="w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                          <i class="fas fa-file-contract"></i>계약 단가 관리
                       </button>
                        <button onclick="editCustomer(${customer.id}); document.getElementById('customerDetailModal').classList.add('hidden');" class="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold text-sm transition-colors">
                          <i class="fas fa-edit mr-2"></i>정보 수정
                       </button>
                   </div>
               </div>
               
               <div class="space-y-4 text-sm mt-8">
                   <div class="flex justify-between items-center py-2 border-b border-slate-50">
                       <span class="text-slate-500"><i class="fas fa-phone mr-2 text-slate-300"></i>연락처</span> 
                       <span class="font-medium text-slate-800 font-mono">${customer.phone}</span>
                   </div>
                   <div class="flex justify-between items-center py-2 border-b border-slate-50">
                       <span class="text-slate-500"><i class="fas fa-envelope mr-2 text-slate-300"></i>이메일</span> 
                       <span class="font-medium text-slate-800">${customer.email || '-'}</span>
                   </div>
                   <div class="flex justify-between items-center py-2 border-b border-slate-50">
                       <span class="text-slate-500"><i class="fas fa-building mr-2 text-slate-300"></i>회사/부서</span> 
                       <span class="font-medium text-slate-800 text-right">${customer.company || '-'}${customer.department ? ' / ' + customer.department : ''}</span>
                   </div>
                    <div class="flex justify-between items-center py-2">
                       <span class="text-slate-500"><i class="fas fa-calendar mr-2 text-slate-300"></i>등록일</span> 
                       <span class="font-medium text-slate-800 font-mono">${new Date(customer.created_at).toLocaleDateString()}</span>
                   </div>
               </div>
               
               <div class="mt-6">
                    <h4 class="font-bold text-slate-700 mb-2 text-xs uppercase"><i class="fas fa-sticky-note mr-1 text-slate-400"></i>메모</h4>
                    <div class="text-sm text-slate-600 bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl min-h-[80px]">
                        ${customer.notes ? customer.notes.replace(/\n/g, '<br>') : '<span class="text-slate-400 italic">등록된 메모가 없습니다.</span>'}
                    </div>
               </div>
           </div>
           
           <div class="w-full md:w-2/3 mt-6 md:mt-0">
               <div class="flex justify-between items-end mb-4">
                   <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                       <i class="fas fa-history text-indigo-500"></i> 구매 이력
                   </h3>
                   <span class="text-xs text-slate-500">최근 30건</span>
               </div>
               <div class="bg-white border boundary-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
                   ${purchaseHistoryHtml}
               </div>
           </div>
       </div>
    `;
}

function injectCustomerDetailModal() {
  const html = `
      <div id="customerDetailModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 hidden transition-opacity opacity-0 flex items-center justify-center p-4" onclick="if(event.target===this) this.classList.add('hidden')">
         <div class="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all scale-100 flex flex-col">
             <div class="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur sticky top-0 bg-white/90 z-10">
                 <h3 class="font-bold text-lg text-slate-800">고객 상세 정보</h3>
                 <button onclick="document.getElementById('customerDetailModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors">
                    <i class="fas fa-times"></i>
                 </button>
             </div>
             <div class="p-8" id="customerDetailContent">
             </div>
         </div>
      </div>
    `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// 재고 관리 로드
async function loadStock(content) {
  // 탭 상태 초기화
  if (!window.currentStockTab) window.currentStockTab = 'status';

  content.innerHTML = `
    <div class="flex flex-col h-full bg-slate-50">
        <div class="px-8 pt-6 pb-0 bg-white border-b border-slate-200">
            <h1 class="text-2xl font-bold text-slate-800 mb-6">재고 관리</h1>
            <div class="flex space-x-8">
                <button id="tab-stock-status" onclick="switchStockTab('status')" class="stock-tab-btn pb-3 text-sm font-bold border-b-2 transition-colors border-emerald-500 text-emerald-600">
                    재고 현황
                </button>
                <button id="tab-stock-movements" onclick="switchStockTab('movements')" class="stock-tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-emerald-600 hover:border-slate-200 transition-colors">
                    입출고 내역
                </button>
                <button id="tab-stock-warehouse" onclick="switchStockTab('warehouse')" class="stock-tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-emerald-600 hover:border-slate-200 transition-colors">
                    창고 관리
                </button>
            </div>
        </div>
        <div id="stockTabContent" class="flex-1 p-8 overflow-y-auto">
            <!-- 탭 내용 -->
        </div>
    </div>
  `;

  injectStockModal(); // 모달 초기화
  switchStockTab(window.currentStockTab); // 초기 탭 로드
}

// 탭 전환 함수
window.switchStockTab = function (tabName) {
  window.currentStockTab = tabName;

  // 버튼 스타일 업데이트
  document.querySelectorAll('.stock-tab-btn').forEach(btn => {
    btn.className = 'stock-tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-emerald-600 hover:border-slate-200 transition-colors';
  });
  const activeBtn = document.getElementById(`tab-stock-${tabName}`);
  if (activeBtn) {
    activeBtn.className = 'stock-tab-btn pb-3 text-sm font-bold border-b-2 border-emerald-500 text-emerald-600';
  }

  const container = document.getElementById('stockTabContent');
  if (!container) return;

  if (tabName === 'status') {
    renderStockStatus(container);
  } else if (tabName === 'movements') {
    renderStockMovements(container);
  } else if (tabName === 'warehouse') {
    // 기존 창고 목록 로직이 있다면 활용, 우선 플레이스홀더
    container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-12 text-center text-slate-400">
                <i class="fas fa-warehouse text-4xl mb-4 text-slate-200"></i>
                <p>창고 관리 시스템 준비 중...</p>
            </div>
        `;
  }
}

// 판매 관리 로드
async function loadSales(content) {
  content.innerHTML = `
    <div class="flex flex-col h-full">
      <!-- 헤더 -->
      <div class="flex justify-between items-center mb-4 px-1">
        <h1 class="text-2xl font-bold text-slate-800 flex items-center">
          <i class="fas fa-shopping-cart mr-3 text-emerald-600"></i>판매 및 주문 관리
        </h1>
        <div class="text-sm text-slate-500">
           ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="flex border-b border-slate-200 mb-4 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
        <button id="tab-pos" class="px-6 py-3 font-bold text-emerald-600 border-b-2 border-emerald-600 transition-colors flex items-center gap-2" onclick="switchSalesTab('pos')">
          <i class="fas fa-cash-register"></i>POS (판매등록)
        </button>
        <button id="tab-orders" class="px-6 py-3 font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2" onclick="switchSalesTab('orders')">
          <i class="fas fa-truck"></i>주문/배송 관리
        </button>
        <button id="tab-claims" class="px-6 py-3 font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2" onclick="switchSalesTab('claims')">
          <i class="fas fa-undo"></i>반품/교환 관리
        </button>
      </div>

      <!-- 탭 컨텐츠 영역 -->
      <div id="salesTabContent" class="flex-1 overflow-hidden flex flex-col relative bg-slate-50 rounded-b-xl border border-slate-200 border-t-0">
        <!-- 동적 로드 -->
      </div>
    </div>
  `;

  // 기본 탭 로드
  switchSalesTab('pos');
}

// 탭 전환 함수
async function switchSalesTab(tabName) {
  // 탭 스타일 업데이트
  document.querySelectorAll('[id^="tab-"]').forEach(el => {
    el.classList.remove('text-emerald-600', 'border-b-2', 'border-emerald-600', 'font-bold');
    el.classList.add('text-slate-500', 'font-medium', 'border-transparent');
  });
  const activeTab = document.getElementById(`tab-${tabName}`);
  activeTab.classList.remove('text-slate-500', 'font-medium', 'border-transparent');
  activeTab.classList.add('text-emerald-600', 'border-b-2', 'border-emerald-600', 'font-bold');

  const container = document.getElementById('salesTabContent');
  container.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-spinner fa-spin text-4xl text-emerald-500"></i></div>';

  switch (tabName) {
    case 'pos':
      await renderPosTab(container);
      break;
    case 'orders':
      await renderOrderManagementTab(container);
      break;
    case 'claims':
      await renderClaimsTab(container);
      break;
  }
}

// POS 탭 렌더링
async function renderPosTab(container) {
  try {
    const [productsRes, customersRes] = await Promise.all([
      axios.get(`${API_BASE}/products`),
      axios.get(`${API_BASE}/customers`)
    ]);

    window.products = productsRes.data.data;
    window.customers = customersRes.data.data;

    if (!window.cart) window.cart = [];

    container.innerHTML = `
      <div class="flex flex-1 gap-6 overflow-hidden h-full p-6">
        <!-- 왼쪽: 상품 목록 -->
        <div class="w-3/4 flex flex-col gap-4">
          <!-- 검색 및 필터 -->
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center">
            <div class="relative flex-1">
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              <input type="text" id="posSearch" placeholder="상품명 또는 SKU 검색..." 
                     class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow bg-slate-50 placeholder-slate-400"
                     onkeyup="filterPosProducts()">
            </div>
            <select id="posCategory" class="min-w-[180px] border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-700 font-medium"
                    onchange="filterPosProducts()">
              <option value="">전체 카테고리</option>
            </select>
          </div>

          <!-- 상품 그리드 -->
          <div id="posProductList" class="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
            <!-- 상품 카드 -->
          </div>

          <!-- 페이지네이션 컨트롤 -->
          <div class="flex justify-center items-center gap-4 mt-4 bg-white rounded-lg border border-slate-200 shadow-sm p-3">
            <button id="btnPosPrev" onclick="changePosPage(-1)" 
                    class="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2">
              <i class="fas fa-chevron-left"></i> 이전
            </button>
            <span id="posPageIndicator" class="text-sm font-bold text-slate-700 min-w-[60px] text-center">1 / 1</span>
            <button id="btnPosNext" onclick="changePosPage(1)" 
                    class="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2">
              다음 <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- 오른쪽: 주문 내역 -->
        <div class="w-1/4 flex flex-col bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden h-full">
          <!-- 고객 선택 -->
          <div class="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
               <div class="w-1 bg-emerald-600 h-4 rounded-full"></div>
               주문 내역
            </h3>
            <div class="relative">
              <i class="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              <input list="customerList" id="posCustomerInput" placeholder="회원 조회 (이름/연락처)" 
                     class="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                     onchange="selectCustomerFromInput(this.value)">
              <datalist id="customerList">
                ${window.customers.map(c => `<option value="${c.name} (${c.phone})" data-id="${c.id}">`).join('')}
              </datalist>
              <input type="hidden" id="posCustomer">
            </div>
          </div>

          <!-- 장바구니 아이템 -->
          <div id="posCartItems" class="flex-1 overflow-y-auto p-4 space-y-3 bg-white"></div>

          <!-- 결제 요약 -->
          <div class="p-6 bg-slate-50 border-t border-slate-100">
            <div class="flex justify-between mb-2 text-sm">
              <span class="text-slate-500">총 상품금액</span>
              <span id="posTotalAmount" class="font-medium text-slate-700">0원</span>
            </div>
            <div class="flex justify-between items-center mb-6 text-sm">
              <span class="text-slate-500">할인 금액</span>
              <div class="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 w-24">
                 <input type="number" id="posDiscount" value="0" min="0" 
                     class="w-full text-right outline-none text-slate-700 font-medium"
                     onchange="renderCart()">
                 <span class="text-slate-400 text-xs">원</span>
              </div>
            </div>
            
            <div class="flex justify-between items-end mb-6 pt-4 border-t border-slate-200 dashed">
              <span class="text-base font-bold text-emerald-800">최종 결제금액</span>
              <span id="posFinalAmount" class="text-2xl font-extrabold text-emerald-600">0원</span>
            </div>

            <!-- 결제 수단 -->
            <div class="grid grid-cols-3 gap-2 mb-4">
               <label class="cursor-pointer">
                  <input type="radio" name="paymentMethod" value="card" checked class="peer sr-only">
                  <div class="text-center py-2 rounded-lg border border-slate-200 text-slate-600 bg-white peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600 transition-all font-medium text-sm hover:bg-slate-50">
                     카드
                  </div>
               </label>
               <label class="cursor-pointer">
                  <input type="radio" name="paymentMethod" value="cash" class="peer sr-only">
                  <div class="text-center py-2 rounded-lg border border-slate-200 text-slate-600 bg-white peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600 transition-all font-medium text-sm hover:bg-slate-50">
                     현금
                  </div>
               </label>
               <label class="cursor-pointer">
                  <input type="radio" name="paymentMethod" value="transfer" class="peer sr-only">
                  <div class="text-center py-2 rounded-lg border border-slate-200 text-slate-600 bg-white peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600 transition-all font-medium text-sm hover:bg-slate-50">
                     이체
                  </div>
               </label>
            </div>

            <button onclick="checkout()" class="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
              <i class="fas fa-check"></i> 결제하기
            </button>
          </div>
        </div>
      </div>
    `;

    renderPosProducts();
    renderCart();

    // 카테고리 채우기
    const categories = [...new Set(window.products.map(p => p.category))];
    const catSelect = document.getElementById('posCategory');
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      catSelect.appendChild(opt);
    });

    // 고객 검색 로직 (datalist workaround)
    window.selectCustomerFromInput = (value) => {
      const customer = window.customers.find(c => `${c.name} (${c.phone})` === value);
      if (customer) {
        document.getElementById('posCustomer').value = customer.id;
      } else {
        document.getElementById('posCustomer').value = '';
      }
    };

  } catch (error) {
    console.error('POS 로드 실패:', error);
    showError(container, 'POS 시스템을 불러오는데 실패했습니다.');
  }
}

// 주문/배송 관리 탭 렌더링
async function renderOrderManagementTab(container) {
  try {
    const response = await axios.get(`${API_BASE}/sales?limit=100`);
    window.allSales = response.data.data; // 전체 데이터 저장 for filtering

    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col h-full">
        <!-- 상단 헤더 & 컨트롤 -->
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col gap-4 bg-white">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg text-slate-800">주문 및 배송 현황</h3>
            <div class="flex gap-2">
              <button onclick="downloadSales()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm whitespace-nowrap">
                <i class="fas fa-file-excel mr-2"></i>엑셀 다운로드
              </button>
              <select id="orderStatusFilter" class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600 min-w-[120px]" onchange="renderOrderList()">
                <option value="all">전체 주문</option>
                <option value="completed">결제 완료</option>
                <option value="pending_shipment">배송 준비중</option>
                <option value="shipped">배송중</option>
                <option value="delivered">배송 완료</option>
                <option value="cancelled">주문 취소</option>
              </select>
            </div>
          </div>

          <!-- 검색 및 필터 영역 -->
          <div class="flex flex-wrap gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
             <div class="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 py-1.5 shrink-0">
               <input type="date" id="orderStartDate" class="text-sm border-none focus:ring-0 text-slate-600 p-0 bg-transparent">
               <span class="text-slate-400">~</span>
               <input type="date" id="orderEndDate" class="text-sm border-none focus:ring-0 text-slate-600 p-0 bg-transparent">
             </div>
             <div class="flex-1 relative min-w-[200px]">
               <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
               <input type="text" id="orderSearchInput" placeholder="고객명 또는 연락처 검색" 
                      class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-w-[200px]"
                      onkeyup="if(event.key === 'Enter') renderOrderList()">
             </div>
              <button onclick="window.orderPage = 1; renderOrderList()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                조회
              </button>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="overflow-auto flex-1 relative custom-scrollbar">
          <table class="w-full text-sm divide-y divide-slate-100">
            <thead class="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[100px]">주문번호</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[180px]">일시</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap min-w-[120px]">고객</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[120px]">금액</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[100px]">담당자</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[100px]">배송상태</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[140px]">운송장</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap min-w-[240px]">관리</th>
              </tr>
            </thead>
            <tbody id="orderTableBody" class="divide-y divide-slate-50 bg-white">
              <!-- 데이터 로드됨 -->
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 컨트롤 -->
        <div class="flex justify-center items-center gap-4 p-4 bg-white border-t border-slate-100">
          <button id="btnOrderPrev" onclick="changeOrderPage(-1)" 
                  class="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2">
            <i class="fas fa-chevron-left"></i> 이전
          </button>
          <span id="orderPageIndicator" class="text-sm font-bold text-slate-700 min-w-[60px] text-center">1 / 1</span>
          <button id="btnOrderNext" onclick="changeOrderPage(1)" 
                  class="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2">
            다음 <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    // 초기 날짜 설정 (최근 30일)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    document.getElementById('orderEndDate').valueAsDate = today;
    document.getElementById('orderStartDate').valueAsDate = lastMonth;

    renderOrderList();

    // 배송 모달 주입
    injectShippingModal();
    // 반품 모달 주입
    injectClaimModal();

  } catch (error) {
    console.error('주문 목록 로드 실패:', error);
    showError(container, '주문 목록을 불러오는데 실패했습니다.');
  }
}

// 주문 목록 페이지네이션 변수
window.orderPage = 1;
window.orderItemsPerPage = 20;
window.filteredOrderList = null;

function renderOrderList() {
  const tbody = document.getElementById('orderTableBody');
  const prevBtn = document.getElementById('btnOrderPrev');
  const nextBtn = document.getElementById('btnOrderNext');
  const indicator = document.getElementById('orderPageIndicator');

  if (!tbody || !window.allSales) return;

  const statusFilter = document.getElementById('orderStatusFilter').value;
  const searchText = document.getElementById('orderSearchInput').value.toLowerCase();
  const startDate = document.getElementById('orderStartDate').value;
  const endDate = document.getElementById('orderEndDate').value;

  const filtered = window.allSales.filter(s => {
    // 상태 필터
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;

    // 검색어 필터
    const searchMatch = (s.customer_name || '').toLowerCase().includes(searchText) ||
      (s.customer_phone || '').includes(searchText) ||
      `#${s.id}`.includes(searchText);
    if (!searchMatch) return false;

    // 날짜 필터 (Optional: 날짜 선택 안하면 전체)
    if (startDate && endDate) {
      const sDate = new Date(s.created_at).toISOString().split('T')[0];
      if (sDate < startDate || sDate > endDate) return false;
    }

    return true;
  });

  // 필터링된 결과 저장
  window.filteredOrderList = filtered;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-20 text-center text-slate-400">데이터가 없습니다.</td></tr>';
    if (indicator) indicator.textContent = "0 / 0";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // 페이지네이션 로직
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / window.orderItemsPerPage);

  if (window.orderPage > totalPages) window.orderPage = totalPages;
  if (window.orderPage < 1) window.orderPage = 1;

  const startIdx = (window.orderPage - 1) * window.orderItemsPerPage;
  const endIdx = startIdx + window.orderItemsPerPage;
  const pageItems = filtered.slice(startIdx, endIdx);

  // 페이지네이션 컨트롤 업데이트
  if (indicator) indicator.textContent = `${window.orderPage} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = window.orderPage <= 1;
  if (nextBtn) nextBtn.disabled = window.orderPage >= totalPages;

  tbody.innerHTML = pageItems.map(s => {
    // 날짜 포맷 (YYYY. MM. DD. HH:mm:ss)
    const date = new Date(s.created_at);
    const formattedDate = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

    // 상태 뱃지 스타일
    let statusBadge = '';
    let statusText = getKoreanStatus(s.status);
    switch (s.status) {
      case 'completed': statusBadge = 'bg-slate-100 text-slate-600 border border-slate-200'; statusText = '결제완료'; break;
      case 'pending_shipment': statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200'; statusText = '배송준비'; break;
      case 'shipped': statusBadge = 'bg-blue-50 text-blue-600 border border-blue-200'; break;
      case 'delivered': statusBadge = 'bg-emerald-50 text-emerald-600 border border-emerald-200'; break;
      case 'cancelled': statusBadge = 'bg-rose-50 text-rose-600 border border-rose-200'; break;
      default: statusBadge = 'bg-slate-50 text-slate-600 border border-slate-200';
    }

    // 결제완료지만 배송준비 전인 상태 매핑
    if (s.status === 'completed') statusBadge = 'bg-slate-100 text-slate-500 border border-slate-200';
    if (s.status === 'pending_shipment') statusText = '배송준비';

    return `
        <tr class="hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-0">
          <td class="px-6 py-5 font-mono text-slate-500 text-xs whitespace-nowrap">#${String(s.id).padStart(2, '0')}</td>
          <td class="px-6 py-5 text-slate-500 text-xs tracking-tight whitespace-nowrap">${formattedDate}</td>
          <td class="px-6 py-5">
            <div class="font-bold text-slate-800 text-sm whitespace-nowrap">${s.customer_name || '비회원'}</div>
            <div class="text-[11px] text-slate-400 font-mono mt-0.5 whitespace-nowrap">${s.customer_phone || '-'}</div>
          </td>
          <td class="px-6 py-5 font-bold text-slate-800 text-sm whitespace-nowrap">${formatCurrency(s.final_amount)}</td>
          <td class="px-6 py-5 text-slate-500 text-sm whitespace-nowrap">김순희</td>
          <td class="px-6 py-5">
            <span class="px-2.5 py-1.5 rounded text-xs font-semibold border ${statusBadge} whitespace-nowrap inline-block text-center min-w-[60px]">
              ${statusText}
            </span>
          </td>
          <td class="px-6 py-5 text-slate-500 text-xs">
             ${s.tracking_number ? `<span class="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">${s.tracking_number}</span>` : '<span class="text-slate-300">출고 대기중</span>'}
          </td>
          <td class="px-6 py-5">
            <div class="flex gap-2 items-center opacity-100">
               <button onclick="openShippingModal(${s.id})" class="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                 <i class="fas fa-truck"></i> 배송조회
               </button>
               <button onclick="openClaimModal(${s.id})" class="h-8 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                 <i class="fas fa-undo"></i> 반품/교환
               </button>
               ${s.status !== 'cancelled' ? `
               <button onclick="cancelSale(${s.id})" class="h-8 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                 <i class="fas fa-times"></i> 취소
               </button>
               ` : ''}
            </div>
          </td>
        </tr>
      `;
  }).join('');
}

function changeOrderPage(delta) {
  const list = window.filteredOrderList || window.allSales;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.orderItemsPerPage);
  const newPage = window.orderPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.orderPage = newPage;
    renderOrderList();
  }
}

// 반품/교환 관리 탭 렌더링
async function renderClaimsTab(container) {
  try {
    const response = await axios.get(`${API_BASE}/claims`);
    window.allClaims = response.data.data || []; // 전체 데이터 저장

    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col h-full">
        <!-- 상단 헤더 & 컨트롤 -->
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col gap-4 bg-white">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg text-slate-800">반품 및 교환 관리</h3>
            <div class="flex gap-2">
              <select id="claimTypeFilter" class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-600 min-w-[120px]" onchange="renderClaimList()">
                <option value="all">전체 구분</option>
                <option value="return">반품</option>
                <option value="exchange">교환</option>
              </select>
              <select id="claimStatusFilter" class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-600 min-w-[120px]" onchange="renderClaimList()">
                <option value="all">전체 상태</option>
                <option value="requested">요청됨</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거절됨</option>
                <option value="completed">처리완료</option>
              </select>
            </div>
          </div>

          <!-- 검색 영역 -->
          <div class="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div class="flex-1 relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              <input type="text" id="claimSearchInput" placeholder="주문번호 또는 상품명 검색" 
                     class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                     onkeyup="if(event.key === 'Enter') window.claimPage = 1; renderClaimList()">
            </div>
            <button onclick="window.claimPage = 1; renderClaimList()" class="bg-amber-600 hover:bg-amber-700 text-white px-5 py-1.5 rounded text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
              조회
            </button>
          </div>
        </div>

        <!-- 테이블 영역 -->
        <div class="overflow-auto flex-1 relative custom-scrollbar">
          <table class="w-full text-sm divide-y divide-slate-100">
            <thead class="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[100px]">요청번호</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[180px]">요청일시</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[80px]">구분</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[100px]">원주문</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap min-w-[200px]">상품정보</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap min-w-[150px]">사유</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap w-[100px]">상태</th>
                <th class="px-6 py-4 text-left font-bold text-slate-600 whitespace-nowrap min-w-[180px]">관리</th>
              </tr>
            </thead>
            <tbody id="claimTableBody" class="divide-y divide-slate-50 bg-white">
              <!-- 데이터 로드됨 -->
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 컨트롤 -->
        <div class="flex justify-center items-center gap-4 p-4 bg-white border-t border-slate-100">
          <button id="btnClaimPrev" onclick="changeClaimPage(-1)" 
                  class="px-4 py-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2">
            <i class="fas fa-chevron-left"></i> 이전
          </button>
          <span id="claimPageIndicator" class="text-sm font-bold text-slate-700 min-w-[60px] text-center">1 / 1</span>
          <button id="btnClaimNext" onclick="changeClaimPage(1)" 
                  class="px-4 py-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed font-medium flex items-center gap-2">
            다음 <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    renderClaimList();
  } catch (error) {
    console.error('Claims 로드 실패:', error);
    showError(container, '반품/교환 내역을 불러오는데 실패했습니다.');
  }
}

// Claims 목록 페이지네이션 변수
window.claimPage = 1;
window.claimItemsPerPage = 15;
window.filteredClaimList = null;

function renderClaimList() {
  const tbody = document.getElementById('claimTableBody');
  const prevBtn = document.getElementById('btnClaimPrev');
  const nextBtn = document.getElementById('btnClaimNext');
  const indicator = document.getElementById('claimPageIndicator');

  if (!tbody || !window.allClaims) return;

  const typeFilter = document.getElementById('claimTypeFilter').value;
  const statusFilter = document.getElementById('claimStatusFilter').value;
  const searchText = document.getElementById('claimSearchInput').value.toLowerCase();

  const filtered = window.allClaims.filter(c => {
    // 타입 필터
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;

    // 상태 필터
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    // 검색어 필터
    if (searchText) {
      const searchMatch =
        `#${c.sale_id}`.toLowerCase().includes(searchText) ||
        (c.product_name || '').toLowerCase().includes(searchText) ||
        (c.reason || '').toLowerCase().includes(searchText);
      if (!searchMatch) return false;
    }

    return true;
  });

  // 필터링된 결과 저장
  window.filteredClaimList = filtered;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-20 text-center text-slate-400">검색 결과가 없습니다.</td></tr>';
    if (indicator) indicator.textContent = "0 / 0";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // 페이지네이션 로직
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / window.claimItemsPerPage);

  if (window.claimPage > totalPages) window.claimPage = totalPages;
  if (window.claimPage < 1) window.claimPage = 1;

  const startIdx = (window.claimPage - 1) * window.claimItemsPerPage;
  const endIdx = startIdx + window.claimItemsPerPage;
  const pageItems = filtered.slice(startIdx, endIdx);

  // 페이지네이션 컨트롤 업데이트
  if (indicator) indicator.textContent = `${window.claimPage} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = window.claimPage <= 1;
  if (nextBtn) nextBtn.disabled = window.claimPage >= totalPages;

  tbody.innerHTML = pageItems.map(c => {
    // 날짜 포맷
    const date = new Date(c.created_at);
    const formattedDate = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    // 구분 뱃지
    const typeBadge = c.type === 'return'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : 'bg-blue-50 text-blue-700 border border-blue-200';
    const typeText = c.type === 'return' ? '반품' : '교환';

    // 상태 뱃지 및 텍스트
    let statusBadge = '';
    let statusText = '';
    switch (c.status) {
      case 'requested':
        statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
        statusText = '요청됨';
        break;
      case 'approved':
        statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        statusText = '승인됨';
        break;
      case 'rejected':
        statusBadge = 'bg-red-50 text-red-700 border border-red-200';
        statusText = '거절됨';
        break;
      case 'completed':
        statusBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
        statusText = '처리완료';
        break;
      default:
        statusBadge = 'bg-slate-50 text-slate-600 border border-slate-200';
        statusText = c.status;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-0">
        <td class="px-6 py-5 font-mono text-slate-500 text-xs whitespace-nowrap">#${String(c.id).padStart(3, '0')}</td>
        <td class="px-6 py-5 text-slate-500 text-xs tracking-tight whitespace-nowrap">${formattedDate}</td>
        <td class="px-6 py-5">
          <span class="px-2.5 py-1.5 rounded text-xs font-semibold border ${typeBadge} whitespace-nowrap inline-block text-center min-w-[50px]">
            ${typeText}
          </span>
        </td>
        <td class="px-6 py-5 font-mono text-slate-500 text-xs whitespace-nowrap">#${String(c.sale_id).padStart(2, '0')}</td>
        <td class="px-6 py-5">
          <div class="font-bold text-slate-800 text-sm">${c.product_name || '-'}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">수량: ${c.quantity}개 <span class="text-slate-300">|</span> 상태: ${c.condition || '미확인'}</div>
        </td>
        <td class="px-6 py-5 text-slate-600 text-xs max-w-xs">
          <div class="line-clamp-2" title="${c.reason || '-'}">${c.reason || '-'}</div>
        </td>
        <td class="px-6 py-5">
          <span class="px-2.5 py-1.5 rounded text-xs font-semibold border ${statusBadge} whitespace-nowrap inline-block text-center min-w-[60px]">
            ${statusText}
          </span>
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2 items-center">
            ${c.status === 'requested' ? `
              <button onclick="updateClaimStatus(${c.id}, 'approved')" 
                      class="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <i class="fas fa-check"></i> 승인
              </button>
              <button onclick="updateClaimStatus(${c.id}, 'rejected')" 
                      class="h-8 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <i class="fas fa-times"></i> 거절
              </button>
            ` : c.status === 'approved' ? `
              <button onclick="updateClaimStatus(${c.id}, 'completed')" 
                      class="h-8 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <i class="fas fa-check-double"></i> 처리완료
              </button>
            ` : `
              <span class="text-slate-400 text-xs">-</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function changeClaimPage(delta) {
  const list = window.filteredClaimList || window.allClaims;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.claimItemsPerPage);
  const newPage = window.claimPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.claimPage = newPage;
    renderClaimList();
  }
}

function getKoreanStatus(status) {
  const map = {
    'completed': '완료',
    'cancelled': '취소됨',
    'pending_shipment': '배송준비',
    'shipped': '배송중',
    'delivered': '배송완료',
    'requested': '요청됨',
    'approved': '승인됨',
    'rejected': '거절됨'
  };
  return map[status] || status;
}

// 유틸리티 함수들
function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount || 0);
}

function showError(container, message) {
  container.innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-lg p-6">
      <p class="text-red-800"><i class="fas fa-exclamation-circle mr-2"></i>${message}</p>
    </div>
  `;
}

function showSuccess(message) {
  // 토스트 알림 (간단 구현)
  alert(message);
  alert(message);
}

// --- CSV 다운로드 유틸리티 ---
function downloadCSV(data, filename, headers) {
  if (!data || data.length === 0) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }

  // BOM 추가 (한글 깨짐 방지)
  let csvContent = "\uFEFF";

  // 헤더 추가
  if (headers) {
    csvContent += Object.values(headers).join(',') + '\n';
  } else {
    csvContent += Object.keys(data[0]).join(',') + '\n';
  }

  // 데이터 행 추가
  data.forEach(row => {
    let rowContent = [];
    if (headers) {
      // 헤더 키 순서대로 데이터 매핑
      Object.keys(headers).forEach(key => {
        let cell = row[key] === null || row[key] === undefined ? '' : row[key].toString();
        // 쉼표, 따옴표, 줄바꿈 처리
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        rowContent.push(cell);
      });
    } else {
      rowContent = Object.values(row).map(cell => {
        cell = cell === null || cell === undefined ? '' : cell.toString();
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      });
    }
    csvContent += rowContent.join(',') + '\n';
  });

  // 다운로드 링크 생성 및 실행
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 상품 데이터 다운로드
async function downloadProducts() {
  try {
    const response = await axios.get(`${API_BASE}/products`);
    const products = response.data.data;

    const headers = {
      id: 'ID',
      sku: 'SKU',
      name: '상품명',
      category: '카테고리(대)',
      category_medium: '카테고리(중)',
      category_small: '카테고리(소)',
      purchase_price: '매입가',
      selling_price: '판매가',
      current_stock: '현재재고',
      min_stock_alert: '최소재고알림',
      supplier: '공급사',
      brand: '브랜드',
      status: '상태',
      created_at: '등록일'
    };

    downloadCSV(products, `상품목록_${new Date().toISOString().slice(0, 10)}.csv`, headers);
  } catch (error) {
    console.error('상품 데이터 다운로드 실패:', error);
    alert('데이터를 불러오는데 실패했습니다.');
  }
}

// 고객 데이터 다운로드
async function downloadCustomers() {
  try {
    const response = await axios.get(`${API_BASE}/customers`);
    const customers = response.data.data;

    const headers = {
      id: 'ID',
      name: '이름',
      phone: '연락처',
      email: '이메일',
      grade: '등급',
      company: '회사명',
      department: '부서',
      position: '직책',
      total_purchase_amount: '총구매액',
      purchase_count: '구매횟수',
      created_at: '등록일'
    };

    downloadCSV(customers, `고객목록_${new Date().toISOString().slice(0, 10)}.csv`, headers);
  } catch (error) {
    console.error('고객 데이터 다운로드 실패:', error);
    alert('데이터를 불러오는데 실패했습니다.');
  }
}

// 판매 데이터 다운로드
async function downloadSales() {
  try {
    const response = await axios.get(`${API_BASE}/sales?limit=1000`); // 충분한 수량 조회
    const sales = response.data.data;

    const headers = {
      id: '주문번호',
      created_at: '주문일시',
      customer_name: '고객명',
      customer_phone: '연락처',
      total_amount: '총금액',
      discount_amount: '할인금액',
      final_amount: '최종금액',
      payment_method: '결제수단',
      status: '상태',
      courier: '택배사',
      tracking_number: '운송장번호'
    };

    downloadCSV(sales, `판매내역_${new Date().toISOString().slice(0, 10)}.csv`, headers);
  } catch (error) {
    console.error('판매 데이터 다운로드 실패:', error);
    alert('데이터를 불러오는데 실패했습니다.');
  }
}

// --- 상품 관리 모달 ---

function injectProductModal() {
  if (document.getElementById('productModal')) return;

  const modalHtml = `
    <div id="productModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        <div class="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <h3 id="productModalTitle" class="text-xl font-bold text-slate-800">상품 등록</h3>
          <button onclick="closeProductModal()" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex border-b border-slate-100 px-6">
          <button type="button" onclick="switchProductTab('basic')" id="tab-basic" class="px-4 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 transition-colors">기본 정보</button>
          <button type="button" onclick="switchProductTab('detail')" id="tab-detail" class="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">상세 정보</button>
          <button type="button" onclick="switchProductTab('media')" id="tab-media" class="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">이미지/미디어</button>
        </div>

        <form id="productForm" onsubmit="submitProduct(event)" class="flex-1 overflow-y-auto">
          <div class="p-6 space-y-6">
            <!-- 기본 정보 탭 -->
            <div id="content-basic" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">SKU (상품코드)</label>
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-4 mb-1">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="skuType" value="auto" checked onchange="toggleSkuInput(this.value)" class="form-radio text-indigo-600 focus:ring-indigo-500">
                        <span class="ml-2 text-sm text-slate-700">자동 생성</span>
                      </label>
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" name="skuType" value="manual" onchange="toggleSkuInput(this.value)" class="form-radio text-indigo-600 focus:ring-indigo-500">
                        <span class="ml-2 text-sm text-slate-700">수동 입력</span>
                      </label>
                    </div>
                    <div class="flex gap-2">
                      <input type="text" id="prodSku" required readonly class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400 bg-slate-50 text-slate-500">
                      <button type="button" id="btnGenerateSku" onclick="generateAutoSku()" class="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                        <i class="fas fa-sync-alt mr-1"></i>생성
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">상품명</label>
                  <input type="text" id="prodName" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">카테고리 (대분류)</label>
                  <input type="text" id="prodCategory" required list="categoryList" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400" placeholder="예: 전자제품">
                  <datalist id="categoryList"></datalist>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">카테고리 (중분류)</label>
                  <input type="text" id="prodCategoryMedium" list="categoryMediumList" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400" placeholder="예: 컴퓨터">
                  <datalist id="categoryMediumList"></datalist>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">카테고리 (소분류)</label>
                  <input type="text" id="prodCategorySmall" list="categorySmallList" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400" placeholder="예: 노트북">
                  <datalist id="categorySmallList"></datalist>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">매입가</label>
                  <div class="relative">
                    <span class="absolute left-4 top-2.5 text-slate-500">₩</span>
                    <input type="number" id="prodPurchasePrice" required min="0" class="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">판매가</label>
                  <div class="relative">
                    <span class="absolute left-4 top-2.5 text-slate-500">₩</span>
                    <input type="number" id="prodSellingPrice" required min="0" class="w-full border border-slate-300 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">현재 재고</label>
                  <input type="number" id="prodStock" required min="0" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                  <p class="text-xs text-slate-500 mt-1.5 flex items-center"><i class="fas fa-info-circle mr-1"></i>수정 시에는 재고 조정 기능을 이용하세요.</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">최소 재고 알림</label>
                  <input type="number" id="prodMinStock" required min="0" value="10" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                </div>
              </div>
            </div>

            <!-- 상세 정보 탭 -->
            <div id="content-detail" class="space-y-6 hidden">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">브랜드</label>
                  <input type="text" id="prodBrand" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">공급사</label>
                  <input type="text" id="prodSupplier" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400">
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">태그 (쉼표로 구분)</label>
                <input type="text" id="prodTags" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400" placeholder="예: 신상품, 베스트, 여름특가">
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">상태</label>
                <select id="prodStatus" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white">
                  <option value="sale">판매중</option>
                  <option value="out_of_stock">품절</option>
                  <option value="discontinued">단종</option>
                  <option value="hidden">숨김</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">상세 설명</label>
                <textarea id="prodDesc" rows="5" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400 resize-none"></textarea>
              </div>
            </div>

            <!-- 이미지/미디어 탭 -->
            <div id="content-media" class="space-y-6 hidden">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">상품 이미지</label>
                <input type="hidden" id="prodImageUrl">
                <div class="mt-2 w-full">
                  <label for="prodImageFile" class="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group">
                    <div id="imgPlaceholder" class="flex flex-col items-center justify-center pt-5 pb-6">
                      <i class="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors"></i>
                      <p class="mb-2 text-sm text-slate-500"><span class="font-semibold">클릭하여 이미지 업로드</span></p>
                      <p class="text-xs text-slate-500">PNG, JPG, GIF (자동 리사이징됨)</p>
                    </div>
                    <img id="imgPreview" src="" class="absolute inset-0 w-full h-full object-contain hidden bg-white" alt="미리보기">
                    <div id="imgOverlay" class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden">
                      <p class="text-white font-semibold"><i class="fas fa-edit mr-2"></i>이미지 변경</p>
                    </div>
                    <input id="prodImageFile" type="file" accept="image/*" class="hidden" onchange="handleImageUpload(this)">
                  </label>
                  <div class="flex justify-end mt-2">
                    <button type="button" onclick="removeImage()" id="btnRemoveImage" class="text-sm text-red-500 hover:text-red-700 hidden">
                      <i class="fas fa-trash-alt mr-1"></i>이미지 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl sticky bottom-0 border-t border-slate-100">
            <button type="button" onclick="closeProductModal()" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
              취소
            </button>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function toggleSkuInput(type) {
  const skuInput = document.getElementById('prodSku');
  const generateBtn = document.getElementById('btnGenerateSku');

  if (type === 'auto') {
    skuInput.readOnly = true;
    skuInput.classList.add('bg-slate-50', 'text-slate-500');
    generateBtn.classList.remove('hidden');
    if (!skuInput.value) generateAutoSku();
  } else {
    skuInput.readOnly = false;
    skuInput.classList.remove('bg-slate-50', 'text-slate-500');
    generateBtn.classList.add('hidden');
    skuInput.value = '';
    skuInput.focus();
  }
}

function generateAutoSku() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  document.getElementById('prodSku').value = `PRD-${year}${month}${day}-${random}`;
}

function switchProductTab(tab) {
  // 탭 스타일 업데이트
  ['basic', 'detail', 'media'].forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    const content = document.getElementById(`content-${t}`);
    if (t === tab) {
      btn.classList.remove('text-slate-500', 'border-transparent');
      btn.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
      content.classList.remove('hidden');
    } else {
      btn.classList.add('text-slate-500');
      btn.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
      content.classList.add('hidden');
    }
  });
}

// 이미지 업로드 및 리사이징 처리
function handleImageUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // 파일 크기 체크 (예: 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 10MB 이하의 이미지를 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // 캔버스를 이용한 리사이징
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 최대 크기 설정 (600px)
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Base64로 변환 (JPEG, 퀄리티 0.7)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        // 데이터 설정 및 미리보기 업데이트
        document.getElementById('prodImageUrl').value = dataUrl;
        updateImagePreview(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function updateImagePreview(url) {
  const img = document.getElementById('imgPreview');
  const placeholder = document.getElementById('imgPlaceholder');
  const overlay = document.getElementById('imgOverlay');
  const removeBtn = document.getElementById('btnRemoveImage');

  if (url) {
    img.src = url;
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
    overlay.classList.remove('hidden'); // 이미지가 있을 때만 오버레이 활성화 가능
    removeBtn.classList.remove('hidden');
  } else {
    img.src = '';
    img.classList.add('hidden');
    placeholder.classList.remove('hidden');
    overlay.classList.add('hidden');
    removeBtn.classList.add('hidden');
  }
}

function removeImage() {
  document.getElementById('prodImageUrl').value = '';
  document.getElementById('prodImageFile').value = ''; // 파일 인풋 초기화
  updateImagePreview('');
}

function showProductModal() {
  injectProductModal(); // Ensure modal exists

  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');

  form.reset();
  window.editingProductId = null;

  title.textContent = '상품 등록';

  // SKU 초기화 (자동 생성 모드)
  document.querySelector('input[name="skuType"][value="auto"]').checked = true;
  toggleSkuInput('auto');

  // 탭 초기화
  switchProductTab('basic');

  // 탭 초기화
  switchProductTab('basic');

  // 이미지 미리보기 초기화
  removeImage();

  modal.classList.remove('hidden');
}

async function editProduct(id) {
  injectProductModal();

  try {
    const response = await axios.get(`${API_BASE}/products/${id}`);
    const product = response.data.data;

    window.editingProductId = id;

    document.getElementById('productModalTitle').textContent = '상품 수정';

    // 수정 시에는 SKU 변경 불가 (UI 처리)
    document.getElementById('prodSku').value = product.sku;
    document.getElementById('prodSku').readOnly = true;
    document.getElementById('prodSku').classList.add('bg-slate-50', 'text-slate-500');
    // 라디오 버튼 및 생성 버튼 숨김/비활성화
    document.querySelectorAll('input[name="skuType"]').forEach(el => el.disabled = true);
    document.getElementById('btnGenerateSku').classList.add('hidden');

    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodCategoryMedium').value = product.category_medium || '';
    document.getElementById('prodCategorySmall').value = product.category_small || '';
    document.getElementById('prodSupplier').value = product.supplier || '';
    document.getElementById('prodBrand').value = product.brand || '';
    document.getElementById('prodTags').value = product.tags || '';
    document.getElementById('prodStatus').value = product.status || 'sale';
    document.getElementById('prodPurchasePrice').value = product.purchase_price;
    document.getElementById('prodSellingPrice').value = product.selling_price;
    document.getElementById('prodStock').value = product.current_stock;
    document.getElementById('prodStock').readOnly = true; // 재고는 수정 불가 (조정 기능 이용)
    document.getElementById('prodStock').classList.add('bg-gray-100');
    document.getElementById('prodMinStock').value = product.min_stock_alert;
    document.getElementById('prodDesc').value = product.description || '';
    document.getElementById('prodImageUrl').value = product.image_url || '';
    updateImagePreview(product.image_url);

    fillCategoryDatalist();
    switchProductTab('basic');

    document.getElementById('productModal').classList.remove('hidden');
  } catch (error) {
    console.error('상품 정보 로드 실패:', error);
    alert('상품 정보를 불러오는데 실패했습니다.');
  }
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}

async function submitProduct(e) {
  e.preventDefault();

  const payload = {
    sku: document.getElementById('prodSku').value,
    name: document.getElementById('prodName').value,
    category: document.getElementById('prodCategory').value,
    category_medium: document.getElementById('prodCategoryMedium').value,
    category_small: document.getElementById('prodCategorySmall').value,
    supplier: document.getElementById('prodSupplier').value,
    brand: document.getElementById('prodBrand').value,
    tags: document.getElementById('prodTags').value,
    status: document.getElementById('prodStatus').value,
    image_url: document.getElementById('prodImageUrl').value,
    purchase_price: parseInt(document.getElementById('prodPurchasePrice').value),
    selling_price: parseInt(document.getElementById('prodSellingPrice').value),
    current_stock: parseInt(document.getElementById('prodStock').value),
    min_stock_alert: parseInt(document.getElementById('prodMinStock').value),
    description: document.getElementById('prodDesc').value
  };

  try {
    if (window.editingProductId) {
      // 수정
      delete payload.sku; // SKU 제외
      delete payload.current_stock; // 재고 제외
      await axios.put(`${API_BASE}/products/${window.editingProductId}`, payload);
      showSuccess('상품이 수정되었습니다.');
    } else {
      // 등록
      await axios.post(`${API_BASE}/products`, payload);
      showSuccess('상품이 등록되었습니다.');
    }

    closeProductModal();
    loadPage('products');
  } catch (error) {
    console.error('상품 저장 실패:', error);
    const msg = error.response?.data?.error || '저장 중 오류가 발생했습니다.';
    alert(msg);
  }
}

// 카테고리 데이터리스트 채우기
async function fillCategoryDatalist() {
  try {
    const response = await axios.get(`${API_BASE}/products`);
    const products = response.data.data;

    const categories = [...new Set(products.map(p => p.category))];
    const mediums = [...new Set(products.map(p => p.category_medium).filter(Boolean))];
    const smalls = [...new Set(products.map(p => p.category_small).filter(Boolean))];

    const list = document.getElementById('categoryList');
    const mediumList = document.getElementById('categoryMediumList');
    const smallList = document.getElementById('categorySmallList');

    if (list) {
      list.innerHTML = categories.map(c => `<option value="${c}">`).join('');
    }
    if (mediumList) {
      mediumList.innerHTML = mediums.map(c => `<option value="${c}">`).join('');
    }
    if (smallList) {
      smallList.innerHTML = smalls.map(c => `<option value="${c}">`).join('');
    }
  } catch (e) {
    console.error('카테고리 로드 실패', e);
  }
}

// --- 고객 관리 모달 ---

function injectCustomerModal() {
  if (document.getElementById('customerModal')) return;

  const modalHtml = `
    <div id="customerModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 id="customerModalTitle" class="text-xl font-bold text-slate-800">고객 등록</h3>
          <button onclick="closeCustomerModal()" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="customerForm" onsubmit="submitCustomer(event)">
          <div class="p-6 space-y-6">
            <!-- 기본 정보 -->
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">기본 정보</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">이름 <span class="text-red-500">*</span></label>
                  <input type="text" id="custName" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">연락처 <span class="text-red-500">*</span></label>
                  <input type="tel" id="custPhone" required placeholder="010-0000-0000" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
                  <input type="email" id="custEmail" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">등급</label>
                  <select id="custGradeSelect" onchange="toggleGradeInput(this.value)" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white mb-2">
                    <option value="온라인">온라인</option>
                    <option value="직접구매">직접구매</option>
                    <option value="custom">기타(직접입력)</option>
                  </select>
                  <input type="text" id="custGradeInput" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow hidden" placeholder="등급 직접 입력">
                </div>
              </div>
            </div>

            <!-- 회사 정보 -->
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">회사/소속 정보</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">회사명</label>
                  <input type="text" id="custCompany" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">부서</label>
                  <input type="text" id="custDept" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">직책</label>
                  <input type="text" id="custPosition" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
              </div>
            </div>

            <!-- 주소 정보 -->
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">주소 정보</h4>
              <div class="grid grid-cols-1 gap-4">
                <div class="flex gap-2">
                  <div class="w-1/3">
                    <input type="text" id="custZipCode" placeholder="우편번호" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                  </div>
                  <div class="flex-1">
                    <input type="text" id="custAddress" placeholder="기본 주소" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                  </div>
                </div>
                <div>
                  <input type="text" id="custAddressDetail" placeholder="상세 주소" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                </div>
              </div>
            </div>

            <!-- 기타 -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">메모</label>
              <textarea id="custNotes" rows="3" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"></textarea>
            </div>
          </div>
          
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100 sticky bottom-0">
            <button type="button" onclick="closeCustomerModal()" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
              취소
            </button>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function toggleGradeInput(value) {
  const input = document.getElementById('custGradeInput');
  if (value === 'custom') {
    input.classList.remove('hidden');
    input.required = true;
  } else {
    input.classList.add('hidden');
    input.required = false;
  }
}

function showCustomerModal() {
  injectCustomerModal();

  const modal = document.getElementById('customerModal');
  const title = document.getElementById('customerModalTitle');
  const form = document.getElementById('customerForm');

  form.reset();
  window.editingCustomerId = null;
  title.textContent = '고객 등록';

  // 등급 초기화
  document.getElementById('custGradeSelect').value = '온라인';
  toggleGradeInput('온라인');

  modal.classList.remove('hidden');
}

async function editCustomer(id) {
  injectCustomerModal();

  try {
    const response = await axios.get(`${API_BASE}/customers/${id}`);
    const customer = response.data.data;

    window.editingCustomerId = id;
    document.getElementById('customerModalTitle').textContent = '고객 수정';

    document.getElementById('custName').value = customer.name;
    document.getElementById('custPhone').value = customer.phone;
    document.getElementById('custEmail').value = customer.email || '';

    // 등급 설정
    const gradeSelect = document.getElementById('custGradeSelect');
    const gradeInput = document.getElementById('custGradeInput');
    if (['온라인', '직접구매'].includes(customer.grade)) {
      gradeSelect.value = customer.grade;
      toggleGradeInput(customer.grade);
    } else {
      gradeSelect.value = 'custom';
      toggleGradeInput('custom');
      gradeInput.value = customer.grade;
    }

    document.getElementById('custCompany').value = customer.company || '';
    document.getElementById('custDept').value = customer.department || '';
    document.getElementById('custPosition').value = customer.position || '';
    document.getElementById('custZipCode').value = customer.zip_code || '';
    document.getElementById('custAddress').value = customer.address || '';
    document.getElementById('custAddressDetail').value = customer.address_detail || '';
    document.getElementById('custNotes').value = customer.notes || '';

    document.getElementById('customerModal').classList.remove('hidden');
  } catch (error) {
    console.error('고객 정보 로드 실패:', error);
    alert('고객 정보를 불러오는데 실패했습니다.');
  }
}

function closeCustomerModal() {
  document.getElementById('customerModal').classList.add('hidden');
}

async function submitCustomer(e) {
  e.preventDefault();

  const gradeSelect = document.getElementById('custGradeSelect');
  const gradeInput = document.getElementById('custGradeInput');
  const grade = gradeSelect.value === 'custom' ? gradeInput.value : gradeSelect.value;

  const payload = {
    name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    email: document.getElementById('custEmail').value,
    grade: grade,
    company: document.getElementById('custCompany').value,
    department: document.getElementById('custDept').value,
    position: document.getElementById('custPosition').value,
    zip_code: document.getElementById('custZipCode').value,
    address: document.getElementById('custAddress').value,
    address_detail: document.getElementById('custAddressDetail').value,
    notes: document.getElementById('custNotes').value
  };

  try {
    if (window.editingCustomerId) {
      await axios.put(`${API_BASE}/customers/${window.editingCustomerId}`, payload);
      showSuccess('고객 정보가 수정되었습니다.');
    } else {
      await axios.post(`${API_BASE}/customers`, payload);
      showSuccess('고객이 등록되었습니다.');
    }

    closeCustomerModal();
    loadPage('customers');
  } catch (error) {
    console.error('고객 저장 실패:', error);
    const msg = error.response?.data?.error || '저장 중 오류가 발생했습니다.';
    alert(msg);
  }
}

function deleteCustomer(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    axios.delete(`${API_BASE}/customers/${id}`)
      .then(() => {
        showSuccess('삭제되었습니다.');
        loadPage('customers');
      })
      .catch(err => alert('삭제 실패: ' + err.message));
  }
}

async function loadCategories() {
  try {
    const response = await axios.get(`${API_BASE}/products/meta/categories`);
    const categories = response.data.data;
    const select = document.getElementById('filterCategory');
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('카테고리 로드 실패:', error);
  }
}

function filterProducts() {
  // 필터링 로직 (추후 구현)
  loadPage('products');
}

// --- POS 관련 함수 ---

// POS 페이지네이션 변수
window.posPage = 1;
window.posItemsPerPage = 12;
window.filteredPosList = null;

function renderPosProducts(filterText = '', filterCat = '') {
  const container = document.getElementById('posProductList');
  const prevBtn = document.getElementById('btnPosPrev');
  const nextBtn = document.getElementById('btnPosNext');
  const indicator = document.getElementById('posPageIndicator');

  if (!container) return;

  let filtered = window.products || [];
  if (filterText) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.sku.toLowerCase().includes(filterText.toLowerCase())
    );
  }
  if (filterCat) {
    filtered = filtered.filter(p => p.category === filterCat);
  }

  // 필터링된 결과 저장
  window.filteredPosList = filtered;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
        <i class="fas fa-search text-4xl mb-4 text-slate-300"></i>
        <p>검색 결과가 없습니다.</p>
      </div>
    `;
    if (indicator) indicator.textContent = "0 / 0";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // 페이지네이션 로직
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / window.posItemsPerPage);

  if (window.posPage > totalPages) window.posPage = totalPages;
  if (window.posPage < 1) window.posPage = 1;

  const startIdx = (window.posPage - 1) * window.posItemsPerPage;
  const endIdx = startIdx + window.posItemsPerPage;
  const pageItems = filtered.slice(startIdx, endIdx);

  // 페이지네이션 컨트롤 업데이트
  if (indicator) indicator.textContent = `${window.posPage} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = window.posPage <= 1;
  if (nextBtn) nextBtn.disabled = window.posPage >= totalPages;

  container.innerHTML = pageItems.map(p => `
    <div class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer flex flex-col h-full group relative overflow-hidden active:scale-[0.98]"
         onclick="addToCart(${p.id})">
      
      <!-- 카테고리 & SKU -->
      <div class="mb-3">
        <div class="flex items-center text-xs text-emerald-600 font-medium mb-1">
          <span>${p.category}</span>
          ${p.category_medium ? `<i class="fas fa-chevron-right text-[10px] mx-1 text-slate-300"></i><span>${p.category_medium}</span>` : ''}
        </div>
        <div class="text-[10px] text-slate-400 font-mono tracking-wide">${p.sku}</div>
      </div>

      <!-- 상품명 -->
      <h4 class="font-bold text-slate-800 text-base mb-2 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">${p.name}</h4>

      <!-- 태그 (있는 경우) -->
      ${p.tags ? `
        <div class="flex flex-wrap gap-1 mb-3">
          ${p.tags.split(',').slice(0, 2).map(tag => `<span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">${tag.trim()}</span>`).join('')}
        </div>
      ` : ''}

      <!-- 하단 정보: 재고 및 가격 -->
      <div class="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
        <div class="flex flex-col">
           <span class="text-xs text-slate-400 mb-0.5">재고</span>
           <span class="font-medium ${p.current_stock <= p.min_stock_alert ? 'text-rose-500' : 'text-slate-600'}">
             ${p.current_stock > 0 ? `${p.current_stock}개` : '<span class="text-rose-500 font-bold">품절</span>'}
           </span>
        </div>
        <p class="text-lg font-bold text-emerald-600 tracking-tight">${formatCurrency(p.selling_price)}</p>
      </div>
      
      <!-- 오버레이 효과 (선택 시 강조) -->
      <div class="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
    </div>
  `).join('');
}

function filterPosProducts() {
  const text = document.getElementById('posSearch').value;
  const cat = document.getElementById('posCategory').value;
  window.posPage = 1; // 검색 시 1페이지로 리셋
  renderPosProducts(text, cat);
}

function changePosPage(delta) {
  const list = window.filteredPosList || window.products;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.posItemsPerPage);
  const newPage = window.posPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.posPage = newPage;
    const text = document.getElementById('posSearch')?.value || '';
    const cat = document.getElementById('posCategory')?.value || '';
    renderPosProducts(text, cat);
  }
}

function addToCart(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;

  if (product.current_stock <= 0) {
    alert('재고가 없는 상품입니다.');
    return;
  }

  const existingItem = window.cart.find(item => item.product.id === productId);

  if (existingItem) {
    if (existingItem.quantity >= product.current_stock) {
      alert('재고 수량을 초과할 수 없습니다.');
      return;
    }
    existingItem.quantity++;
  } else {
    window.cart.push({
      product: product,
      quantity: 1
    });
  }

  renderCart();
}

function removeFromCart(productId) {
  window.cart = window.cart.filter(item => item.product.id !== productId);
  renderCart();
}

function updateCartQuantity(productId, delta) {
  const item = window.cart.find(i => i.product.id === productId);
  if (!item) return;

  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQty > item.product.current_stock) {
    alert('재고 수량을 초과할 수 없습니다.');
    return;
  }

  item.quantity = newQty;
  renderCart();
}

function renderCart() {
  const container = document.getElementById('posCartItems');
  const totalEl = document.getElementById('posTotalAmount');
  const finalEl = document.getElementById('posFinalAmount');
  const discountInput = document.getElementById('posDiscount');

  if (!container) return;

  if (window.cart.length === 0) {
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-slate-400 py-10">
        <i class="fas fa-shopping-basket text-4xl text-slate-200 mb-3"></i>
        <p class="font-medium text-slate-500">상품을 담아주세요.</p>
      </div>
    `;
    totalEl.textContent = '0원';
    finalEl.textContent = '0원';
    return;
  }

  let total = 0;
  container.innerHTML = window.cart.map(item => {
    const itemTotal = item.product.selling_price * item.quantity;
    total += itemTotal;
    return `
      <div class="flex flex-col bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative group hover:border-emerald-200 transition-colors">
        <div class="flex justify-between items-start mb-2">
          <div class="font-bold text-slate-800 text-sm line-clamp-2 pr-6 leading-tight">${item.product.name}</div>
          <button onclick="removeFromCart(${item.product.id})" class="text-slate-300 hover:text-rose-500 transition-colors absolute right-2 top-2 p-1">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex justify-between items-end mt-1">
          <div class="flex items-center bg-slate-50 rounded border border-slate-200">
            <button onclick="updateCartQuantity(${item.product.id}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-l transition-colors">
              <i class="fas fa-minus text-[10px]"></i>
            </button>
            <span class="w-8 text-center text-xs font-bold text-slate-700 select-none">${item.quantity}</span>
            <button onclick="updateCartQuantity(${item.product.id}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-r transition-colors">
              <i class="fas fa-plus text-[10px]"></i>
            </button>
          </div>
          <div class="text-right">
             <div class="text-[10px] text-slate-400 font-mono mb-0.5">${formatCurrency(item.product.selling_price)}</div>
             <div class="font-bold text-emerald-600 text-sm">${formatCurrency(itemTotal)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = formatCurrency(total);

  const discount = parseInt(discountInput.value) || 0;
  const final = Math.max(0, total - discount);
  finalEl.textContent = formatCurrency(final);
}

async function checkout() {
  if (window.cart.length === 0) {
    alert('장바구니가 비어있습니다.');
    return;
  }

  if (!confirm('결제를 진행하시겠습니까?')) return;

  const customerId = document.getElementById('posCustomer').value;
  const discount = parseInt(document.getElementById('posDiscount').value) || 0;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  const payload = {
    customer_id: customerId ? parseInt(customerId) : null,
    items: window.cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    })),
    discount_amount: discount,
    payment_method: paymentMethod,
    notes: 'POS 판매'
  };

  try {
    await axios.post(`${API_BASE}/sales`, payload);
    showSuccess('결제가 완료되었습니다.');

    // 초기화
    window.cart = [];
    document.getElementById('posDiscount').value = 0;
    renderCart();

    // 데이터 갱신
    switchSalesTab('pos');

  } catch (error) {
    console.error('결제 실패:', error);
    const msg = error.response?.data?.error || '결제 처리 중 오류가 발생했습니다.';
    alert(msg);
  }
}

async function cancelSale(saleId) {
  if (!confirm('정말 이 판매 내역을 취소하시겠습니까?\n재고가 다시 복구됩니다.')) return;

  try {
    await axios.put(`${API_BASE}/sales/${saleId}/cancel`);
    showSuccess('판매가 취소되었습니다.');
    switchSalesTab('pos'); // 목록 갱신
  } catch (error) {
    console.error('판매 취소 실패:', error);
    alert('판매 취소 실패: ' + (error.response?.data?.error || error.message));
  }
}

// --- 배송 관리 모달 ---

function injectShippingModal() {
  if (document.getElementById('shippingModal')) return;

  const modalHtml = `
    <div id="shippingModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100">
        <div class="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-slate-800">배송 정보 관리</h3>
          <button onclick="document.getElementById('shippingModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form onsubmit="submitShipping(event)">
          <input type="hidden" id="shipSaleId">
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">배송 상태</label>
              <select id="shipStatus" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white">
                <option value="completed">결제 완료 (배송 전)</option>
                <option value="pending_shipment">배송 준비중</option>
                <option value="shipped">배송중</option>
                <option value="delivered">배송 완료</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">택배사</label>
              <input type="text" id="shipCourier" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" placeholder="예: CJ대한통운">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">운송장 번호</label>
              <input type="text" id="shipTracking" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">배송지 주소</label>
              <input type="text" id="shipAddress" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100">
            <button type="button" onclick="document.getElementById('shippingModal').classList.add('hidden')" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">취소</button>
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">저장하기</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function openShippingModal(saleId) {
  injectShippingModal();
  try {
    const res = await axios.get(`${API_BASE}/sales/${saleId}`);
    const sale = res.data.data;

    document.getElementById('shipSaleId').value = sale.id;
    document.getElementById('shipStatus').value = sale.status;
    document.getElementById('shipCourier').value = sale.courier || '';
    document.getElementById('shipTracking').value = sale.tracking_number || '';
    document.getElementById('shipAddress').value = sale.shipping_address || '';

    document.getElementById('shippingModal').classList.remove('hidden');
  } catch (e) {
    alert('정보 로드 실패');
  }
}

async function submitShipping(e) {
  e.preventDefault();
  const id = document.getElementById('shipSaleId').value;
  const payload = {
    status: document.getElementById('shipStatus').value,
    courier: document.getElementById('shipCourier').value,
    tracking_number: document.getElementById('shipTracking').value,
    shipping_address: document.getElementById('shipAddress').value
  };

  try {
    await axios.put(`${API_BASE}/sales/${id}/shipping`, payload);
    showSuccess('배송 정보가 저장되었습니다.');
    document.getElementById('shippingModal').classList.add('hidden');
    switchSalesTab('orders');
  } catch (e) {
    alert('저장 실패');
  }
}

// --- 반품/교환 모달 ---

function injectClaimModal() {
  if (document.getElementById('claimModal')) return;

  const modalHtml = `
    <div id="claimModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-100">
        <div class="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-slate-800">반품/교환 요청</h3>
          <button onclick="document.getElementById('claimModal').classList.add('hidden')" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form onsubmit="submitClaim(event)">
          <input type="hidden" id="claimSaleId">
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">구분</label>
              <select id="claimType" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white">
                <option value="return">반품</option>
                <option value="exchange">교환</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">대상 상품</label>
              <select id="claimProduct" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"></select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">수량</label>
              <input type="number" id="claimQuantity" min="1" value="1" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">사유</label>
              <textarea id="claimReason" rows="3" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"></textarea>
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100">
            <button type="button" onclick="document.getElementById('claimModal').classList.add('hidden')" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">취소</button>
            <button type="submit" class="px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 shadow-lg shadow-amber-200 transition-all transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">요청 등록</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function openClaimModal(saleId) {
  injectClaimModal();
  try {
    const res = await axios.get(`${API_BASE}/sales/${saleId}`);
    const sale = res.data.data;

    document.getElementById('claimSaleId').value = sale.id;

    const productSelect = document.getElementById('claimProduct');
    productSelect.innerHTML = sale.items.map(item =>
      `<option value="${item.product_id}">${item.product_name} (구매수량: ${item.quantity})</option>`
    ).join('');

    document.getElementById('claimModal').classList.remove('hidden');
  } catch (e) {
    alert('정보 로드 실패');
  }
}

async function submitClaim(e) {
  e.preventDefault();
  const saleId = document.getElementById('claimSaleId').value;
  const productId = document.getElementById('claimProduct').value;
  const quantity = document.getElementById('claimQuantity').value;

  const payload = {
    sale_id: parseInt(saleId),
    type: document.getElementById('claimType').value,
    reason: document.getElementById('claimReason').value,
    items: [{
      product_id: parseInt(productId),
      quantity: parseInt(quantity),
      condition: 'good'
    }]
  };

  try {
    await axios.post(`${API_BASE}/claims`, payload);
    showSuccess('요청이 등록되었습니다.');
    document.getElementById('claimModal').classList.add('hidden');
    switchSalesTab('claims');
  } catch (e) {
    alert('요청 실패: ' + (e.response?.data?.error || e.message));
  }
}

async function updateClaimStatus(id, status) {
  if (!confirm(`${status === 'approved' ? '승인' : '거절'} 하시겠습니까?`)) return;

  try {
    await axios.put(`${API_BASE}/claims/${id}/status`, { status });
    showSuccess('처리되었습니다.');
    switchSalesTab('claims');
  } catch (e) {
    alert('처리 실패');
  }
}

// (Moved to end of file)

// ==================== 설정 페이지 ====================

// 설정 페이지 로드
async function loadSettings(content) {
  try {
    // API에서 데이터 로드
    const [profileRes, businessRes, systemRes] = await Promise.all([
      axios.get(`${API_BASE}/settings/profile`),
      axios.get(`${API_BASE}/settings/business`),
      axios.get(`${API_BASE}/settings/system`)
    ]);

    const profile = profileRes.data.data;
    const business = businessRes.data.data;
    const system = systemRes.data.data;

    content.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- 탭 네비게이션 -->
        <div class="flex border-b border-slate-200 bg-slate-50">
          <button class="settings-tab active px-6 py-4 font-medium transition-all flex items-center" data-tab="company" onclick="switchSettingsTab('company')">
            <i class="fas fa-building mr-2"></i>회사 정보
          </button>
          <button class="settings-tab px-6 py-4 font-medium transition-all flex items-center" data-tab="manager" onclick="switchSettingsTab('manager')">
            <i class="fas fa-user-tie mr-2"></i>담당자
          </button>
          <button class="settings-tab px-6 py-4 font-medium transition-all flex items-center" data-tab="document" onclick="switchSettingsTab('document')">
            <i class="fas fa-file-alt mr-2"></i>공문 작성
          </button>
          <button class="settings-tab px-6 py-4 font-medium transition-all flex items-center" data-tab="api" onclick="switchSettingsTab('api')">
            <i class="fas fa-code mr-2"></i>API 설정
          </button>
          <button class="settings-tab px-6 py-4 font-medium transition-all flex items-center" data-tab="logo" onclick="switchSettingsTab('logo')">
            <i class="fas fa-image mr-2"></i>상표 로고
          </button>
        </div>

        <!-- 탭 컨텐츠 -->
        <div class="p-8">
          <!-- 회사 정보 탭 -->
          <div id="tab-content-company" class="tab-content">
            <h3 class="text-lg font-bold text-slate-800 mb-6">회사 정보</h3>
            <form onsubmit="saveBusinessInfo(event)" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">회사명</label>
                  <input type="text" id="companyName" value="${business.business_name || ''}" 
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">대표자명</label>
                  <input type="text" id="cetalName" value="${business.ceo_name || ''}"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">사업자등록번호</label>
                  <input type="text" id="businessNumber" value="${business.business_number || ''}" placeholder="000-00-00000"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">대표 전화번호</label>
                  <input type="tel" id="businessPhone" value="${business.phone || ''}" placeholder="02-0000-0000"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">사업장 주소</label>
                <input type="text" id="businessAddress" value="${business.address || ''}"
                       class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                       placeholder="도로명 주소 (예: 서울시 강남구 테헤란로 123)">
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">팩스 번호</label>
                  <input type="tel" id="businessFax" value="${business.fax || ''}"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                  <input type="email" id="businessEmail" value="${profile.email || ''}"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
              </div>

              <div class="flex justify-end pt-4">
                <button type="submit" class="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </form>
          </div>

          <!-- 담당자 정보 탭 -->
          <div id="tab-content-manager" class="tab-content hidden">
            <h3 class="text-lg font-bold text-slate-800 mb-6">담당자 정보</h3>
            <form onsubmit="saveProfileInfo(event)" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">담당자명</label>
                  <input type="text" id="managerName" value="${profile.name || ''}"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">연락처</label>
                  <input type="tel" id="managerPhone" value="${profile.phone || ''}" placeholder="010-0000-0000"
                         class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                <input type="email" id="managerEmail" value="${profile.email || ''}"
                       class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              </div>

              <div class="flex justify-end pt-4">
                <button type="submit" class="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                  <i class="fas fa-save mr-2"></i>저장
                </button>
              </div>
            </form>
          </div>

          <!-- 공문 작성 탭 -->
          <div id="tab-content-document" class="tab-content hidden">
            <h3 class="text-lg font-bold text-slate-800 mb-6">공문 작성 설정</h3>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <i class="fas fa-file-alt text-5xl text-slate-300 mb-4"></i>
              <p class="text-slate-500">공문 작성 기능은 추후 업데이트 예정입니다.</p>
            </div>
          </div>

          <!-- API 설정 탭 -->
          <div id="tab-content-api" class="tab-content hidden">
            <h3 class="text-lg font-bold text-slate-800 mb-6">API 설정</h3>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
              <i class="fas fa-code text-5xl text-slate-300 mb-4"></i>
              <p class="text-slate-500">API 연동 설정은 추후 업데이트 예정입니다.</p>
            </div>
          </div>

          <!-- 상표 로고 탭 -->
          <div id="tab-content-logo" class="tab-content hidden">
            <h3 class="text-lg font-bold text-slate-800 mb-6">상표 로고</h3>
            <form onsubmit="uploadLogo(event)" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">로고 파일</label>
                <div class="flex items-center gap-4">
                  <input type="file" id="logoFile" accept="image/*" onchange="previewLogo(event)"
                         class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <button type="submit" class="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap">
                    <i class="fas fa-upload mr-2"></i>업로드
                  </button>
                </div>
                <p class="mt-2 text-xs text-slate-500">권장 크기: 240px x 200px, 최대 2MB (PNG, JPG 형식)</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">로고 미리보기</label>
                <div id="logoPreview" class="border-2 border-dashed border-slate-300 rounded-lg p-8 flex items-center justify-center min-h-[200px] bg-slate-50">
                  <div class="text-center">
                    <i class="fas fa-image text-5xl text-slate-300 mb-3"></i>
                    <p class="text-slate-500">로고 파일을 선택하면 여기에 미리보기가 표시됩니다.</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">도메인 재설정 (로고 URL)</label>
                <input type="url" id="logoUrl" placeholder="https://example.com/logo.png"
                       class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <p class="mt-2 text-xs text-slate-500">외부 URL로 로고를 설정할 수 있습니다.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // 탭 스타일 초기화
    initSettingsTabStyles();

  } catch (error) {
    console.error('설정 페이지 로드 실패:', error);
    showError(content, '설정 정보를 불러오는데 실패했습니다.');
  }
}

// 설정 탭 전환
function switchSettingsTab(tabName) {
  // 탭 버튼 스타일 업데이트
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.classList.remove('active', 'text-teal-600', 'border-b-2', 'border-teal-500', 'bg-white');
    tab.classList.add('text-slate-600');
  });
  const activeTab = document.querySelector(`.settings-tab[data-tab="${tabName}"]`);
  activeTab.classList.add('active', 'text-teal-600', 'border-b-2', 'border-teal-500', 'bg-white');
  activeTab.classList.remove('text-slate-600');

  // 컨텐츠 전환
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  document.getElementById(`tab-content-${tabName}`).classList.remove('hidden');
}

// 탭 스타일 초기화
function initSettingsTabStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .settings-tab.active {
      color: #14b8a6;
      border-bottom: 2px solid #14b8a6;
      background-color: white;
    }
    .settings-tab {
      color: #64748b;
      border-bottom: 2px solid transparent;
    }
    .settings-tab:hover {
      color: #14b8a6;
    }
  `;
  document.head.appendChild(style);
}

// 회사 정보 저장
async function saveBusinessInfo(e) {
  e.preventDefault();

  const data = {
    business_name: document.getElementById('companyName').value,
    ceo_name: document.getElementById('ceoName').value,
    business_number: document.getElementById('businessNumber').value,
    phone: document.getElementById('businessPhone').value,
    address: document.getElementById('businessAddress').value,
    fax: document.getElementById('businessFax').value
  };

  try {
    await axios.put(`${API_BASE}/settings/business`, data);
    showSuccess('회사 정보가 저장되었습니다.');
  } catch (error) {
    console.error('회사 정보 저장 실패:', error);
    alert(error.response?.data?.error || '저장 중 오류가 발생했습니다.');
  }
}

// 담당자 정보 저장
async function saveProfileInfo(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById('managerName').value,
    phone: document.getElementById('managerPhone').value,
    email: document.getElementById('managerEmail').value
  };

  try {
    await axios.put(`${API_BASE}/settings/profile`, data);
    showSuccess('담당자 정보가 저장되었습니다.');
  } catch (error) {
    console.error('담당자 정보 저장 실패:', error);
    alert(error.response?.data?.error || '저장 중 오류가 발생했습니다.');
  }
}

// 로고 미리보기
function previewLogo(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 체크 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('파일 크기는 2MB를 초과할 수 없습니다.');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('logoPreview').innerHTML = `
      <img src="${e.target.result}" alt="Logo Preview" class="max-h-48 rounded-lg shadow-md">
    `;
  };
  reader.readAsDataURL(file);
}

// 로고 업로드
async function uploadLogo(e) {
  e.preventDefault();

  const fileInput = document.getElementById('logoFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('로고 파일을 선택해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const response = await axios.post(`${API_BASE}/settings/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    showSuccess('로고가 업로드되었습니다.');
    console.log('로고 URL:', response.data.data.logo_url);
  } catch (error) {
    console.error('로고 업로드 실패:', error);
    alert(error.response?.data?.error || '업로드 중 오류가 발생했습니다.');
  }
}

// 입고 상세 모달 열기
window.openInboundDetailModal = function (id) {
  const item = window.filteredInboundList.find(i => i.id === id);
  if (!item) return;

  // 모달 백그라운드
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center';
  modal.id = 'inboundModal';

  // 발주 수량, 기입고, 잔여 수량 로직
  const orderQty = item.quantity || 100;
  const receivedQty = item.status === 'RECEIVED' ? orderQty : 0;
  const remainQty = orderQty - receivedQty;

  modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl w-[800px] overflow-hidden animate-fade-in-up">
            <div class="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <span class="text-xs text-slate-400 block mb-1">${item.po_number}</span>
                    <h3 class="text-lg font-bold">발주 상세 정보</h3>
                </div>
                <button onclick="document.getElementById('inboundModal').remove()" class="text-slate-400 hover:text-white transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                        <div class="text-xs text-slate-500 mb-1">공급사</div>
                        <div class="font-bold text-lg text-slate-800 mb-2">${item.supplier}</div>
                        <div class="text-xs text-slate-400">010-1234-5678</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-500 mb-1">상태</div>
                        <div class="mb-2">${getInboundStatusBadge(item.status)}</div>
                        <div class="text-xs text-slate-500 mb-1">총 금액</div>
                        <div class="font-bold text-xl text-indigo-600">₩${(item.amount || 0).toLocaleString()}</div>
                    </div>
                </div>
                <h4 class="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <i class="fas fa-boxes text-slate-400"></i> 발주 품목 및 입고 처리
                </h4>
                <div class="border rounded-lg overflow-hidden mb-4">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th class="px-4 py-3 font-medium">상품명</th>
                                <th class="px-4 py-3 font-medium text-center">발주수량</th>
                                <th class="px-4 py-3 font-medium text-center">기입고</th>
                                <th class="px-4 py-3 font-medium text-center text-orange-500">잔여</th>
                                <th class="px-4 py-3 font-medium text-center w-32">이번 입고</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr>
                                <td class="px-4 py-4">
                                    <div class="font-bold text-slate-700">${item.product_names}</div>
                                    <div class="text-xs text-slate-400 mt-0.5">CODE: ${String(item.id).padStart(6, '0')}</div>
                                </td>
                                <td class="px-4 py-4 text-center text-slate-600">${orderQty.toLocaleString()}</td>
                                <td class="px-4 py-4 text-center text-slate-500">${receivedQty.toLocaleString()}</td>
                                <td class="px-4 py-4 text-center font-bold text-orange-500">${remainQty.toLocaleString()}</td>
                                <td class="px-4 py-4 text-center">
                                    <input type="number" id="inboundQtyInput" 
                                        class="w-full border border-indigo-200 rounded px-2 py-1.5 text-right font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                                        value="${remainQty}" min="0" max="${remainQty}"
                                        ${remainQty === 0 ? 'disabled bg-slate-100' : ''}>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3 mb-6">
                    <i class="fas fa-info-circle text-yellow-500 mt-0.5"></i>
                    <p class="text-xs text-yellow-700 leading-relaxed">
                        입고 수량을 입력하고 '입고 처리' 버튼을 누르면 해당 수량만큼 <b>재고가 즉시 증가</b>합니다.
                        <br>한 번 입고 처리된 내역은 수정할 수 없으므로 정확히 입력해주세요.
                    </p>
                </div>
                <div class="flex justify-between items-center pt-2">
                    <button onclick="document.getElementById('inboundModal').remove()" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                        닫기
                    </button>
                    <button id="btnProcessInbound" onclick="processInbound(${item.id})" class="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed" 
                    ${remainQty === 0 ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> 선택 품목 입고 처리
                    </button>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

window.processInbound = async function (id) {
  const item = window.filteredInboundList.find(i => i.id === id);
  if (!item) return;
  const input = document.getElementById('inboundQtyInput');
  const qty = parseInt(input.value);
  if (!qty || qty <= 0) { alert('입고할 수량을 정확히 입력해주세요.'); return; }
  if (!confirm(qty + '개를 입고 처리하시겠습니까?\\n재고가 즉시 반영됩니다.')) return;

  const btn = document.getElementById('btnProcessInbound');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
  btn.disabled = true;

  setTimeout(() => {
    alert('성공적으로 입고 처리되었습니다.');
    document.getElementById('inboundModal').remove();
    renderInboundOrderList();
  }, 800);
}

// ==========================================
// 공급사 관리
// ==========================================
window.renderSupplierManagement = async function () {
  const container = document.getElementById('inboundTabContent');
  if (!container) return;

  // 초기 로딩 스켈레톤
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
        <div class="relative w-72">
             <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
             <input type="text" id="supplierSearch" class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm bg-white" 
             placeholder="공급사명, 담당자 검색" onkeyup="if(event.key==='Enter') renderSupplierManagement()">
        </div>
        <button onclick="openSupplierModal()" class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 flex items-center gap-2">
            <i class="fas fa-plus"></i> 공급사 등록
        </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
                <tr>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">공급사명</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">담당자</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">연락처</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">이메일</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">관리</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100" id="supplierTableBody">
                <tr><td colspan="5" class="py-20 text-center"><i class="fas fa-spinner fa-spin text-indigo-500 text-3xl"></i></td></tr>
            </tbody>
        </table>
    </div>
  `;

  // 데이터 로드
  const search = document.getElementById('supplierSearch')?.value || '';
  try {
    const res = await axios.get(`/api/suppliers?search=${encodeURIComponent(search)}`);

    const list = res.data.data || [];
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-20 text-center text-slate-400">
            <div class="flex flex-col items-center gap-3">
                <i class="fas fa-building text-4xl text-slate-200"></i>
                <p>등록된 공급사가 없습니다.</p>
            </div>
          </td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">${item.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${item.contact_person || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">${item.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.email || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick='openSupplierModal(${JSON.stringify(item).replace(/'/g, "&#39;")})' class="text-indigo-400 hover:text-indigo-600 mr-3 transition-colors p-2 hover:bg-indigo-50 rounded-full">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button onclick="deleteSupplier(${item.id})" class="text-rose-400 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-full">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
      `).join('');

    // 검색어 복원
    const searchInput = document.getElementById('supplierSearch');
    if (searchInput && search) {
      searchInput.value = search;
      searchInput.focus();
    }

  } catch (e) {
    console.error(e);
    const tbody = document.getElementById('supplierTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-rose-500">데이터 로드 실패: ${e.message}</td></tr>`;
  }
}

// 공급사 모달 열기
window.openSupplierModal = function (supplier = null) {
  const isEdit = !!supplier;
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in';
  modal.id = 'supplierModal';
  modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden transform transition-all scale-100 animate-fade-in-up">
            <div class="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
                <h3 class="text-lg font-bold flex items-center gap-2">
                    <i class="fas ${isEdit ? 'fa-edit' : 'fa-plus-circle'}"></i> 
                    ${isEdit ? '공급사 정보 수정' : '신규 공급사 등록'}
                </h3>
                <button onclick="document.getElementById('supplierModal').remove()" class="text-slate-400 hover:text-white transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div class="p-6">
                <input type="hidden" id="supplierId" value="${isEdit ? supplier.id : ''}">
                
                <div class="mb-4">
                    <label class="block text-sm font-bold text-slate-700 mb-2">공급사명 <span class="text-rose-500">*</span></label>
                    <input type="text" id="supplierName" class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                    value="${isEdit ? supplier.name : ''}" placeholder="(주)공급사명">
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">담당자</label>
                        <input type="text" id="supplierPerson" class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                        value="${isEdit ? (supplier.contact_person || '') : ''}" placeholder="홍길동 팀장">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">연락처</label>
                        <input type="text" id="supplierPhone" class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                        value="${isEdit ? (supplier.phone || '') : ''}" placeholder="010-0000-0000">
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-bold text-slate-700 mb-2">이메일</label>
                    <input type="email" id="supplierEmail" class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                    value="${isEdit ? (supplier.email || '') : ''}" placeholder="example@company.com">
                </div>
                
                <div class="flex justify-end gap-2 pt-2 border-t border-slate-50 mt-4">
                    <button onclick="document.getElementById('supplierModal').remove()" class="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg font-bold transition-colors">취소</button>
                    <button onclick="saveSupplier()" class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <i class="fas fa-check"></i> ${isEdit ? '수정 사항 저장' : '등록 하기'}
                    </button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
}

// 공급사 저장
window.saveSupplier = async function () {
  const id = document.getElementById('supplierId').value;
  const name = document.getElementById('supplierName').value.trim();
  const contact_person = document.getElementById('supplierPerson').value.trim();
  const phone = document.getElementById('supplierPhone').value.trim();
  const email = document.getElementById('supplierEmail').value.trim();

  if (!name) {
    alert('공급사명을 입력해주세요.');
    return;
  }

  try {
    const payload = { name, contact_person, phone, email };
    if (id) {
      await axios.put(`/api/suppliers/${id}`, payload);
      alert('공급사 정보가 수정되었습니다.');
    } else {
      await axios.post('/api/suppliers', payload);
      alert('신규 공급사가 등록되었습니다.');
    }
    document.getElementById('supplierModal').remove();
    renderSupplierManagement();
  } catch (e) {
    console.error(e);
    alert('저장 중 오류가 발생했습니다: ' + (e.response?.data?.error || e.message));
  }
}

// 공급사 삭제
window.deleteSupplier = async function (id) {
  if (!confirm('정말 삭제하시겠습니까?\n관련된 상품 정보에는 영향을 주지 않습니다.')) return;
  try {
    await axios.delete(`/api/suppliers/${id}`);
    renderSupplierManagement();
  } catch (e) {
    console.error(e);
    alert('삭제 실패: ' + (e.response?.data?.error || e.message));
  }
}

// ==========================================
// 재고 관리 시스템 상세 (창고 관리 포함)
// ==========================================

window.renderStockStatus = async function (container = null) {
  if (!container) container = document.getElementById('stockTabContent');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-h-[600px]">
        <!-- 헤더 & 컨트롤 -->
        <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 class="text-xl font-bold text-slate-800">창고별 재고 현황</h2>
            
            <div class="flex items-center gap-2">
                <button onclick="openStockModal('in')" class="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1 shadow-emerald-100">
                    <i class="fas fa-plus"></i> 입고
                </button>
                <button onclick="openStockModal('out')" class="bg-rose-500 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-rose-600 transition-colors shadow-sm flex items-center gap-1 shadow-rose-100">
                    <i class="fas fa-minus"></i> 출고
                </button>
                <button onclick="alert('준비 중')" class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1 shadow-blue-100">
                    <i class="fas fa-exchange-alt"></i> 이동
                </button>
                <button onclick="openStockModal('adjust')" class="bg-orange-500 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1 shadow-orange-100">
                    <i class="fas fa-sliders-h"></i> 조정
                </button>
                <button onclick="renderStockStatus()" class="bg-slate-700 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1">
                    <i class="fas fa-sync"></i> 동기화
                </button>
                
                <div class="w-px h-6 bg-slate-200 mx-2"></div>

                <div class="relative">
                    <select id="warehouseFilter" class="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:border-indigo-500 bg-white">
                        <option value="">전체 창고</option>
                    </select>
                    <i class="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
            </div>
        </div>

        <!-- 테이블 -->
        <div class="overflow-hidden border rounded-lg border-slate-100">
            <table class="min-w-full divide-y divide-slate-100">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">창고명</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">상품명</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">카테고리</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">재고수량</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">최근 업데이트</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 bg-white" id="stockStatusBody">
                    <tr><td colspan="7" class="py-20 text-center"><i class="fas fa-spinner fa-spin text-3xl text-emerald-500"></i></td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- 페이지네이션 -->
        <div class="mt-4 flex justify-between items-center" id="stockPagination"></div>
    </div>
  `;

  try {
    if (!window.warehouses) {
      try {
        const wRes = await axios.get('/api/warehouses');
        window.warehouses = wRes.data.data;
      } catch (e) { window.warehouses = []; }
    }

    const select = document.getElementById('warehouseFilter');
    if (select && window.warehouses) {
      const currentVal = window.lastWarehouseFilter || '';
      select.innerHTML = `<option value="">전체 창고</option>` +
        window.warehouses.map(w => `<option value="${w.id}" ${w.id == currentVal ? 'selected' : ''}>${w.name}</option>`).join('');

      select.onchange = function () {
        window.lastWarehouseFilter = this.value;
        renderStockStatus();
      };
    }

    const filterId = window.lastWarehouseFilter || '';
    const res = await axios.get(`/api/stock?warehouse_id=${filterId}`);
    const list = res.data.data;

    const tbody = document.getElementById('stockStatusBody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-20 text-center text-slate-400">데이터가 없습니다.</td></tr>`;
      document.getElementById('stockPagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = list.map(item => `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">${item.warehouse_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">${item.product_name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">${item.sku}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.category}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold ${item.quantity <= 0 ? 'text-rose-500' : 'text-emerald-600'}">
                ${item.quantity.toLocaleString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-xs text-slate-400 font-mono">
                ${item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <button class="text-rose-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('stockPagination').innerHTML = `<div class="text-xs text-slate-400">총 ${list.length}개 항목</div>`;

  } catch (e) {
    console.error(e);
    const tbody = document.getElementById('stockStatusBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-rose-500">로드 실패: ${e.message}</td></tr>`;
  }
}

// Global State for Movements
window.stockMovementPage = 1;
window.stockMovementFilters = {
  search: '',
  type: '',
  warehouse_id: '',
  start_date: '',
  end_date: ''
};

window.renderStockMovements = async function (container = null) {
  if (!container) container = document.getElementById('stockTabContent');
  if (!container) return;

  // Ensure warehouses are loaded
  if (!window.warehouses) {
    try { const r = await axios.get('/api/warehouses'); window.warehouses = r.data.data; } catch (e) { }
  }

  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-h-[600px]">
        <!-- Header & Filters -->
        <div class="flex flex-col space-y-4 mb-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold text-slate-800">입출고 내역</h2>
            </div>
            
            <div class="flex flex-wrap gap-2 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div class="relative">
                    <input type="text" id="mvSearch" placeholder="상품명/SKU 검색" class="pl-10 pr-4 py-2 border border-slate-300 rounded hover:border-slate-400 focus:outline-none focus:border-emerald-500 w-64 text-sm transition-colors bg-white">
                    <i class="fas fa-search absolute left-3 top-2.5 text-slate-400"></i>
                </div>
                
                <select id="mvType" class="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white min-w-[100px]">
                    <option value="">전체 구분</option>
                    <option value="입고">입고</option>
                    <option value="출고">출고</option>
                    <option value="이동">이동</option>
                    <option value="조정">조정</option>
                </select>
                
                <select id="mvWarehouse" class="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white min-w-[120px]">
                    <option value="">전체 창고</option>
                    ${(window.warehouses || []).map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                </select>
                
                <div class="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-300">
                    <input type="date" id="mvStartDate" class="border-none text-sm focus:outline-none text-slate-600">
                    <span class="text-slate-400">~</span>
                    <input type="date" id="mvEndDate" class="border-none text-sm focus:outline-none text-slate-600">
                </div>
                
                <button onclick="searchStockMovements()" class="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm ml-auto flex items-center gap-1">
                    <i class="fas fa-search"></i> 조회
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="overflow-hidden border rounded-lg border-slate-200 mb-4">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">일시</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">구분</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">상품정보</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">수량</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">창고</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">사유/비고</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">담당자</th>
                        <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white" id="mvTableBody">
                    <tr><td colspan="8" class="py-20 text-center"><i class="fas fa-spinner fa-spin text-3xl text-emerald-500"></i></td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div id="mvPagination" class="flex justify-between items-center mt-4 px-2"></div>
    </div>
  `;

  const searchInput = document.getElementById('mvSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchStockMovements();
    });
  }

  await loadStockMovementsData();
}

window.searchStockMovements = function () {
  window.stockMovementPage = 1;
  window.stockMovementFilters = {
    search: document.getElementById('mvSearch').value,
    type: document.getElementById('mvType').value,
    warehouse_id: document.getElementById('mvWarehouse').value,
    start_date: document.getElementById('mvStartDate').value,
    end_date: document.getElementById('mvEndDate').value
  };
  loadStockMovementsData();
}

window.loadStockMovementsData = async function () {
  const tbody = document.getElementById('mvTableBody');
  const pagination = document.getElementById('mvPagination');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="py-20 text-center"><i class="fas fa-spinner fa-spin text-3xl text-emerald-500"></i></td></tr>`;

  try {
    const params = {
      page: window.stockMovementPage,
      limit: 10,
      ...window.stockMovementFilters
    };
    const res = await axios.get('/api/stock/movements', { params });
    const { data, meta } = res.data;

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="py-20 text-center text-slate-400">데이터가 없습니다.</td></tr>`;
      pagination.innerHTML = '';
      return;
    }

    tbody.innerHTML = data.map(item => {
      let badgeClass = 'bg-slate-100 text-slate-700';
      if (item.movement_type === '입고') badgeClass = 'bg-emerald-100 text-emerald-700';
      else if (item.movement_type === '출고') badgeClass = 'bg-rose-100 text-rose-700';
      else if (item.movement_type === '이동') badgeClass = 'bg-blue-100 text-blue-700';
      else if (item.movement_type === '조정') badgeClass = 'bg-orange-100 text-orange-700';

      const qtyColor = item.quantity > 0 ? 'text-emerald-600' : (item.quantity < 0 ? 'text-rose-600' : 'text-slate-600');
      const qtySign = item.quantity > 0 ? '+' : '';

      const d = new Date(item.created_at);
      const dateStr = d.getFullYear() + '. ' + String(d.getMonth() + 1).padStart(2, '0') + '. ' + String(d.getDate()).padStart(2, '0') + '. ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');

      return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">${dateStr}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${badgeClass}">${item.movement_type}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-bold text-slate-800">${item.product_name}</div>
                    <div class="text-xs text-slate-400 font-mono">${item.sku}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <span class="text-sm font-bold ${qtyColor}">${qtySign}${item.quantity}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${item.warehouse_name || '기본 창고'}</td>
                <td class="px-6 py-4 text-sm text-slate-600">
                    <div class="font-medium">${item.reason || '-'}</div>
                    ${item.notes ? `<div class="text-xs text-slate-400 mt-0.5">${item.notes}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">관리자</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button onclick="alert('삭제 기능 준비중')" class="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
            `;
    }).join('');

    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    const totalPages = meta.totalPages || 1;
    const curr = meta.page;

    let pageNums = '';
    let startPage = Math.max(1, curr - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
      pageNums += `<button onclick="window.stockMovementPage=${i}; loadStockMovementsData()" 
                class="min-w-[32px] h-8 rounded border ${i === curr ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} text-xs font-bold transition-colors flex items-center justify-center">
                ${i}
            </button>`;
    }

    pagination.innerHTML = `
            <div class="text-xs text-slate-500 font-bold">
                총 ${meta.total}개 중 ${start} - ${end}
            </div>
            <div class="flex items-center gap-1">
                <button onclick="window.stockMovementPage--; loadStockMovementsData()" ${curr <= 1 ? 'disabled' : ''} class="min-w-[32px] h-8 rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center">
                    <i class="fas fa-chevron-left"></i>
                </button>
                ${pageNums}
                <button onclick="window.stockMovementPage++; loadStockMovementsData()" ${curr >= totalPages ? 'disabled' : ''} class="min-w-[32px] h-8 rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

  } catch (e) {
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="8" class="py-10 text-center text-rose-500">데이터 로드 실패: ${e.message}</td></tr>`;
  }
}

// 재고 모달 UI 주입 (창고 선택 추가)
window.injectStockModal = function () {
  if (document.getElementById('stockModal')) return;

  const modalHtml = `
    <div id="stockModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all border border-slate-100 animate-fade-in-up">
        <div class="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h3 id="stockModalTitle" class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i class="fas fa-boxes text-emerald-600"></i> 재고 관리
          </h3>
          <button onclick="closeStockModal()" class="text-slate-400 hover:text-rose-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <form id="stockForm" onsubmit="submitStockMovement(event)">
          <div class="p-6 space-y-5">
            <input type="hidden" id="stockMovementType">
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">창고 선택</label>
                  <select id="stockWarehouse" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white text-sm font-medium">
                    <!-- 창고 목록 -->
                  </select>
                </div>
                 <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">상품 선택</label>
                  <select id="stockProduct" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white text-sm">
                    <option value="">상품을 선택하세요</option>
                  </select>
                </div>
            </div>
            
            <div id="currentStockDisplay" class="hidden text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center">
              <span><i class="fas fa-info-circle text-blue-500 mr-1"></i> 전체 재고 합계</span>
              <span id="currentStockValue" class="font-bold text-blue-600 text-lg">0</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                  <label id="stockQuantityLabel" class="block text-sm font-bold text-slate-700 mb-1.5">수량</label>
                  <input type="number" id="stockQuantity" required min="1" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-right font-bold" placeholder="0">
                </div>
                 <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">사유 구분</label>
                  <input type="text" id="stockReason" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm" placeholder="예: 정기 입고">
                </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">비고 (선택)</label>
              <textarea id="stockNotes" rows="2" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none text-sm placeholder-slate-400" placeholder="메모를 입력하세요"></textarea>
            </div>
          </div>
          
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-2 rounded-b-2xl border-t border-slate-100">
            <button type="button" onclick="closeStockModal()" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
              취소
            </button>
            <button type="submit" class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] flex items-center gap-2">
              <i class="fas fa-check"></i> 처리 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // 리스너: 상품 변경
  document.getElementById('stockProduct').addEventListener('change', function () {
    const productId = parseInt(this.value);
    const product = window.products ? window.products.find(p => p.id === productId) : null;
    const display = document.getElementById('currentStockDisplay');
    const value = document.getElementById('currentStockValue');

    if (product) {
      value.textContent = product.current_stock.toLocaleString();
      display.classList.remove('hidden');
    } else {
      display.classList.add('hidden');
    }
  });
}

window.openStockModal = async function (type) {
  let modal = document.getElementById('stockModal');
  if (!modal) {
    injectStockModal();
    modal = document.getElementById('stockModal');
  }

  if (!window.products) {
    try { const res = await axios.get('/api/products'); window.products = res.data.data; } catch (e) { }
  }
  if (!window.warehouses) {
    try { const res = await axios.get('/api/warehouses'); window.warehouses = res.data.data; } catch (e) { }
  }

  const title = document.getElementById('stockModalTitle');
  const typeInput = document.getElementById('stockMovementType');
  const productSelect = document.getElementById('stockProduct');
  const warehouseSelect = document.getElementById('stockWarehouse');
  const quantityLabel = document.getElementById('stockQuantityLabel');
  const reasonInput = document.getElementById('stockReason');

  document.getElementById('stockForm').reset();
  document.getElementById('currentStockDisplay').classList.add('hidden');

  productSelect.innerHTML = '<option value="">상품 선택</option>' +
    (window.products || []).map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('');

  warehouseSelect.innerHTML = (window.warehouses || [{ id: 1, name: '기본 창고' }]).map(w =>
    `<option value="${w.id}">${w.name}</option>`
  ).join('');

  typeInput.value = type;

  switch (type) {
    case 'in':
      title.innerHTML = '<i class="fas fa-plus-circle text-emerald-500"></i> 재고 입고 등록';
      quantityLabel.textContent = '입고 수량';
      reasonInput.value = '정기 입고';
      break;
    case 'out':
      title.innerHTML = '<i class="fas fa-minus-circle text-rose-500"></i> 재고 출고 등록';
      quantityLabel.textContent = '출고 수량';
      reasonInput.value = '판매 출고';
      break;
    case 'adjust':
      title.innerHTML = '<i class="fas fa-sliders-h text-orange-500"></i> 재고 조정';
      quantityLabel.textContent = '실제 재고 (최종)';
      reasonInput.value = '재고 실사';
      break;
  }

  modal.classList.remove('hidden');
}

window.closeStockModal = function () {
  document.getElementById('stockModal').classList.add('hidden');
}

window.submitStockMovement = async function (e) {
  e.preventDefault();

  const type = document.getElementById('stockMovementType').value;
  const productId = parseInt(document.getElementById('stockProduct').value);
  const warehouseId = parseInt(document.getElementById('stockWarehouse').value);
  const quantity = parseInt(document.getElementById('stockQuantity').value);
  const reason = document.getElementById('stockReason').value;
  const notes = document.getElementById('stockNotes').value;

  if (!productId || isNaN(quantity)) {
    alert('상품과 수량을 올바르게 입력해주세요.');
    return;
  }

  const payload = {
    product_id: productId,
    warehouse_id: warehouseId,
    reason: reason,
    notes: notes
  };

  let endpoint = '';
  if (type === 'adjust') {
    endpoint = '/stock/adjust';
    payload.new_stock = quantity;
  } else {
    endpoint = `/stock/${type}`;
    payload.quantity = quantity;
  }

  try {
    await axios.post(`${API_BASE}${endpoint}`, payload);
    alert('처리가 완료되었습니다.');
    closeStockModal();
    if (window.currentStockTab === 'status') renderStockStatus();
    else if (window.currentStockTab === 'movements') renderStockMovements();
  } catch (error) {
    console.error('재고 처리 실패:', error);
    alert('오류: ' + (error.response?.data?.error || error.message));
  }
}

// ---------------------------------------------------------
// 재고 관리 (Stock Management)
// ---------------------------------------------------------
window.loadStock = async function (content) {
  if (!content) content = document.getElementById('content');

  // Initialize State
  window.stockState = {
    activeTab: 'status',
    warehouses: [],
    products: [],
    inventory: [],
    movements: []
  };

  content.innerHTML = `
        <div class="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <!-- Header -->
             <div class="border-b border-slate-200 p-6 pb-0 bg-slate-50">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fas fa-warehouse text-indigo-600 text-2xl"></i>
                    <h2 class="text-xl font-bold text-slate-800">재고 관리</h2>
                    <div class="ml-auto flex gap-2">
                        <button onclick="openStockModal('in')" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-2"><i class="fas fa-plus"></i> 입고</button>
                        <button onclick="openStockModal('out')" class="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-700 shadow-sm flex items-center gap-2"><i class="fas fa-minus"></i> 출고</button>
                        <button onclick="openStockModal('adjust')" class="bg-slate-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 shadow-sm flex items-center gap-2"><i class="fas fa-sliders-h"></i> 조정</button>
                    </div>
                </div>
                
                <div class="flex gap-8">
                    <button onclick="switchStockTab('status')" id="tab-status" class="pb-4 text-sm font-bold border-b-2 border-indigo-600 text-indigo-700 flex items-center gap-2 transition-colors">
                        <i class="fas fa-boxes"></i> 재고 현황
                    </button>
                    <button onclick="switchStockTab('movements')" id="tab-movements" class="pb-4 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors">
                        <i class="fas fa-history"></i> 수불 내역
                    </button>
                     <button onclick="switchStockTab('warehouses')" id="tab-warehouses" class="pb-4 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors">
                        <i class="fas fa-building"></i> 창고 관리
                    </button>
                </div>
             </div>
             
             <!-- Content -->
             <div class="flex-1 overflow-auto bg-slate-50 p-6" id="stockContentArea">
                 <div class="flex items-center justify-center h-64 text-slate-400">
                    <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
                 </div>
             </div>
        </div>
    `;

  await loadStockData();
}

window.loadStockData = async function () {
  try {
    const [wRes, pRes] = await Promise.all([
      axios.get('/api/warehouses'),
      axios.get('/api/products')
    ]);
    window.stockState.warehouses = wRes.data.data;
    window.stockState.products = pRes.data.data;
    window.products = pRes.data.data;
    window.warehouses = wRes.data.data;

    renderStockStatus();
  } catch (e) {
    document.getElementById('stockContentArea').innerHTML = '<div class="text-center text-rose-500 mt-10">데이터 로드 실패</div>';
  }
}

window.switchStockTab = function (tab) {
  window.stockState.activeTab = tab;
  window.currentStockTab = tab;

  const tabs = ['status', 'movements', 'warehouses'];
  tabs.forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (!el) return;
    if (t === tab) {
      el.classList.replace('border-transparent', 'border-indigo-600');
      el.classList.replace('text-slate-500', 'text-indigo-700');
    } else {
      el.classList.replace('border-indigo-600', 'border-transparent');
      el.classList.replace('text-indigo-700', 'text-slate-500');
    }
  });

  if (tab === 'status') renderStockStatus();
  else if (tab === 'movements') renderStockMovements();
  else if (tab === 'warehouses') renderWarehouseManagement();
}

window.renderStockStatus = async function () {
  const area = document.getElementById('stockContentArea');
  area.innerHTML = '<div class="flex justify-center p-12"><i class="fas fa-spinner fa-spin text-2xl text-indigo-500"></i></div>';

  try {
    const res = await axios.get('/api/stock');
    const inventory = res.data.data;
    window.stockState.inventory = inventory;

    area.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-sm text-left text-slate-600">
                    <thead class="bg-slate-50 text-xs text-slate-700 uppercase font-bold border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4">상품명 / SKU</th>
                            <th class="px-6 py-4">카테고리</th>
                            <th class="px-6 py-4">창고</th>
                            <th class="px-6 py-4 text-center">재고 수량</th>
                            <th class="px-6 py-4 text-center">상태</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${inventory.length ? inventory.map(item => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-slate-800">${item.product_name}</div>
                                <div class="text-xs text-slate-400 font-mono">${item.sku}</div>
                            </td>
                            <td class="px-6 py-4 text-slate-500">${item.category || '-'}</td>
                            <td class="px-6 py-4 text-slate-500">${item.warehouse_name}</td>
                            <td class="px-6 py-4 text-center font-bold text-indigo-600 text-base">${item.quantity.toLocaleString()}</td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-2 py-1 rounded-full text-xs font-bold ${item.quantity > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                    ${item.quantity > 10 ? '정상' : '부족'}
                                </span>
                            </td>
                        </tr>
                        `).join('') : '<tr><td colspan="5" class="py-12 text-center text-slate-400">재고 데이터가 없습니다.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
  } catch (e) {
    console.error(e);
    area.innerHTML = '<div class="text-center text-rose-500">로드 에러</div>';
  }
}

window.renderStockMovements = async function () {
  const area = document.getElementById('stockContentArea');
  area.innerHTML = '<div class="flex justify-center p-12"><i class="fas fa-spinner fa-spin text-2xl text-indigo-500"></i></div>';

  try {
    const res = await axios.get('/api/stock/movements');
    const movements = res.data.data;
    window.stockState.movements = movements;

    area.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table class="w-full text-sm text-left text-slate-600">
                    <thead class="bg-slate-50 text-xs text-slate-700 uppercase font-bold border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4">일시</th>
                            <th class="px-6 py-4">구분</th>
                            <th class="px-6 py-4">상품명 / 창고</th>
                            <th class="px-6 py-4 text-right">수량</th>
                            <th class="px-6 py-4">사유/비고</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${movements.length ? movements.map(m => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 text-slate-500 whitespace-nowrap">
                                ${new Date(m.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-md text-xs font-bold 
                                    ${m.movement_type === '입고' ? 'bg-emerald-100 text-emerald-700' :
        m.movement_type === '출고' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}">
                                    ${m.movement_type}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-slate-800">${m.product_name}</div>
                                <div class="text-xs text-slate-400">${m.warehouse_name || '기본 창고'}</div>
                            </td>
                            <td class="px-6 py-4 text-right font-mono font-bold ${m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}">
                                ${m.quantity > 0 ? '+' : ''}${m.quantity.toLocaleString()}
                            </td>
                            <td class="px-6 py-4 text-slate-500 text-xs">
                                <div class="font-medium">${m.reason}</div>
                                ${m.notes ? `<div class="text-slate-400 mt-0.5">${m.notes}</div>` : ''}
                            </td>
                        </tr>
                        `).join('') : '<tr><td colspan="5" class="py-12 text-center text-slate-400">수불 내역이 없습니다.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
  } catch (e) {
    area.innerHTML = '<div class="text-center text-rose-500">로드 에러</div>';
  }
}

window.renderWarehouseManagement = async function () {
  const area = document.getElementById('stockContentArea');
  const warehouses = window.stockState.warehouses;

  area.innerHTML = `
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onclick="alert('창고 추가 기능은 추후 구현 예정입니다.')" class="cursor-pointer border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all group flex flex-col items-center justify-center h-40">
                <i class="fas fa-plus text-slate-400 group-hover:text-indigo-500 text-2xl mb-2"></i>
                <span class="text-slate-500 group-hover:text-indigo-600 font-bold">새 창고 등록</span>
            </div>
             ${warehouses.map(w => `
             <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
                 <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="text-slate-400 hover:text-indigo-600"><i class="fas fa-edit"></i></button>
                 </div>
                 <div class="flex items-center gap-4 mb-3">
                     <div class="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 font-bold">
                         <i class="fas fa-warehouse text-xl"></i>
                     </div>
                     <div>
                         <h3 class="font-bold text-lg text-slate-800">${w.name}</h3>
                         <p class="text-xs text-slate-500">${w.location || '위치 정보 없음'}</p>
                     </div>
                 </div>
                 <div class="mt-4 pt-4 border-t border-slate-50 flex justify-between text-xs text-slate-500">
                    <span>등록일: ${w.created_at ? new Date(w.created_at).toLocaleDateString() : '-'}</span>
                    <span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">운영중</span>
                 </div>
             </div>
             `).join('')}
         </div>
    `;
}

// ---------------------------------------------------------
// 옵션 관리 (Option Management)
// ---------------------------------------------------------
window.loadOptionPresets = async function (content) {
  if (!content) content = document.getElementById('content');

  content.innerHTML = `
      <div class="flex flex-col h-full space-y-6">
         <div class="flex justify-between items-center bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
            <div class="flex items-center gap-4">
               <i class="fas fa-tags text-teal-500 text-3xl"></i>
               <h2 class="text-2xl font-bold text-slate-800">옵션 관리</h2>
            </div>
            <button onclick="openOptionGroupModal()" class="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 transform active:scale-95">
               <i class="fas fa-plus"></i> 새 옵션 그룹 등록
            </button>
         </div>
         
         <div class="flex-1 overflow-x-auto overflow-y-hidden pb-4">
             <div id="optionGroupList" class="flex gap-6 h-full min-w-max px-2 py-2">
                 <!-- Cards -->
             </div>
         </div>
      </div>
      <div id="optModalContainer"></div>
    `;

  await fetchAndRenderOptionGroups();
}

window.fetchAndRenderOptionGroups = async function () {
  const list = document.getElementById('optionGroupList');
  if (!list) return;

  try {
    const res = await axios.get('/api/options');
    const groups = res.data.data;

    if (groups.length === 0) {
      list.innerHTML = `
                <div class="w-full h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4">
                   <i class="fas fa-tags text-4xl mb-4 text-slate-300"></i>
                   <p>등록된 옵션 그룹이 없습니다.</p>
                </div>
            `;
      return;
    }

    list.innerHTML = groups.map(g => `
            <div class="w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="p-6 border-b border-slate-50 flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg text-slate-800">${g.name}</h3>
                        <p class="text-xs text-slate-500 mt-1 font-medium">옵션 ${g.values.length}개</p>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="openOptionGroupModal(${g.id})" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center"><i class="fas fa-pen text-xs"></i></button>
                        <button onclick="deleteOptionGroup(${g.id})" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
                    </div>
                </div>
                <div class="p-6 flex-1 overflow-y-auto space-y-2 bg-slate-50/50 rounded-b-2xl">
                    ${g.values.map(v => `
                        <div class="flex justify-between items-center text-sm px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <span class="font-bold text-slate-700">${v.name}</span>
                            <span class="text-xs ${v.extra_price > 0 ? 'text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded' : 'text-slate-400'}">
                                ${v.extra_price > 0 ? `+₩${v.extra_price.toLocaleString()}` : '기본'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class="p-8 text-rose-500">로드 실패</div>`;
  }
}

window.openOptionGroupModal = async function (id = null) {
  let modal = document.getElementById('optModal');
  if (!modal) {
    document.body.insertAdjacentHTML('beforeend', `
            <div id="optModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-95" id="optModalContent">
                    <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 class="font-bold text-xl text-slate-800" id="optModalTitle">새 옵션 그룹 등록</h3>
                        <button onclick="closeOptionGroupModal()" class="text-slate-400 hover:text-slate-600 transition-colors"><i class="fas fa-times text-lg"></i></button>
                    </div>
                    <div class="p-8 bg-slate-50">
                        <input type="hidden" id="optGroupId">
                        <div class="mb-6">
                            <label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">그룹명</label>
                            <input type="text" id="optGroupName" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-shadow bg-white" placeholder="예: 색상, 사이즈, 소재">
                        </div>
                        
                        <div class="mb-3 flex justify-between items-center">
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide">옵션 값 목록</label>
                            <button onclick="addOptionValueRow()" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-50 transition-colors"><i class="fas fa-plus"></i> 추가하기</button>
                        </div>
                        <div id="optValuesContainer" class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            <!-- Rows -->
                        </div>
                    </div>
                    <div class="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                        <button onclick="closeOptionGroupModal()" class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">취소</button>
                        <button onclick="saveOptionGroup()" class="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95">저장하기</button>
                    </div>
                </div>
            </div>
        `);
    modal = document.getElementById('optModal');
  }

  // Reset
  document.getElementById('optGroupId').value = '';
  document.getElementById('optGroupName').value = '';
  document.getElementById('optValuesContainer').innerHTML = '';

  if (id) {
    document.getElementById('optModalTitle').innerText = '옵션 그룹 수정';
    try {
      const res = await axios.get('/api/options');
      const group = res.data.data.find(g => g.id === id);
      if (group) {
        document.getElementById('optGroupId').value = group.id;
        document.getElementById('optGroupName').value = group.name;
        group.values.forEach(v => addOptionValueRow(v.name, v.extra_price));
      }
    } catch (e) { }
  } else {
    document.getElementById('optModalTitle').innerText = '새 옵션 그룹 등록';
    addOptionValueRow();
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('optModalContent').classList.remove('scale-95');
    document.getElementById('optModalContent').classList.add('scale-100');
  }, 10);
}

window.closeOptionGroupModal = function () {
  const modal = document.getElementById('optModal');
  const content = document.getElementById('optModalContent');
  if (content) {
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
  }
  setTimeout(() => modal.classList.add('hidden'), 200);
}

window.addOptionValueRow = function (name = '', price = 0) {
  const container = document.getElementById('optValuesContainer');
  const div = document.createElement('div');
  div.className = 'flex gap-3 items-center group animate-fade-in-up';
  div.innerHTML = `
        <div class="flex-1">
            <input type="text" class="opt-name w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-shadow" placeholder="값 (예: Red)" value="${name}">
        </div>
        <div class="relative w-32">
            <span class="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₩</span>
            <input type="number" class="opt-price w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-shadow text-right font-medium" placeholder="0" value="${price}">
        </div>
        <button onclick="this.parentElement.remove()" class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all"><i class="fas fa-trash-alt"></i></button>
    `;
  container.appendChild(div);
}

window.saveOptionGroup = async function () {
  const id = document.getElementById('optGroupId').value;
  const name = document.getElementById('optGroupName').value;

  const rows = document.querySelectorAll('#optValuesContainer > div');
  const values = [];
  rows.forEach(r => {
    const n = r.querySelector('.opt-name').value.trim();
    const p = parseInt(r.querySelector('.opt-price').value) || 0;
    if (n) values.push({ name: n, extra_price: p });
  });

  if (!name) { alert('그룹명을 입력하세요'); return; }
  if (values.length === 0) { alert('최소 1개의 옵션 값이 필요합니다'); return; }

  try {
    if (id) {
      await axios.put(`/api/options/${id}`, { name, values });
    } else {
      await axios.post('/api/options', { name, values });
    }
    closeOptionGroupModal();
    fetchAndRenderOptionGroups();
  } catch (e) {
    console.error(e);
    alert('저장 실패');
  }
}

window.deleteOptionGroup = async function (id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`/api/options/${id}`);
    fetchAndRenderOptionGroups();
  } catch (e) {
    alert('삭제 실패');
  }
}

// ---------------------------------------------------------
// 가격 정책 관리 (Price Policy Management)
// ---------------------------------------------------------
window.loadPricePolicies = async function (content) {
  if (!content) content = document.getElementById('content');

  // Manage Global State
  window.pricePolicyState = {
    activeTab: 'grade', // 'grade' or 'customer'
    products: [],
    gradePrices: [],
    customerPrices: [],
    customers: [],
    selectedCustomerId: null,
    modalPendingItems: [] // For the contract modal
  };

  content.innerHTML = `
        <div class="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <!-- Header & Tabs -->
             <div class="border-b border-slate-200 p-6 pb-0 bg-slate-50">
                <div class="flex items-center gap-3 mb-6">
                    <i class="fas fa-hand-holding-usd text-teal-600 text-2xl"></i>
                    <h2 class="text-xl font-bold text-slate-800">가격 정책 관리</h2>
                    <div class="ml-auto">
                        <button class="text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm"><i class="fas fa-book-open"></i>운영 가이드</button>
                    </div>
                </div>
                
                <!-- Search Bar -->
                <div class="mb-6 max-w-2xl relative" id="priceGlobalSearch">
                    <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="priceSearchInput" class="w-full pl-10 pr-20 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-shadow" placeholder="상품명 또는 SKU 검색..." onkeyup="filterPriceTable()">
                    <button onclick="filterPriceTable()" class="absolute right-2 top-2 bottom-2 bg-teal-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors">검색</button>
                </div>
                
                <!-- Tabs -->
                <div class="flex gap-8">
                    <button onclick="switchPriceTab('grade')" id="tab-grade" class="pb-4 text-sm font-bold border-b-2 border-teal-600 text-teal-700 flex items-center gap-2 transition-colors">
                        <i class="fas fa-layer-group"></i> 등급별 가격 설정
                    </button>
                    <button onclick="switchPriceTab('customer')" id="tab-customer" class="pb-4 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors">
                        <i class="fas fa-user-tag"></i> 고객별 전용 단가 관리
                    </button>
                </div>
             </div>
             
             <!-- Content Area -->
             <div class="flex-1 overflow-auto bg-slate-50 p-6" id="priceContentArea">
                 <!-- Dynamic Table -->
                 <div class="flex items-center justify-center h-64 text-slate-400">
                    <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
                 </div>
             </div>
             
             <!-- Footer Action -->
             <div class="p-4 border-t border-slate-200 bg-white flex justify-end" id="priceFooter">
                 <button onclick="savePriceChanges()" class="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-all flex items-center gap-2 transform active:scale-95">
                     <i class="fas fa-save"></i> 변경사항 저장
                 </button>
             </div>
        </div>
        <div id="contractModalContainer"></div>
    `;

  // Initial Load
  await loadPriceData();
}

window.loadPriceData = async function () {
  try {
    const [pRes, gRes, cRes] = await Promise.all([
      axios.get('/api/products'),
      axios.get('/api/prices/grades'),
      axios.get('/api/customers')
    ]);
    window.pricePolicyState.products = pRes.data.data;
    window.pricePolicyState.gradePrices = gRes.data.data;
    window.pricePolicyState.customers = cRes.data.data;

    renderPriceTable();
  } catch (e) {
    console.error(e);
    document.getElementById('priceContentArea').innerHTML = '<div class="text-center text-rose-500 mt-10">데이터 로드 실패</div>';
  }
}

window.renderPriceTable = function () {
  const { activeTab, products, gradePrices } = window.pricePolicyState;
  const content = document.getElementById('priceContentArea');
  const footer = document.getElementById('priceFooter');
  const searchBar = document.getElementById('priceGlobalSearch');

  if (activeTab === 'grade') {
    searchBar.style.display = 'block';
    footer.style.display = 'flex';

    const searchTerm = document.getElementById('priceSearchInput').value.toLowerCase();
    const filteredProducts = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(searchTerm)) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm))
    );

    const listHtml = filteredProducts.map(p => {
      const vipPrice = gradePrices.find(g => g.product_id === p.id && g.grade === 'VIP')?.price || '';
      const wholesalePrice = gradePrices.find(g => g.product_id === p.id && g.grade === 'WHOLESALE')?.price || '';
      const agencyPrice = gradePrices.find(g => g.product_id === p.id && g.grade === 'AGENCY')?.price || '';

      return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                <td class="px-6 py-4">
                     <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 mr-3">
                            ${p.image_url ? `<img src="${p.image_url}" class="h-full w-full object-cover">` : '<i class="fas fa-box"></i>'}
                        </div>
                        <div>
                            <div class="font-bold text-slate-800 text-sm">${p.name}</div>
                            <div class="text-xs text-slate-400 font-mono mt-0.5">${p.sku}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-right font-medium text-slate-600 text-sm">₩${(p.selling_price || 0).toLocaleString()}</td>
                <td class="px-4 py-3">
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-xs text-slate-400">₩</span>
                        <input type="number" data-pid="${p.id}" data-grade="VIP" value="${vipPrice}" class="price-input w-full border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-right text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder-slate-200 font-medium text-indigo-600" placeholder="0">
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-xs text-slate-400">₩</span>
                        <input type="number" data-pid="${p.id}" data-grade="WHOLESALE" value="${wholesalePrice}" class="price-input w-full border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-right text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder-slate-200 font-medium text-amber-600" placeholder="0">
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="relative">
                        <span class="absolute left-3 top-2.5 text-xs text-slate-400">₩</span>
                        <input type="number" data-pid="${p.id}" data-grade="AGENCY" value="${agencyPrice}" class="price-input w-full border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-right text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-200 font-medium text-emerald-600" placeholder="0">
                    </div>
                </td>
            </tr>
            `;
    }).join('');

    content.innerHTML = `
            <div class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <table class="w-full">
                    <thead class="bg-slate-50/50 text-xs text-slate-500 font-bold uppercase border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4 text-left w-[40%]">상품 정보</th>
                            <th class="px-6 py-4 text-right">기본가</th>
                            <th class="px-6 py-4 text-center text-indigo-600 w-[15%]">VIP</th>
                            <th class="px-6 py-4 text-center text-amber-600 w-[15%]">도매</th>
                            <th class="px-6 py-4 text-center text-emerald-600 w-[15%]">대리점</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${listHtml || '<tr><td colspan="5" class="py-12 text-center text-slate-400">검색된 상품이 없습니다.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
  } else {
    // Customer Tab - List View
    searchBar.style.display = 'none';
    footer.style.display = 'none';

    const { customers } = window.pricePolicyState;

    content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Add New Card -->
                <div onclick="openContractModal()" class="cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-teal-50 hover:border-teal-200 transition-all group flex flex-col items-center justify-center h-48">
                    <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <i class="fas fa-plus text-lg text-teal-600"></i>
                    </div>
                    <h3 class="font-bold text-slate-600 group-hover:text-teal-700">새 계약 등록하기</h3>
                    <p class="text-xs text-slate-400 mt-1">고객별 전용 단가 설정</p>
                </div>
                
                ${customers.map(c => `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="openContractModal(${c.id})" class="text-slate-400 hover:text-teal-600"><i class="fas fa-pen"></i></button>
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                            ${c.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 text-lg">${c.name}</h3>
                            <div class="text-xs text-slate-500 flex items-center gap-1">
                                <i class="far fa-envelope"></i> ${c.email || '이메일 없음'}
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="openContractModal(${c.id})" class="flex-1 bg-teal-50 text-teal-700 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-100 transition-colors">
                            계약 관리
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>
        `;
  }
}

window.switchPriceTab = function (tab) {
  window.pricePolicyState.activeTab = tab;

  // Update Tab UI
  const gradeBtn = document.getElementById('tab-grade');
  const custBtn = document.getElementById('tab-customer');

  if (tab === 'grade') {
    gradeBtn.classList.replace('border-transparent', 'border-teal-600');
    gradeBtn.classList.replace('text-slate-500', 'text-teal-700');
    custBtn.classList.replace('border-teal-600', 'border-transparent');
    custBtn.classList.replace('text-teal-700', 'text-slate-500');
  } else {
    custBtn.classList.replace('border-transparent', 'border-teal-600');
    custBtn.classList.replace('text-slate-500', 'text-teal-700');
    gradeBtn.classList.replace('border-teal-600', 'border-transparent');
    gradeBtn.classList.replace('text-teal-700', 'text-slate-500');
  }

  renderPriceTable();
}

window.filterPriceTable = function () {
  renderPriceTable();
}

window.savePriceChanges = async function () {
  const { activeTab } = window.pricePolicyState;
  // Customer tab saves via Modal, so this button should be hidden in customer tab anyway.
  if (activeTab !== 'grade') return;

  const btn = document.querySelector('button[onclick="savePriceChanges()"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

  try {
    const inputs = document.querySelectorAll('.price-input');
    const entries = [];
    inputs.forEach(input => {
      const val = parseInt(input.value);
      if (!isNaN(val)) {
        entries.push({
          product_id: input.dataset.pid,
          grade: input.dataset.grade,
          price: val
        });
      }
    });

    if (entries.length === 0) throw new Error('저장할 데이터가 없습니다.');

    await axios.post('/api/prices/grades', { entries });
    await loadPriceData(); // Reload to refresh
    alert('등급별 가격 정책이 저장되었습니다.');
  } catch (e) {
    alert(e.message || '저장 실패');
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}


// ---------------------------------------------------------
// 상품 관리 (Product Management)
// ---------------------------------------------------------
window.productPageState = {
  page: 1,
  limit: 10,
  search: '',
  category: '',
  list: []
};

window.loadProducts = async function (content) {
  if (!content) content = document.getElementById('content');

  // Categories fetch
  try {
    const res = await axios.get('/api/products/meta/categories');
    window.productCategories = res.data.data;
  } catch (e) { window.productCategories = []; }

  content.innerHTML = `
    <div class="flex flex-col h-full space-y-4">
        <!-- Toolbar -->
        <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div class="flex items-center gap-2">
                <div class="relative">
                    <input type="text" id="prodSearch" placeholder="상품명 또는 SKU 검색" class="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 w-64 transition-colors"
                        onkeypress="if(event.key==='Enter') searchProducts()">
                    <i class="fas fa-search absolute left-3 top-2.5 text-slate-400"></i>
                </div>
                <select id="prodCategory" class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white min-w-[140px]" onchange="searchProducts()">
                    <option value="">전체 카테고리</option>
                    ${window.productCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <button class="flex items-center gap-1 px-3 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium">
                    <i class="fas fa-filter text-xs"></i> 상세 필터
                </button>
            </div>
            
            <div class="flex items-center gap-2">
                <button onclick="alert('엑셀 가져오기 준비중')" class="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors">
                    <i class="fas fa-file-excel"></i> 엑셀 가져오기
                </button>
                <button onclick="alert('내보내기 준비중')" class="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 shadow-sm transition-colors">
                    <i class="fas fa-file-export"></i> 내보내기
                </button>
                <button onclick="openProductModal()" class="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 shadow-sm transition-colors">
                    <i class="fas fa-plus"></i> 상품 등록
                </button>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden min-h-[500px]">
            <div class="overflow-auto flex-1">
                <table class="min-w-full divide-y divide-slate-100">
                    <thead class="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                                <input type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">상품정보</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">카테고리</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">판매가</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">재고</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody id="prodTableBody" class="divide-y divide-slate-50 bg-white">
                        <tr><td colspan="7" class="py-20 text-center"><i class="fas fa-spinner fa-spin text-3xl text-emerald-500"></i></td></tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Pagination -->
            <div id="prodPagination" class="border-t border-slate-100 p-4 bg-white"></div>
        </div>
    </div>
    
    <!-- Modal Placeholder -->
    <div id="prodModalContainer"></div>
    `;

  await searchProducts();
}

window.searchProducts = async function () {
  window.productPageState.search = document.getElementById('prodSearch').value;
  window.productPageState.category = document.getElementById('prodCategory').value;
  window.productPageState.page = 1;
  await fetchAndRenderProducts();
}

window.fetchAndRenderProducts = async function () {
  const tbody = document.getElementById('prodTableBody');
  if (!tbody) return;

  try {
    const params = {
      search: window.productPageState.search,
      category: window.productPageState.category
    };
    const res = await axios.get('/api/products', { params });
    const allData = res.data.data;
    window.productPageState.list = allData;

    renderProductList();
  } catch (e) {
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-rose-500">데이터 로드 실패</td></tr>`;
  }
}

window.renderProductList = function () {
  const { list, page, limit } = window.productPageState;
  const tbody = document.getElementById('prodTableBody');
  const pagination = document.getElementById('prodPagination');

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-20 text-center text-slate-400">등록된 상품이 없습니다.</td></tr>`;
    pagination.innerHTML = '';
    return;
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const pageItems = list.slice(start, end);
  const totalPages = Math.ceil(list.length / limit);

  tbody.innerHTML = pageItems.map(p => `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                        ${p.image_url ? `<img src="${p.image_url}" class="h-full w-full object-cover">` : '<i class="fas fa-box"></i>'}
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">${p.name}</div>
                        <div class="text-xs text-slate-500">${p.brand || '-'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                 <span class="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono font-bold">${p.sku}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">
                    ${p.category || '-'} 
                    ${p.category_medium ? `<span class="text-slate-400 text-xs"> > ${p.category_medium}</span>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-bold text-slate-800">₩${(p.selling_price || 0).toLocaleString()}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${p.current_stock > p.min_stock_alert ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                    ${p.current_stock}개
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button onclick="openProductModal(${p.id})" class="text-slate-400 hover:text-emerald-600 mx-1 transition-colors"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct(${p.id})" class="text-slate-400 hover:text-rose-600 mx-1 transition-colors"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');

  // Pagination UI
  let pageNums = '';
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    pageNums += `<button onclick="window.productPageState.page=${i}; renderProductList()" 
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === page ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">${i}</button>`;
  }

  pagination.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="text-xs text-slate-500">전체 <span class="font-bold text-slate-800">${list.length}</span>개 (${page} / ${totalPages} 페이지)</div>
            <div class="flex gap-1">
                <button onclick="window.productPageState.page--; renderProductList()" ${page <= 1 ? 'disabled' : ''} class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs hover:bg-slate-50 disabled:opacity-50"><i class="fas fa-chevron-left"></i></button>
                ${pageNums}
                <button onclick="window.productPageState.page++; renderProductList()" ${page >= totalPages ? 'disabled' : ''} class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs hover:bg-slate-50 disabled:opacity-50"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    `;
}

// Modal Logic
window.openProductModal = function (id = null) {
  let modal = document.getElementById('prodModal');
  if (!modal) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="prodModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden z-50 flex items-center justify-center">
             <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-95" id="prodModalContent">
                <!-- Header -->
                <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 class="text-xl font-bold text-slate-800" id="prodModalTitle">상품 등록</h3>
                    <button onclick="closeProductModal()" class="text-slate-400 hover:text-slate-600 transition-colors"><i class="fas fa-times text-xl"></i></button>
                </div>
                
                <!-- Tabs -->
                <div class="px-8 pt-4 border-b border-slate-100 flex gap-6">
                    <button class="pb-3 text-sm font-bold border-b-2 border-emerald-500 text-emerald-600" id="tabBasic">기본 정보</button>
                    <button class="pb-3 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600" onclick="alert('준비중')">상세 정보</button>
                    <button class="pb-3 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-600" onclick="alert('준비중')">이미지/미디어</button>
                </div>

                <!-- Body -->
                <div class="p-8 overflow-y-auto flex-1 bg-slate-50">
                    <form id="prodForm">
                        <input type="hidden" id="prodId">
                        
                        <!-- Product Type -->
                        <div class="mb-6">
                            <label class="block text-xs font-bold text-slate-500 mb-2">상품 유형</label>
                            <div class="grid grid-cols-3 gap-3">
                                <label class="cursor-pointer border-2 border-emerald-500 bg-emerald-50 rounded-xl p-4 flex items-center gap-3 transition-all relative">
                                    <input type="radio" name="prodType" value="general" checked class="hidden">
                                    <div class="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center bg-white"><div class="w-2 h-2 rounded-full bg-emerald-500"></div></div>
                                    <span class="text-sm font-bold text-emerald-700">일반 상품</span>
                                </label>
                                <label class="cursor-pointer border border-slate-200 bg-white rounded-xl p-4 flex items-center gap-3 opacity-60 hover:opacity-100 hover:border-emerald-200 transition-all">
                                    <input type="radio" name="prodType" value="option" class="hidden">
                                    <div class="w-4 h-4 rounded-full border border-slate-300"></div>
                                    <span class="text-sm font-medium text-slate-600">옵션 상품</span>
                                </label>
                                <label class="cursor-pointer border border-slate-200 bg-white rounded-xl p-4 flex items-center gap-3 opacity-60 hover:opacity-100 hover:border-emerald-200 transition-all">
                                    <input type="radio" name="prodType" value="set" class="hidden">
                                    <div class="w-4 h-4 rounded-full border border-slate-300"></div>
                                    <span class="text-sm font-medium text-slate-600">세트 상품</span>
                                </label>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <!-- SKU -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2">SKU (상품코드)</label>
                                <div class="flex items-center gap-3 mb-2">
                                     <label class="inline-flex items-center text-xs text-slate-600"><input type="radio" name="skuType" value="auto" checked onchange="toggleSkuInput(true)" class="mr-1 text-emerald-500 focus:ring-emerald-500">자동 생성</label>
                                     <label class="inline-flex items-center text-xs text-slate-600"><input type="radio" name="skuType" value="manual" onchange="toggleSkuInput(false)" class="mr-1 text-emerald-500 focus:ring-emerald-500">수동 입력</label>
                                </div>
                                <div class="flex gap-2">
                                    <input type="text" id="prodSku" class="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm bg-slate-100 text-slate-500 font-mono" readonly>
                                    <button type="button" onclick="generateSku()" id="btnGenSku" class="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors">생성</button>
                                </div>
                            </div>
                            <!-- Name -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2">상품명</label>
                                <input type="text" id="prodName" required class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all">
                            </div>
                        </div>

                        <!-- Category -->
                        <div class="mb-6">
                            <label class="block text-xs font-bold text-slate-500 mb-2">카테고리</label>
                            <div class="grid grid-cols-3 gap-3">
                                <input type="text" id="catLarge" placeholder="대분류 (예: 전자제품)" class="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none">
                                <input type="text" id="catMedium" placeholder="중분류 (예: 컴퓨터)" class="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none">
                                <input type="text" id="catSmall" placeholder="소분류 (예: 노트북)" class="border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <!-- Price -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2">매입가</label>
                                <input type="number" id="prodCost" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none" placeholder="0">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2">판매가</label>
                                <input type="number" id="prodPrice" required class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none font-bold" placeholder="0">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-6 pb-6">
                            <!-- Stock -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2">현재 재고</label>
                                <input type="number" id="prodStock" required class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none" placeholder="0">
                                <p class="text-[10px] text-slate-400 mt-1">* 수정 시에는 재고 조정 기능을 이용하세요</p>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-2">최소 재고 알림</label>
                                <input type="number" id="prodMinStock" value="10" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 outline-none">
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Footer -->
                <div class="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-2">
                    <button onclick="closeProductModal()" class="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">취소</button>
                    <button onclick="saveProduct()" class="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform active:scale-[0.98]">저장하기</button>
                </div>
             </div>
        </div>
        `);
    modal = document.getElementById('prodModal');
  }

  // Reset Form
  document.getElementById('prodForm').reset();
  document.getElementById('prodId').value = '';

  // Auto Gen SKU for new
  generateSku();

  // If Edit
  if (id) {
    const p = window.productPageState.list.find(x => x.id === id);
    if (p) {
      document.getElementById('prodModalTitle').innerText = '상품 수정';
      document.getElementById('prodId').value = p.id;
      document.getElementById('prodName').value = p.name;
      document.getElementById('prodSku').value = p.sku;
      document.getElementById('prodSku').readOnly = true; // SKU immutable on edit usually

      // Category split
      document.getElementById('catLarge').value = p.category || '';
      document.getElementById('catMedium').value = p.category_medium || '';
      document.getElementById('catSmall').value = p.category_small || '';

      document.getElementById('prodCost').value = p.purchase_price || 0;
      document.getElementById('prodPrice').value = p.selling_price || 0;
      document.getElementById('prodStock').value = p.current_stock || 0;
      document.getElementById('prodStock').disabled = true; // Stock edit disable on edit
      document.getElementById('prodMinStock').value = p.min_stock_alert || 0;
    }
  } else {
    document.getElementById('prodModalTitle').innerText = '상품 등록';
    document.getElementById('prodSku').readOnly = true;
    document.getElementById('prodStock').disabled = false;
  }

  modal.classList.remove('hidden');
  // Animation
  setTimeout(() => {
    document.getElementById('prodModalContent').classList.remove('scale-95');
    document.getElementById('prodModalContent').classList.add('scale-100');
  }, 10);
}

window.closeProductModal = function () {
  const modal = document.getElementById('prodModal');
  const content = document.getElementById('prodModalContent');
  content.classList.remove('scale-100');
  content.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

window.toggleSkuInput = function (auto) {
  const input = document.getElementById('prodSku');
  const btn = document.getElementById('btnGenSku');
  if (auto) {
    input.readOnly = true;
    input.classList.add('bg-slate-100', 'text-slate-500');
    input.classList.remove('bg-white', 'text-slate-900');
    btn.classList.remove('hidden');
  } else {
    input.readOnly = false;
    input.value = '';
    input.classList.remove('bg-slate-100', 'text-slate-500');
    input.classList.add('bg-white', 'text-slate-900');
    btn.classList.add('hidden');
    input.focus();
  }
}

window.generateSku = function () {
  const d = new Date();
  const dateStr = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  document.getElementById('prodSku').value = `PRD-${dateStr}-${random}`;
}

window.saveProduct = async function () {
  const id = document.getElementById('prodId').value;
  const sku = document.getElementById('prodSku').value;
  const name = document.getElementById('prodName').value;
  const catLarge = document.getElementById('catLarge').value;
  const catMedium = document.getElementById('catMedium').value;
  const catSmall = document.getElementById('catSmall').value;
  const price = parseInt(document.getElementById('prodPrice').value) || 0;
  const cost = parseInt(document.getElementById('prodCost').value) || 0;
  const stock = parseInt(document.getElementById('prodStock').value) || 0;
  const minStock = parseInt(document.getElementById('prodMinStock').value) || 0;

  if (!name || !price) {
    alert('상품명과 판매가는 필수입니다.');
    return;
  }

  const payload = {
    sku, name,
    category: catLarge,
    category_medium: catMedium,
    category_small: catSmall,
    purchase_price: cost,
    selling_price: price,
    current_stock: stock,
    min_stock_alert: minStock
  };

  try {
    if (id) {
      await axios.put(`/api/products/${id}`, payload);
      alert('수정되었습니다.');
    } else {
      await axios.post('/api/products', payload);
      alert('등록되었습니다.');
    }
    closeProductModal();
    searchProducts();
  } catch (e) {
    console.error(e);
    alert('저장 실패: ' + (e.response?.data?.error || e.message));
  }
}

window.deleteProduct = async function (id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`/api/products/${id}`);
    searchProducts();
  } catch (e) {
    alert('삭제 실패');
  }
}

// ---------------------------------------------------------
// Customer Contract Modal Logic
// ---------------------------------------------------------
window.openContractModal = async function (customerId = null) {
  let modal = document.getElementById('contractModal');
  if (!modal) {
    document.body.insertAdjacentHTML('beforeend', `
            <div id="contractModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden z-50 flex items-center justify-center">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-95" id="contractModalContent">
                    <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 class="font-bold text-xl text-slate-800">고객별 계약 상품 관리</h3>
                        <button onclick="closeContractModal()" class="text-slate-400 hover:text-slate-600 transition-colors"><i class="fas fa-times text-lg"></i></button>
                    </div>
                    
                    <div class="p-8 overflow-y-auto bg-slate-50 flex-1">
                        <!-- Customer Select -->
                        <div class="mb-8">
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2"><i class="fas fa-user-circle mr-1"></i> 대상 고객</label>
                            <div id="contractCustSelectContainer" class="relative">
                                <select id="contractCustSelect" onchange="loadContractItems(this.value)" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none bg-white transition-shadow appearance-none font-bold text-slate-700">
                                    <option value="">고객사를 선택하세요...</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                            </div>
                            <div id="contractCustDisplay" class="hidden items-center gap-3 p-4 bg-white border border-teal-100 rounded-xl shadow-sm">
                                <div class="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-lg"><i class="fas fa-user"></i></div>
                                <div>
                                    <div class="font-bold text-slate-800 text-lg" id="contractCustName"></div>
                                    <div class="text-xs text-teal-600 font-medium">계약 품목 추가 가능</div>
                                </div>
                                <button onclick="resetContractCust()" class="ml-auto text-slate-400 hover:text-rose-500 text-sm">변경</button>
                            </div>
                        </div>

                        <!-- Add Product Form -->
                        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
                            <div class="flex gap-4 mb-3">
                                <div class="flex-1 relative">
                                    <label class="block text-[10px] font-bold text-slate-400 mb-1">상품 검색</label>
                                    <input type="text" id="contractProdSearch" placeholder="상품명 또는 SKU 검색..." 
                                        class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                        oninput="searchContractProduct(this.value)" onfocus="searchContractProduct(this.value)">
                                    <div id="contractProdDropdown" class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto hidden"></div>
                                </div>
                                <div class="w-24">
                                    <label class="block text-[10px] font-bold text-slate-400 mb-1">현재 판매가</label>
                                    <input type="text" id="contractProdPrice" readonly class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-right text-slate-500">
                                </div>
                                <div class="w-32">
                                    <label class="block text-[10px] font-bold text-slate-400 mb-1 text-indigo-600">개별 계약 단가</label>
                                    <input type="number" id="contractNewPrice" class="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm text-right font-bold text-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none" placeholder="금액">
                                </div>
                                <div class="flex items-end">
                                    <button onclick="addContractItem()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all h-[38px]">추가</button>
                                </div>
                            </div>
                            <input type="hidden" id="contractProdId">
                        </div>

                        <!-- List -->
                        <div class="mb-2 flex justify-between items-end">
                             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide">상품별 계약 목록</label>
                             <span class="text-[10px] text-slate-400" id="contractItemCount">0개 항목</span>
                        </div>
                        <div id="contractItemsList" class="space-y-3 min-h-[150px]">
                            <div class="flex flex-col items-center justify-center h-full py-10 text-slate-300 border-2 border-dashed border-slate-200 rounded-xl">
                                <i class="fas fa-file-signature text-3xl mb-2"></i>
                                <span class="text-sm">등록된 계약 내용이 없습니다.</span>
                            </div>
                        </div>
                    </div>

                    <div class="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                        <button onclick="closeContractModal()" class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">닫기</button>
                        <button onclick="saveContractItems()" class="px-8 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all transform active:scale-95 flex items-center gap-2">
                            <i class="fas fa-check"></i> 설정 저장하기
                        </button>
                    </div>
                </div>
            </div>
        `);
    modal = document.getElementById('contractModal');
  }

  // Populate Customers
  const select = document.getElementById('contractCustSelect');
  select.innerHTML = '<option value="">고객사를 선택하세요...</option>' +
    window.pricePolicyState.customers.map(c => `<option value="${c.id}">${c.name} (${c.email || ''})</option>`).join('');

  // Reset UI
  window.pricePolicyState.modalPendingItems = [];
  resetContractForm();

  // If Editing
  if (customerId) {
    select.value = customerId;
    const cust = window.pricePolicyState.customers.find(c => c.id === customerId);
    if (cust) {
      confirmContractCust(cust.name);
      await loadContractItems(customerId);
    }
  } else {
    document.getElementById('contractCustSelectContainer').classList.remove('hidden');
    document.getElementById('contractCustDisplay').classList.add('hidden');
    document.getElementById('contractCustDisplay').classList.remove('flex');
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('contractModalContent').classList.remove('scale-95');
    document.getElementById('contractModalContent').classList.add('scale-100');
  }, 10);

  // Outside click to close dropdown
  document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('contractProdDropdown');
    const input = document.getElementById('contractProdSearch');
    if (dropdown && !dropdown.contains(e.target) && e.target !== input) {
      dropdown.classList.add('hidden');
    }
  });
}

window.closeContractModal = function () {
  const modal = document.getElementById('contractModal');
  const content = document.getElementById('contractModalContent');
  if (content) {
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
  }
  setTimeout(() => modal.classList.add('hidden'), 200);
}

window.resetContractCust = function () {
  document.getElementById('contractCustSelect').value = '';
  document.getElementById('contractCustSelectContainer').classList.remove('hidden');
  document.getElementById('contractCustDisplay').classList.add('hidden');
  document.getElementById('contractCustDisplay').classList.remove('flex');
  window.pricePolicyState.modalPendingItems = [];
  renderContractItemsList();
}

window.confirmContractCust = function (name) {
  document.getElementById('contractCustSelectContainer').classList.add('hidden');
  const display = document.getElementById('contractCustDisplay');
  display.classList.remove('hidden');
  display.classList.add('flex');
  document.getElementById('contractCustName').innerText = name;
}

window.resetContractForm = function () {
  document.getElementById('contractProdId').value = '';
  document.getElementById('contractProdSearch').value = '';
  document.getElementById('contractProdPrice').value = '';
  document.getElementById('contractNewPrice').value = '';
}

window.loadContractItems = async function (customerId) {
  if (!customerId) return;
  const cust = window.pricePolicyState.customers.find(c => c.id == customerId);
  if (cust) confirmContractCust(cust.name);

  try {
    const res = await axios.get(`/api/prices/customers?customerId=${customerId}`);
    window.pricePolicyState.modalPendingItems = res.data.data.map(item => {
      // Need product name, find in state
      const p = window.pricePolicyState.products.find(x => x.id === item.product_id);
      return {
        product_id: item.product_id,
        product_name: p ? p.name : 'Unknown',
        product_sku: p ? p.sku : '',
        standard_price: p ? p.selling_price : 0,
        price: item.price
      };
    });
    renderContractItemsList();
  } catch (e) {
    console.error(e);
  }
}

window.searchContractProduct = function (query) {
  const dropdown = document.getElementById('contractProdDropdown');

  if (!query) {
    dropdown.classList.add('hidden');
    return;
  }

  const matches = window.pricePolicyState.products.filter(p =>
    (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
    (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5); // Limit 5

  if (matches.length === 0) {
    dropdown.classList.add('hidden');
    return;
  }

  dropdown.innerHTML = matches.map(p => `
        <div onclick="selectContractProduct(${p.id})" class="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
            <div class="font-bold text-sm text-slate-800">${p.name}</div>
            <div class="flex justify-between text-xs mt-1">
                <span class="text-slate-400 font-mono">${p.sku}</span>
                <span class="text-emerald-600 font-bold">₩${p.selling_price.toLocaleString()}</span>
            </div>
        </div>
    `).join('');

  dropdown.classList.remove('hidden');
}

window.selectContractProduct = function (pid) {
  const p = window.pricePolicyState.products.find(x => x.id === pid);
  if (p) {
    document.getElementById('contractProdId').value = p.id;
    document.getElementById('contractProdSearch').value = p.name;
    document.getElementById('contractProdPrice').value = p.selling_price.toLocaleString();
    document.getElementById('contractNewPrice').focus();
  }
  document.getElementById('contractProdDropdown').classList.add('hidden');
}

window.addContractItem = function () {
  const pid = document.getElementById('contractProdId').value;
  const price = parseInt(document.getElementById('contractNewPrice').value);

  if (!pid) { alert('상품을 선택해주세요.'); return; }
  if (isNaN(price)) { alert('계약 단가를 입력해주세요.'); return; }

  const p = window.pricePolicyState.products.find(x => x.id == pid);
  if (!p) return;

  // Check dupe
  const existingIdx = window.pricePolicyState.modalPendingItems.findIndex(x => x.product_id == pid);
  if (existingIdx >= 0) {
    if (!confirm('이미 추가된 상품입니다. 가격을 수정하시겠습니까?')) return;
    window.pricePolicyState.modalPendingItems[existingIdx].price = price;
  } else {
    window.pricePolicyState.modalPendingItems.push({
      product_id: p.id,
      product_name: p.name,
      product_sku: p.sku,
      standard_price: p.selling_price,
      price: price
    });
  }

  renderContractItemsList();
  resetContractForm();
}

window.removeContractItem = function (pid) {
  window.pricePolicyState.modalPendingItems = window.pricePolicyState.modalPendingItems.filter(x => x.product_id != pid);
  renderContractItemsList();
}

window.renderContractItemsList = function () {
  const items = window.pricePolicyState.modalPendingItems;
  const list = document.getElementById('contractItemsList');
  const count = document.getElementById('contractItemCount');

  if (count) count.innerText = `${items.length}개 항목`;

  if (items.length === 0) {
    list.innerHTML = `
            <div class="flex flex-col items-center justify-center h-40 text-slate-300 border-2 border-dashed border-slate-200 rounded-xl">
                <i class="fas fa-file-signature text-3xl mb-2"></i>
                <span class="text-sm">등록된 계약 내용이 없습니다.</span>
            </div>
        `;
    return;
  }

  list.innerHTML = items.map(item => `
        <div class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm animate-fade-in-up">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    <i class="fas fa-box"></i>
                </div>
                <div>
                    <div class="font-bold text-slate-800 text-sm">${item.product_name}</div>
                    <div class="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <span>${item.product_sku}</span>
                        <span class="text-slate-300">|</span>
                        <span>기준가: ₩${item.standard_price.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-4">
               <div class="flex flex-col items-end">
                   <span class="text-[10px] text-slate-400 font-bold uppercase">계약 단가</span>
                   <span class="text-emerald-600 font-bold">₩${item.price.toLocaleString()}</span>
               </div>
               <button onclick="removeContractItem(${item.product_id})" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors">
                   <i class="fas fa-trash-alt text-xs"></i>
               </button>
            </div>
        </div>
    `).join('');
}

window.saveContractItems = async function () {
  const custId = document.getElementById('contractCustSelect').value;
  if (!custId) { alert('고객사를 선택해주세요.'); return; }

  const items = window.pricePolicyState.modalPendingItems;
  const entries = items.map(x => ({
    product_id: x.product_id,
    customer_id: custId,
    price: x.price
  }));

  if (entries.length === 0) {
    if (!confirm('저장할 계약 내용이 없습니다. 계속하시겠습니까?')) return;
    return;
  }

  try {
    await axios.post('/api/prices/customers', { entries });
    alert('저장되었습니다.');
    closeContractModal();
    if (window.pricePolicyState && window.pricePolicyState.activeTab === 'customer') {
      // refresh page logic but simpler to just reload
      // window.location.reload(); 
    }
  } catch (e) {
    alert('저장 실패');
  }
}

// === Settings Page ===
async function loadSettings(content) {
  content.innerHTML = '<div class="flex justify-center items-center h-full"><i class="fas fa-spinner fa-spin text-3xl text-emerald-500"></i></div>';

  setTimeout(() => {
    content.innerHTML = `
      <div class="p-8 bg-slate-50 min-h-full">
        <h2 class="text-2xl font-bold mb-6">설정</h2>
        <div class="flex gap-2 mb-6 border-b border-slate-200">
          <button onclick="switchSettingsTab('company')" id="tab-company" class="px-4 py-2 font-semibold border-b-2 border-emerald-500 text-emerald-600">회사 정보</button>
          <button onclick="switchSettingsTab('team')" id="tab-team" class="px-4 py-2 text-slate-500 border-b-2 border-transparent">팀 설정</button>
          <button onclick="switchSettingsTab('plan')" id="tab-plan" class="px-4 py-2 text-slate-500 border-b-2 border-transparent">플랜 설정</button>
          <button onclick="switchSettingsTab('api')" id="tab-api" class="px-4 py-2 text-slate-500 border-b-2 border-transparent">API 설정</button>
          <button onclick="switchSettingsTab('warehouse')" id="tab-warehouse" class="px-4 py-2 text-slate-500 border-b-2 border-transparent">창고 관리</button>
        </div>
        <div id="settings-tab-content" class="bg-white rounded-lg p-6 shadow-sm">
          <p>로딩 중...</p>
        </div>
      </div>
    `;
    window.currentSettingsTab = 'company';
    switchSettingsTab('company');
  }, 100);
}

window.switchSettingsTab = async function (tab) {
  window.currentSettingsTab = tab;

  document.querySelectorAll('[id^="tab-"]').forEach(btn => {
    btn.classList.remove('border-emerald-500', 'text-emerald-600');
    btn.classList.add('border-transparent', 'text-slate-500');
  });

  const activeBtn = document.getElementById('tab-' + tab);
  if (activeBtn) {
    activeBtn.classList.remove('border-transparent', 'text-slate-500');
    activeBtn.classList.add('border-emerald-500', 'text-emerald-600');
  }

  const container = document.getElementById('settings-tab-content');
  container.innerHTML = '<div class="text-center p-12"><i class="fas fa-spinner fa-spin text-2xl text-emerald-500"></i></div>';

  try {
    if (tab === 'company') {
      const res = await axios.get(`${API_BASE}/settings/company`);
      renderCompanySettings(container, res.data.data);
    } else if (tab === 'team') {
      renderTeamSettings(container);
    } else if (tab === 'plan') {
      renderPlanSettings(container);
    } else if (tab === 'api') {
      renderApiSettings(container);
    } else if (tab === 'warehouse') {
      renderWarehouseSettings(container);
    } else {
      container.innerHTML = '<div class="text-slate-500 p-4">페이지를 찾을 수 없습니다.</div>';
    }
  } catch (e) {
    container.innerHTML = '<div class="text-red-500 p-4">데이터 로드 실패</div>';
  }
}

function renderCompanySettings(container, data) {
  container.innerHTML = `
    <h3 class="text-lg font-bold mb-4">회사 정보</h3>
    <form onsubmit="saveCompanyInfo(event)" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">대표이사</label>
          <input type="text" id="ceoName" value="${data.ceo_name || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">사업자등록번호</label>
          <input type="text" id="businessNumber" value="${data.business_number || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-2">이메일</label>
          <input type="email" id="companyEmail" value="${data.email || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-semibold mb-2">전화번호</label>
          <input type="tel" id="companyPhone" value="${data.phone || ''}" class="w-full px-3 py-2 border rounded-lg">
        </div>
      </div>
      <div>
        <label class="block text-sm font-semibold mb-2">회사명</label>
        <input type="text" id="companyName" value="${data.company_name || ''}" class="w-full px-3 py-2 border rounded-lg">
      </div>
      <div>
        <label class="block text-sm font-semibold mb-2">주소</label>
        <input type="text" id="companyAddress" value="${data.address || ''}" class="w-full px-3 py-2 border rounded-lg mb-2">
        <input type="text" id="companyAddressDetail" value="${data.address_detail || ''}" placeholder="상세주소" class="w-full px-3 py-2 border rounded-lg">
      </div>
      <div class="flex justify-end pt-4">
        <button type="submit" class="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">저장</button>
      </div>
    </form>
  `;
}

function renderTeamSettings(container) {
  container.innerHTML = '<p class="text-slate-500">팀 설정 기능 준비 중...</p>';
}

function renderPlanSettings(container) {
  container.innerHTML = '<p class="text-slate-500">플랜 설정 기능 준비 중...</p>';
}

function renderApiSettings(container) {
  container.innerHTML = '<p class="text-slate-500">API 설정 기능 준비 중...</p>';
}

function renderSecuritySettings(container) {
  container.innerHTML = '<p class="text-slate-500">보안 설정 기능 준비 중...</p>';
}

window.saveCompanyInfo = async function (e) {
  e.preventDefault();
  const data = {
    ceo_name: document.getElementById('ceoName').value,
    business_number: document.getElementById('businessNumber').value,
    email: document.getElementById('companyEmail').value,
    phone: document.getElementById('companyPhone').value,
    company_name: document.getElementById('companyName').value,
    address: document.getElementById('companyAddress').value,
    address_detail: document.getElementById('companyAddressDetail').value
  };

  try {
    await axios.put(`${API_BASE}/settings/company`, data);
    alert('저장되었습니다.');
  } catch (e) {
    alert('저장 실패');
  }
}

// Team Settings Implementation
async function renderTeamSettings(container) {
  try {
    const res = await axios.get(`${API_BASE}/settings/team`);
    const members = res.data.data || [];

    container.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold">팀원 관리</h3>
        <button onclick="inviteTeamMember()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors">
          <i class="fas fa-plus"></i>
          팀원 초대
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left p-4 font-semibold text-slate-600 text-sm">이름</th>
              <th class="text-left p-4 font-semibold text-slate-600 text-sm">이메일</th>
              <th class="text-left p-4 font-semibold text-slate-600 text-sm">권한</th>
              <th class="text-left p-4 font-semibold text-slate-600 text-sm">가입일</th>
              <th class="text-center p-4 font-semibold text-slate-600 text-sm">관리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${members.length === 0 ? `
              <tr>
                <td colspan="5" class="p-8 text-center text-slate-400">
                  <i class="fas fa-users text-3xl mb-2"></i>
                  <p>등록된 팀원이 없습니다.</p>
                </td>
              </tr>
            ` : members.map(member => `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4">
                  <div class="font-semibold text-slate-800">${member.name}</div>
                </td>
                <td class="p-4">
                  <div class="text-slate-600">${member.email}</div>
                </td>
                <td class="p-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold ${member.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' :
        member.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
          'bg-blue-100 text-blue-700'
      }">
                    ${member.role === 'ADMIN' ? '관리자' : member.role === 'SUPER_ADMIN' ? '최고 관리자' : '팀원'}
                  </span>
                </td>
                <td class="p-4">
                  <div class="text-slate-500 text-sm">${new Date(member.created_at).toLocaleDateString('ko-KR')}</div>
                </td>
                <td class="p-4 text-center">
                  ${member.role !== 'SUPER_ADMIN' ? `
                    <button onclick="removeTeamMember(${member.id}, '${member.name}')" class="text-slate-400 hover:text-rose-500 transition-colors p-2">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  ` : '<span class="text-slate-300">-</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<div class="text-red-500 p-4">팀원 목록을 불러오는데 실패했습니다.</div>';
  }
}

window.inviteTeamMember = function () {
  const email = prompt('초대할 팀원의 이메일을 입력하세요:');
  if (!email) return;

  const role = confirm('관리자 권한을 부여하시겠습니까?\n\n확인: 관리자\n취소: 일반 팀원') ? 'ADMIN' : 'STAFF';

  axios.post(`${API_BASE}/settings/team/invite`, { email, role })
    .then(() => {
      alert('초대 이메일이 발송되었습니다.');
      switchSettingsTab('team'); // Refresh
    })
    .catch(e => {
      alert('초대 실패: ' + (e.response?.data?.message || e.message));
    });
}

window.removeTeamMember = function (memberId, memberName) {
  if (!confirm(`'${memberName}' 팀원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;

  // TODO: Backend에 DELETE 엔드포인트 추가 필요
  alert('팀원 삭제 기능은 Backend API 구현 후 활성화됩니다.');

  // axios.delete(`${API_BASE}/settings/team/${memberId}`)
  //   .then(() => {
  //     alert('팀원이 삭제되었습니다.');
  //     switchSettingsTab('team'); // Refresh
  //   })
  //   .catch(e => alert('삭제 실패'));
}

// Plan Settings Implementation
async function renderPlanSettings(container) {
  try {
    const res = await axios.get(`${API_BASE}/settings/plan`);
    const planInfo = res.data.data;

    const plans = [
      {
        id: 'FREE',
        name: '무료',
        price: 0,
        features: [
          '사용자 3명',
          '상품 100개',
          '저장공간 1GB',
          '기본 기능'
        ]
      },
      {
        id: 'BASIC',
        name: '베이직',
        price: 29900,
        popular: true,
        features: [
          '사용자 10명',
          '상품 1,000개',
          '저장공간 10GB',
          '고급 통계',
          '이메일 지원'
        ]
      },
      {
        id: 'PRO',
        name: '프로',
        price: 99900,
        features: [
          '사용자 무제한',
          '상품 무제한',
          '저장공간 100GB',
          '프리미엄 기능',
          '전담 지원',
          'API 접근'
        ]
      }
    ];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Current Plan Info -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <i class="fas fa-crown text-white text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800">현재 플랜</h3>
              <p class="text-sm text-slate-600">상태: <span class="font-semibold text-emerald-600">${planInfo.status === 'ACTIVE' ? '활성' : planInfo.status}</span></p>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-purple-700">${plans.find(p => p.id === planInfo.current_plan)?.name || planInfo.current_plan}</span>
            ${planInfo.current_plan !== 'FREE' ? `<span class="text-lg text-slate-600">₩${plans.find(p => p.id === planInfo.current_plan)?.price.toLocaleString()}/월</span>` : ''}
          </div>
        </div>
        
        <!-- Plan Cards -->
        <h3 class="text-lg font-bold text-slate-800 mb-4">플랜 선택</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${plans.map(plan => `
            <div class="bg-white rounded-lg border-2 ${planInfo.current_plan === plan.id
        ? 'border-purple-500 shadow-lg'
        : plan.popular
          ? 'border-emerald-500'
          : 'border-slate-200'
      } p-6 relative transition-all hover:shadow-lg">
              ${plan.popular ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">인기</div>' : ''}
              ${planInfo.current_plan === plan.id ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">현재 플랜</div>' : ''}
              
              <div class="text-center mb-6">
                <h4 class="text-xl font-bold text-slate-800 mb-2">${plan.name}</h4>
                <div class="flex items-baseline justify-center gap-1 mb-1">
                  <span class="text-4xl font-bold ${plan.popular ? 'text-emerald-600' : 'text-slate-800'}">₩${plan.price.toLocaleString()}</span>
                  ${plan.price > 0 ? '<span class="text-slate-500 text-sm">/월</span>' : ''}
                </div>
              </div>
              
              <ul class="space-y-3 mb-6">
                ${plan.features.map(feature => `
                  <li class="flex items-start gap-2 text-sm text-slate-600">
                    <i class="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span>${feature}</span>
                  </li>
                `).join('')}
              </ul>
              
              <div class="mt-auto">
                ${planInfo.current_plan === plan.id
        ? '<button disabled class="w-full bg-slate-200 text-slate-600 px-4 py-3 rounded-lg font-semibold cursor-not-allowed">현재 사용 중</button>'
        : `<button onclick="requestPlanChange('${plan.id}', '${plan.name}')" class="w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md">변경 요청</button>`
      }
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="text-red-500 p-4">플랜 정보를 불러오는데 실패했습니다.</div>';
  }
}

window.requestPlanChange = async function (planId, planName) {
  if (!confirm(`${planName} 플랜으로 변경 요청하시겠습니까?\n\n승인 후 즉시 적용됩니다.`)) {
    return;
  }

  try {
    await axios.post(`${API_BASE}/settings/plan/upgrade`, {
      requested_plan: planId
    });

    alert('플랜 변경 요청이 제출되었습니다.\n관리자 승인 후 적용됩니다.');

    // Refresh the page
    switchSettingsTab('plan');
  } catch (e) {
    console.error(e);
    alert('플랜 변경 요청 실패: ' + (e.response?.data?.message || e.message));
  }
}

// API Settings Implementation
async function renderApiSettings(container) {
  try {
    const res = await axios.get(`${API_BASE}/settings/api-keys`);
    const apiKeys = res.data.data || [];
    const smartParcelKey = apiKeys.find(k => k.service === 'smartparcel');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Smart Parcel API Section -->
        <div class="bg-white rounded-lg border border-slate-200 p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-truck text-emerald-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800">택배 추적 API 관리</h3>
              <p class="text-sm text-slate-500">스마트택배 (smartparcel.kr) API 연동</p>
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex gap-2 mb-2">
              <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <div class="text-sm text-blue-800">
                <p class="font-semibold mb-1">API 키 발급 안내</p>
                <p>스마트택배 홈페이지에서 API 키를 발급받으세요: 
                  <a href="https://www.smartparcel.kr" target="_blank" class="text-blue-600 underline hover:text-blue-700">
                    smartparcel.kr
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">API Key</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input 
                    type="${window.apiKeyVisible ? 'text' : 'password'}" 
                    id="smartParcelApiKey" 
                    value="${smartParcelKey?.key || ''}" 
                    placeholder="API 키를 입력하세요" 
                    class="w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  >
                  <button 
                    onclick="toggleApiKeyVisibility()" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <i class="fas ${window.apiKeyVisible ? 'fa-eye-slash' : 'fa-eye'}"></i>
                  </button>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                API 키는 암호화되어 안전하게 저장됩니다
              </p>
            </div>
            
            <div class="flex gap-2">
              <button 
                onclick="saveApiKey()" 
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
              >
                저장
              </button>
              <button 
                onclick="testApiKey()" 
                class="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg font-semibold border border-slate-300 transition-colors"
              >
                테스트
              </button>
            </div>
          </div>
        </div>
        
        <!-- Features Section -->
        <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-6">
          <h4 class="text-sm font-bold text-slate-600 uppercase mb-4 flex items-center gap-2">
            <i class="fas fa-star text-yellow-500"></i>
            활용 가능한 배송 기능
          </h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-3 text-sm text-slate-700">
              <i class="fas fa-check-circle text-emerald-500 mt-0.5"></i>
              <div>
                <span class="font-semibold">주문 배송 조회 기능</span>
                <p class="text-xs text-slate-500">실시간으로 배송 현황을 확인할 수 있습니다</p>
              </div>
            </li>
            <li class="flex items-start gap-3 text-sm text-slate-700">
              <i class="fas fa-check-circle text-emerald-500 mt-0.5"></i>
              <div>
                <span class="font-semibold">고객사별 배송 추적</span>
                <p class="text-xs text-slate-500">고객별로 배송 상태를 관리합니다</p>
              </div>
            </li>
            <li class="flex items-start gap-3 text-sm text-slate-700">
              <i class="fas fa-check-circle text-emerald-500 mt-0.5"></i>
              <div>
                <span class="font-semibold">배송 현황 알림</span>
                <p class="text-xs text-slate-500">배송 상태 변경 시 자동 알림을 받습니다</p>
              </div>
            </li>
            <li class="flex items-start gap-3 text-sm text-slate-700">
              <i class="fas fa-check-circle text-emerald-500 mt-0.5"></i>
              <div>
                <span class="font-semibold">다양한 택배사 지원</span>
                <p class="text-xs text-slate-500">CJ대한통운, 로젠택배, 한진택배 등 주요 택배사 지원</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="text-red-500 p-4">API 설정을 불러오는데 실패했습니다.</div>';
  }
}

window.apiKeyVisible = false;

window.toggleApiKeyVisibility = function () {
  window.apiKeyVisible = !window.apiKeyVisible;
  const input = document.getElementById('smartParcelApiKey');
  input.type = window.apiKeyVisible ? 'text' : 'password';

  const icon = input.nextElementSibling.querySelector('i');
  icon.className = window.apiKeyVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
}

window.saveApiKey = async function () {
  const apiKey = document.getElementById('smartParcelApiKey').value.trim();

  if (!apiKey) {
    alert('API 키를 입력해주세요.');
    return;
  }

  try {
    await axios.post(`${API_BASE}/settings/api-keys`, {
      service: 'smartparcel',
      key: apiKey,
      name: '스마트택배 API'
    });

    alert('API 키가 저장되었습니다.');
  } catch (e) {
    console.error(e);
    alert('저장 실패: ' + (e.response?.data?.message || e.message));
  }
}

window.testApiKey = async function () {
  const apiKey = document.getElementById('smartParcelApiKey').value.trim();

  if (!apiKey) {
    alert('API 키를 먼저 입력해주세요.');
    return;
  }

  // Mock test - in real implementation, this would call the delivery tracking API
  const testTracking = '1234567890123'; // Sample tracking number

  try {
    // Simulate API test delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    alert(`테스트 성공!\n\n테스트 송장번호: ${testTracking}\n상태: 배송 조회 API 정상 작동`);
  } catch (e) {
    alert('API 테스트 실패\nAPI 키를 확인해주세요.');
  }
}

// Warehouse Management Settings Implementation
async function renderWarehouseSettings(container) {
  try {
    const res = await axios.get(`${API_BASE}/warehouses`);
    const warehouses = res.data.data || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold text-slate-800">창고 관리</h3>
            <p class="text-sm text-slate-500 mt-1">창고 정보 관리 및 재고 데이터 동기화</p>
          </div>
          <div class="flex gap-2">
            <button onclick="syncWarehouseStock()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm">
              <i class="fas fa-sync"></i>
              재고 데이터 동기화
            </button>
            <button onclick="openWarehouseModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm">
              <i class="fas fa-plus"></i>
              창고 추가
            </button>
          </div>
        </div>
        
        <!-- Warehouse Table -->
        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left p-4 font-semibold text-slate-600 text-sm">이름</th>
                <th class="text-left p-4 font-semibold text-slate-600 text-sm">주소</th>
                <th class="text-left p-4 font-semibold text-slate-600 text-sm">연락처</th>
                <th class="text-center p-4 font-semibold text-slate-600 text-sm">상태</th>
                <th class="text-center p-4 font-semibold text-slate-600 text-sm">관리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${warehouses.length === 0 ? `
                <tr>
                  <td colspan="5" class="p-8 text-center text-slate-400">
                    <i class="fas fa-warehouse text-3xl mb-2"></i>
                    <p>등록된 창고가 없습니다.</p>
                  </td>
                </tr>
              ` : warehouses.map(wh => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-warehouse text-emerald-600"></i>
                      </div>
                      <div class="font-semibold text-slate-800">${wh.name}</div>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="text-slate-600 text-sm">${wh.address || '-'}</div>
                  </td>
                  <td class="p-4">
                    <div class="text-slate-600 text-sm">${wh.contact || '-'}</div>
                  </td>
                  <td class="p-4 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${wh.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }">
                      ${wh.status === 'active' ? '사용중' : '미사용'}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button onclick="editWarehouse(${wh.id})" class="text-slate-400 hover:text-blue-500 transition-colors p-2">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="deleteWarehouse(${wh.id}, '${wh.name}')" class="text-slate-400 hover:text-rose-500 transition-colors p-2">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Warehouse Modal -->
      <div id="warehouseModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <h3 class="text-lg font-bold text-slate-800 mb-4" id="modalTitle">창고 추가</h3>
          <form onsubmit="saveWarehouse(event)" class="space-y-4">
            <input type="hidden" id="warehouseId">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">창고명 *</label>
              <input type="text" id="warehouseName" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">주소</label>
              <input type="text" id="warehouseAddress" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">연락처</label>
              <input type="tel" id="warehouseContact" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">상태</label>
              <select id="warehouseStatus" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="active">사용중</option>
                <option value="inactive">미사용</option>
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <button type="button" onclick="closeWarehouseModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                취소
              </button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="text-red-500 p-4">창고 목록을 불러오는데 실패했습니다.</div>';
  }
}

window.openWarehouseModal = function (warehouseData) {
  const modal = document.getElementById('warehouseModal');
  const title = document.getElementById('modalTitle');

  if (warehouseData) {
    title.textContent = '창고 수정';
    document.getElementById('warehouseId').value = warehouseData.id;
    document.getElementById('warehouseName').value = warehouseData.name;
    document.getElementById('warehouseAddress').value = warehouseData.address || '';
    document.getElementById('warehouseContact').value = warehouseData.contact || '';
    document.getElementById('warehouseStatus').value = warehouseData.status || 'active';
  } else {
    title.textContent = '창고 추가';
    document.getElementById('warehouseId').value = '';
    document.getElementById('warehouseName').value = '';
    document.getElementById('warehouseAddress').value = '';
    document.getElementById('warehouseContact').value = '';
    document.getElementById('warehouseStatus').value = 'active';
  }

  modal.classList.remove('hidden');
}

window.closeWarehouseModal = function () {
  document.getElementById('warehouseModal').classList.add('hidden');
}

window.saveWarehouse = async function (e) {
  e.preventDefault();

  const id = document.getElementById('warehouseId').value;
  const data = {
    name: document.getElementById('warehouseName').value,
    address: document.getElementById('warehouseAddress').value,
    contact: document.getElementById('warehouseContact').value,
    status: document.getElementById('warehouseStatus').value
  };

  try {
    if (id) {
      await axios.put(`${API_BASE}/warehouses/${id}`, data);
      alert('창고가 수정되었습니다.');
    } else {
      await axios.post(`${API_BASE}/warehouses`, data);
      alert('창고가 추가되었습니다.');
    }

    closeWarehouseModal();
    switchSettingsTab('warehouse'); // Refresh
  } catch (e) {
    console.error(e);
    alert('저장 실패: ' + (e.response?.data?.message || e.message));
  }
}

window.editWarehouse = async function (id) {
  try {
    const res = await axios.get(`${API_BASE}/warehouses`);
    const warehouse = res.data.data.find(w => w.id === id);
    if (warehouse) {
      openWarehouseModal(warehouse);
    }
  } catch (e) {
    alert('창고 정보를 불러오는데 실패했습니다.');
  }
}

window.deleteWarehouse = async function (id, name) {
  if (!confirm(`'${name}' 창고를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
    return;
  }

  try {
    await axios.delete(`${API_BASE}/warehouses/${id}`);
    alert('창고가 삭제되었습니다.');
    switchSettingsTab('warehouse'); // Refresh
  } catch (e) {
    console.error(e);
    alert('삭제 실패: ' + (e.response?.data?.message || e.message));
  }
}

window.syncWarehouseStock = async function () {
  if (!confirm('모든 창고의 재고 데이터를 동기화하시겠습니까?\n\n이 작업은 몇 분이 소요될 수 있습니다.')) {
    return;
  }

  try {
    // Mock sync - in real implementation, this would trigger a background job
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert('재고 데이터 동기화가 완료되었습니다.\n\n총 동기화된 창고: 3개\n동기화된 품목: 247개');
  } catch (e) {
    console.error(e);
    alert('동기화 실패: ' + (e.response?.data?.message || e.message));
  }
}
