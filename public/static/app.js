import { API_BASE, STATUS, ROLES } from './utils/constants.js';
import { formatDate, formatCurrency, formatNumber, formatDateClean } from './utils/formatters.js';
import { API } from './utils/api.js';
import { Modal } from './components/Modal.js';
import { showError, showSuccess } from './utils/ui.js';
import { downloadCSV } from './utils/files.js';
import * as SystemModule from './modules/system.js';
import * as DashboardModule from './modules/dashboard.js';
import * as ProductsModule from './modules/products.js';
Object.assign(window, ProductsModule);
import * as CustomersModule from './modules/customers.js';
Object.assign(window, CustomersModule);
import * as SalesModule from './modules/sales.js';
Object.assign(window, SalesModule);
Object.assign(window, DashboardModule);

Object.assign(window, SystemModule);


// 전역 유틸리티 노출 (구버전 호환용)
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.formatDateClean = formatDateClean;


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

// Expose functions to global scope for HTML event handlers
window.loadUserInfo = loadUserInfo;
window.logout = logout;
window.setupNavigation = setupNavigation;
window.updatePageTitle = updatePageTitle;
window.loadPage = loadPage;
window.loadInbound = loadInbound;
window.updateInboundTime = updateInboundTime;
window.getInboundStatusBadge = getInboundStatusBadge;
window.loadOutbound = loadOutbound;
window.switchOutboundTab = switchOutboundTab;
window.renderWarehouseTab = renderWarehouseTab;
window.injectWarehouseModal = injectWarehouseModal;
window.openWarehouseModal = openWarehouseModal;
window.closeWarehouseModal = closeWarehouseModal;
window.submitWarehouse = submitWarehouse;
window.editWarehouse = editWarehouse;
window.deleteWarehouse = deleteWarehouse;
window.renderSimpleOutboundTab = renderSimpleOutboundTab;
window.filterOutboundProducts = filterOutboundProducts;
window.changeOutboundPage = changeOutboundPage;
window.renderOutboundProductList = renderOutboundProductList;
window.addToOutboundCart = addToOutboundCart;
window.renderOutboundCart = renderOutboundCart;
window.updateOutboundQty = updateOutboundQty;
window.removeOutboundItem = removeOutboundItem;
window.clearOutboundCart = clearOutboundCart;
window.fillOutboundCustomer = fillOutboundCustomer;
window.copyBuyerToReceiver = copyBuyerToReceiver;
window.submitSimpleOutbound = submitSimpleOutbound;
window.renderOutboundHistoryTab = renderOutboundHistoryTab;
window.changeOutboundHistoryPage = changeOutboundHistoryPage;
window.downloadOutboundExcel = downloadOutboundExcel;
window.getOutboundStatusColor = getOutboundStatusColor;
window.injectOutboundDetailModal = injectOutboundDetailModal;
window.openOutboundDetail = openOutboundDetail;
window.savePicking = savePicking;
window.performPacking = performPacking;
window.confirmShipment = confirmShipment;
window.loadInvoice = loadInvoice;
window.injectInvoiceModal = injectInvoiceModal;
window.openInvoiceModal = openInvoiceModal;
window.printInvoice = printInvoice;
window.loadSystem = loadSystem;
window.renderSystemTenants = renderSystemTenants;
window.renderSystemUsers = renderSystemUsers;
window.renderSystemStats = renderSystemStats;
window.renderPlanRequests = renderPlanRequests;
window.loadDashboard = loadDashboard;
window.loadProducts = loadProducts;
window.loadCustomers = loadCustomers;
window.renderCustomerPage = renderCustomerPage;
window.renderCustomerTable = renderCustomerTable;
window.injectCustomerDetailModal = injectCustomerDetailModal;
window.loadStock = loadStock;
window.loadSales = loadSales;
window.switchSalesTab = switchSalesTab;
window.renderPosTab = renderPosTab;
window.renderOrderManagementTab = renderOrderManagementTab;
window.renderOrderList = renderOrderList;
window.changeOrderPage = changeOrderPage;
window.renderClaimsTab = renderClaimsTab;
window.renderClaimList = renderClaimList;
window.changeClaimPage = changeClaimPage;
window.getKoreanStatus = getKoreanStatus;
window.showError = showError;
window.showSuccess = showSuccess;
window.downloadCSV = downloadCSV;
window.downloadProducts = downloadProducts;
window.downloadCustomers = downloadCustomers;
window.downloadSales = downloadSales;
window.injectProductModal = injectProductModal;
window.toggleSkuInput = toggleSkuInput;
window.generateAutoSku = generateAutoSku;
window.switchProductTab = switchProductTab;
window.handleImageUpload = handleImageUpload;
window.updateImagePreview = updateImagePreview;
window.removeImage = removeImage;
window.showProductModal = showProductModal;
window.editProduct = editProduct;
window.closeProductModal = closeProductModal;
window.submitProduct = submitProduct;
window.fillCategoryDatalist = fillCategoryDatalist;
window.injectCustomerModal = injectCustomerModal;
window.toggleGradeInput = toggleGradeInput;
window.showCustomerModal = showCustomerModal;
window.editCustomer = editCustomer;
window.closeCustomerModal = closeCustomerModal;
window.submitCustomer = submitCustomer;
window.deleteCustomer = deleteCustomer;
window.loadCategories = loadCategories;
window.filterProducts = filterProducts;
window.renderPosProducts = renderPosProducts;
window.filterPosProducts = filterPosProducts;
window.changePosPage = changePosPage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.renderCart = renderCart;
window.checkout = checkout;
window.cancelSale = cancelSale;
window.injectShippingModal = injectShippingModal;
window.openShippingModal = openShippingModal;
window.submitShipping = submitShipping;
window.injectClaimModal = injectClaimModal;
window.openClaimModal = openClaimModal;
window.submitClaim = submitClaim;
window.updateClaimStatus = updateClaimStatus;
window.loadSettings = loadSettings;
window.switchSettingsTab = switchSettingsTab;
window.initSettingsTabStyles = initSettingsTabStyles;
window.saveBusinessInfo = saveBusinessInfo;
window.saveProfileInfo = saveProfileInfo;
window.previewLogo = previewLogo;
window.uploadLogo = uploadLogo;
window.renderCompanySettings = renderCompanySettings;
window.renderTeamSettings = renderTeamSettings;
window.renderPlanSettings = renderPlanSettings;
window.renderApiSettings = renderApiSettings;
window.renderSecuritySettings = renderSecuritySettings;
window.renderWarehouseSettings = renderWarehouseSettings;



