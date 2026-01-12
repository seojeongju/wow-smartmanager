/**
 * Outbound Module
 */
import { API_BASE } from '../utils/constants.js';
import { formatDate, formatCurrency, formatNumber, formatDateClean } from '../utils/formatters.js';
import { showSuccess, showError } from '../utils/ui.js';

// State
window.outboundCart = [];
window.outboundPage = 1;
window.outboundItemsPerPage = 7;
window.filteredOutboundList = [];

export async function loadOutbound(content) {
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
  export function updateTime() {
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

export async function switchOutboundTab(tabName) {
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

export async function renderWarehouseTab(container) {
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

export function injectWarehouseModal() {
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

export function openWarehouseModal(isEdit = false, warehouse = null) {
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

export function closeWarehouseModal() {
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

export async function submitWarehouse() {
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

export async function editWarehouse(id) {
  try {
export function renderOutboundProductList(list = window.products) {
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

export function addToOutboundCart(productId) {
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

export function renderOutboundCart() {
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

export function updateOutboundQty(id, delta) {
  const item = window.outboundCart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeOutboundItem(id);
  } else {
    renderOutboundCart();
  }
}

export function removeOutboundItem(id) {
  window.outboundCart = window.outboundCart.filter(i => i.id !== id);
  renderOutboundCart();
}

export function clearOutboundCart() {
  window.outboundCart = [];
  renderOutboundCart();
}

// 고객 선택 시 자동 채움
export function fillOutboundCustomer(value) {
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

export function copyBuyerToReceiver() {
  const isChecked = document.getElementById('obSameAsBuyer').checked;
  if (isChecked) {
    document.getElementById('obReceiverName').value = document.getElementById('obBuyerName').value;
    document.getElementById('obReceiverPhone').value = document.getElementById('obBuyerPhone').value;
  }
}

export async function submitSimpleOutbound() {
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
export async function renderOutboundHistoryTab(container) {
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

export function changeOutboundHistoryPage(delta) {
  const list = window.filteredOutboundHistory;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.outboundHistoryItemsPerPage);
  const newPage = window.outboundHistoryPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.outboundHistoryPage = newPage;
    renderOutboundHistoryTab(document.getElementById('outboundTabContent'));
  }
}

export function downloadOutboundExcel() {
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



export function getOutboundStatusColor(status) {
  switch (status) {
    case 'PENDING': return 'bg-slate-50 text-slate-500 border-slate-100'; // 대기
    case 'PICKING': return 'bg-amber-50 text-amber-600 border-amber-100'; // 피킹중
    case 'PACKING': return 'bg-blue-50 text-blue-600 border-blue-100'; // 패킹중
    case 'SHIPPED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // 출고완료
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
}

// 상세 모달 로직 (기존 유지)
export function injectOutboundDetailModal() {
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

export async function openOutboundDetail(id) {
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

export async function savePicking() {
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

export async function performPacking() {
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

export async function confirmShipment() {
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
export async function loadInvoice(content) {
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

export function injectInvoiceModal() {
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

export async function openInvoiceModal(saleId) {
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

export function printInvoice() {
  window.print();
}

}


// 재고 관리 로드

export function renderSimpleOutboundTab(container) {
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

export function filterOutboundProducts(query) {
  if (!window.products) return;
  const q = query.toLowerCase();
  const filtered = window.products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  window.filteredOutboundList = filtered;
  window.outboundPage = 1; // Reset to page 1
  renderOutboundProductList(filtered);
}

export function changeOutboundPage(delta) {
  const list = window.filteredOutboundList || window.products;
  if (!list) return;

  const totalPages = Math.ceil(list.length / window.outboundItemsPerPage);
  const newPage = window.outboundPage + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    window.outboundPage = newPage;
    renderOutboundProductList(list);
  }
}


