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
import * as InboundModule from './modules/inbound.js';
Object.assign(window, InboundModule);
import * as StockModule from './modules/stock.js';
Object.assign(window, StockModule);
import * as OutboundModule from './modules/outbound.js';
Object.assign(window, OutboundModule);
import * as SettingsModule from './modules/settings.js';
Object.assign(window, SettingsModule);
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


