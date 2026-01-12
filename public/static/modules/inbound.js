/**
 * Inbound Module
 */
import { API_BASE } from '../utils/constants.js';
import { formatDate, formatCurrency, formatNumber, formatDateClean } from '../utils/formatters.js';
import { showSuccess, showError } from '../utils/ui.js';

// State
window.inboundPage = 1;
window.inboundItemsPerPage = 10;
window.filteredInboundList = [];

// Entry Point
export async function loadInbound(content) {
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

export function updateInboundTime() {
  const el = document.getElementById('inboundCurrentTime');
  if (el) {
    const now = new Date();
    el.innerHTML = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 <span class="ml-2">${now.toLocaleTimeString()}</span>`;
  }
}

// 탭 전환
export function switchInboundTab(tabName) {
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
export async function renderInboundOrderList() {
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

export function changeInboundPage(delta) {
  const newPage = window.inboundPage + delta;
  const totalPages = window.inboundTotalPages || 1;

  if (newPage >= 1 && newPage <= totalPages) {
    window.inboundPage = newPage;
    renderInboundOrderList();
  }
}

export function getInboundStatusBadge(status) {
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

export function openInboundDetailModal(id) {
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

export async function processInbound(id) {
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
export async function renderSupplierManagement() {
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
export function openSupplierModal(supplier = null) {
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
export async function saveSupplier() {
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
export async function deleteSupplier(id) {
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


