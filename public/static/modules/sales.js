/**
 * Sales Module
 */
import { API_BASE } from '../utils/constants.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { showSuccess, showError } from '../utils/ui.js';
import { downloadCSV } from '../utils/files.js';

export async function loadSales(content) {
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
export async function switchSalesTab(tabName) {
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
export async function renderPosTab(container) {
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
export async function renderOrderManagementTab(container) {
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

export function renderOrderList() {
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

export function changeOrderPage(delta) {
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
export async function renderClaimsTab(container) {
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

export function renderClaimList() {
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

export function changeClaimPage(delta) {
  const list = window.filteredClaimList || window.allClaims;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.claimItemsPerPage);
  const newPage = window.claimPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.claimPage = newPage;
    renderClaimList();
  }
}

export function getKoreanStatus(status) {
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





// --- CSV 다운로드 유틸리티 ---




// 판매 데이터 다운로드
export async function downloadSales() {
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






// --- POS 관련 함수 ---

// POS 페이지네이션 변수
window.posPage = 1;
window.posItemsPerPage = 12;
window.filteredPosList = null;

export function renderPosProducts(filterText = '', filterCat = '') {
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

export function filterPosProducts() {
  const text = document.getElementById('posSearch').value;
  const cat = document.getElementById('posCategory').value;
  window.posPage = 1; // 검색 시 1페이지로 리셋
  renderPosProducts(text, cat);
}

export function changePosPage(delta) {
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

export function addToCart(productId) {
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

export function removeFromCart(productId) {
  window.cart = window.cart.filter(item => item.product.id !== productId);
  renderCart();
}

export function updateCartQuantity(productId, delta) {
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

export function renderCart() {
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

export async function checkout() {
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

export async function cancelSale(saleId) {
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

export function injectShippingModal() {
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

export async function openShippingModal(saleId) {
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

export async function submitShipping(e) {
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

export function injectClaimModal() {
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

export async function openClaimModal(saleId) {
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

export async function submitClaim(e) {
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

export async function updateClaimStatus(id, status) {
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
