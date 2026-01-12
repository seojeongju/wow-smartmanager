/**
 * Stock & Warehouse Module
 */
import { API_BASE } from '../utils/constants.js';
import { formatDate, formatCurrency, formatNumber, formatDateClean } from '../utils/formatters.js';
import { showSuccess, showError } from '../utils/ui.js';

export async function loadStock(content) {
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



// 판매 관리 로드

// ==================== 설정 페이지 ====================

// 설정 페이지 로드



// Global State for Movements
window.stockMovementPage = 1;
window.stockMovementFilters = {
  search: '',
  type: '',
  warehouse_id: '',
  start_date: '',
  end_date: ''
};



export function searchStockMovements() {
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

export async function loadStockMovementsData() {
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
export function injectStockModal() {
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

export async function openStockModal(type) {
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

export function closeStockModal() {
  document.getElementById('stockModal').classList.add('hidden');
}

export async function submitStockMovement(e) {
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
export async function loadStock(content) {
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

export async function loadStockData() {
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

export function switchStockTab(tab) {
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

export async function renderStockStatus() {
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

export async function renderStockMovements() {
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

export async function renderWarehouseManagement() {
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
export async function loadOptionPresets(content) {
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

export async function fetchAndRenderOptionGroups() {
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

export async function openOptionGroupModal(id = null) {
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

export function closeOptionGroupModal() {
  const modal = document.getElementById('optModal');
  const content = document.getElementById('optModalContent');
  if (content) {
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
  }
  setTimeout(() => modal.classList.add('hidden'), 200);
}

export function addOptionValueRow(name = '', price = 0) {
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

export async function saveOptionGroup() {
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

export async function deleteOptionGroup(id) {
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
export async function loadPricePolicies(content) {
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

export async function loadPriceData() {
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

export function renderPriceTable() {
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

export function switchPriceTab(tab) {
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

export function filterPriceTable() {
  renderPriceTable();
}

export async function savePriceChanges() {
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

export async function loadProducts(content) {
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

export async function searchProducts() {
  window.productPageState.search = document.getElementById('prodSearch').value;
  window.productPageState.category = document.getElementById('prodCategory').value;
  window.productPageState.page = 1;
  await fetchAndRenderProducts();
}

export async function fetchAndRenderProducts() {
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

export function renderProductList() {
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
export function openProductModal(id = null) {
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

export function closeProductModal() {
  const modal = document.getElementById('prodModal');
  const content = document.getElementById('prodModalContent');
  content.classList.remove('scale-100');
  content.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

export function toggleSkuInput(auto) {
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

export function generateSku() {
  const d = new Date();
  const dateStr = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  document.getElementById('prodSku').value = `PRD-${dateStr}-${random}`;
}

export async function saveProduct() {
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

export async function deleteProduct(id) {
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
export async function openContractModal(customerId = null) {
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

export function closeContractModal() {
  const modal = document.getElementById('contractModal');
  const content = document.getElementById('contractModalContent');
  if (content) {
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
  }
  setTimeout(() => modal.classList.add('hidden'), 200);
}

export function resetContractCust() {
  document.getElementById('contractCustSelect').value = '';
  document.getElementById('contractCustSelectContainer').classList.remove('hidden');
  document.getElementById('contractCustDisplay').classList.add('hidden');
  document.getElementById('contractCustDisplay').classList.remove('flex');
  window.pricePolicyState.modalPendingItems = [];
  renderContractItemsList();
}

export function confirmContractCust(name) {
  document.getElementById('contractCustSelectContainer').classList.add('hidden');
  const display = document.getElementById('contractCustDisplay');
  display.classList.remove('hidden');
  display.classList.add('flex');
  document.getElementById('contractCustName').innerText = name;
}

export function resetContractForm() {
  document.getElementById('contractProdId').value = '';
  document.getElementById('contractProdSearch').value = '';
  document.getElementById('contractProdPrice').value = '';
  document.getElementById('contractNewPrice').value = '';
}

export async function loadContractItems(customerId) {
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

export function searchContractProduct(query) {
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

export function selectContractProduct(pid) {
  const p = window.pricePolicyState.products.find(x => x.id === pid);
  if (p) {
    document.getElementById('contractProdId').value = p.id;
    document.getElementById('contractProdSearch').value = p.name;
    document.getElementById('contractProdPrice').value = p.selling_price.toLocaleString();
    document.getElementById('contractNewPrice').focus();
  }
  document.getElementById('contractProdDropdown').classList.add('hidden');
}

export function addContractItem() {
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

export function removeContractItem(pid) {
  window.pricePolicyState.modalPendingItems = window.pricePolicyState.modalPendingItems.filter(x => x.product_id != pid);
  renderContractItemsList();
}

export function renderContractItemsList() {
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

export async function saveContractItems() {
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

const res = await axios.get(`${API_BASE}/warehouses`);
const warehouse = res.data.data.find(w => w.id === id);
if (warehouse) {
  openWarehouseModal(true, warehouse);
}
  } catch (e) {
  console.error(e);
}
}

export async function deleteWarehouse(id) {
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


