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
      updatePageTitle('상품 관리', '상품 등록 및 재고 관리');
      await loadProducts(content);
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
async function loadInbound(content) {
  content.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full text-slate-500">
      <i class="fas fa-dolly text-6xl mb-4 text-slate-300"></i>
      <h2 class="text-2xl font-bold mb-2">입고/발주 관리</h2>
      <p>이 기능은 준비 중입니다.</p>
    </div>
  `;
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

// 기존 출고 목록 뷰 (2번째 탭)
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

    // 엑셀 다운로드를 위해 전역 변수에 저장
    window.currentOutboundOrders = orders;

    container.innerHTML = `
          <!-- 검색 필터 영역 -->
          <div class="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
             
             <!-- 검색어 입력 -->
             <div class="relative flex-1 min-w-[200px] max-w-sm">
                 <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                 <input type="text" id="obsSearch" class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" placeholder="주문번호, 받는분, 상품명 검색" value="${document.getElementById('obsSearch')?.value || ''}">
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
             <button onclick="renderOutboundHistoryTab(document.getElementById('outboundTabContent'))" class="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-teal-100 hover:bg-teal-700 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                <i class="fas fa-search mr-1.5"></i> 조회
             </button>

             <!-- 엑셀 다운로드 버튼 -->
             <button onclick="downloadOutboundExcel()" class="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-0.5 whitespace-nowrap ml-auto">
                <i class="fas fa-file-excel mr-1.5"></i> 엑셀 다운로드
             </button>
          </div>

          <!-- 테이블 영역 -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-50 text-left">
                <thead class="bg-white">
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
                  ${orders.length > 0 ? orders.map(o => `
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
          </div>
        `;

    // 엔터 키로 조회
    document.getElementById('obsSearch')?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') renderOutboundHistoryTab(document.getElementById('outboundTabContent'));
    });

  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="flex items-center justify-center h-full text-rose-500">데이터 로드 실패</div>';
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

// 시스템 관리 (준비 중)
async function loadSystem(content) {
  content.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full text-slate-500">
      <i class="fas fa-shield-alt text-6xl mb-4 text-slate-300"></i>
      <h2 class="text-2xl font-bold mb-2">시스템 관리</h2>
      <p>이 기능은 준비 중입니다.</p>
    </div>
  `;
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
  try {
    const response = await axios.get(`${API_BASE}/customers`);
    const customers = response.data.data;

    content.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-slate-800">
          <i class="fas fa-users mr-2 text-indigo-600"></i>고객 관리
        </h1>
        <div class="flex gap-2">
          <button onclick="downloadCustomers()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center">
            <i class="fas fa-file-excel mr-2"></i>엑셀 다운로드
          </button>
          <button onclick="showCustomerModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center">
            <i class="fas fa-plus mr-2"></i>고객 등록
          </button>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">등급</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">총 구매액</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">구매 횟수</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              ${customers.map(c => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${c.name}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-600">${c.phone}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${c.grade === 'VIP' ? 'bg-amber-100 text-amber-700' :
        c.grade === 'VVIP' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}">
                      ${c.grade}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-sm font-bold text-slate-700">${formatCurrency(c.total_purchase_amount)}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="text-sm text-slate-600">${c.purchase_count}회</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onclick="editCustomer(${c.id})" class="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCustomer(${c.id})" class="text-red-500 hover:text-red-700 transition-colors">
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
    // 모달 주입
    injectCustomerModal();

  } catch (error) {
    console.error('고객 목록 로드 실패:', error);
    showError(content, '고객 목록을 불러오는데 실패했습니다.');
  }
}

// 재고 관리 로드
async function loadStock(content) {
  try {
    // 재고 이동 내역 조회
    const response = await axios.get(`${API_BASE}/stock/movements`);
    const movements = response.data.data;

    // 상품 목록 조회 (모달용)
    const productsResponse = await axios.get(`${API_BASE}/products`);
    window.products = productsResponse.data.data;

    content.innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-slate-800">재고 관리</h1>
        <div class="space-x-2">
          <button onclick="openStockModal('in')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
            <i class="fas fa-plus mr-2"></i>입고
          </button>
          <button onclick="openStockModal('out')" class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
            <i class="fas fa-minus mr-2"></i>출고
          </button>
          <button onclick="openStockModal('adjust')" class="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
            <i class="fas fa-sync mr-2"></i>조정
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">일시</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">구분</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상품명</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">수량</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">사유</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">담당자/비고</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              ${movements.length > 0 ? movements.map(m => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    ${new Date(m.created_at).toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${m.movement_type === '입고' ? 'bg-emerald-100 text-emerald-700' :
        m.movement_type === '출고' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}">
                      ${m.movement_type}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-900">${m.product_name}</div>
                    <div class="text-xs text-slate-500 font-mono">${m.sku}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="text-sm font-bold ${m.movement_type === '입고' ? 'text-emerald-600' : 'text-amber-600'}">
                      ${m.movement_type === '입고' ? '+' : '-'}${m.quantity}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    ${m.reason || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    ${m.notes || '-'}
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 모달 주입
    injectStockModal();

  } catch (error) {
    console.error('재고 관리 로드 실패:', error);
    showError(content, '재고 정보를 불러오는데 실패했습니다.');
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
    const claims = response.data.data;

    container.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
        <div class="p-4 border-b border-slate-200 bg-slate-50">
          <h3 class="font-bold text-slate-800">반품 및 교환 요청 내역</h3>
        </div>
        <div class="overflow-auto flex-1">
          <table class="min-w-full text-sm divide-y divide-slate-200">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">요청일시</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">구분</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">원주문</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">상품</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">사유</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">상태</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              ${claims.length > 0 ? claims.map(c => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 text-slate-600">${new Date(c.created_at).toLocaleString()}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${c.type === 'return' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}">
                      ${c.type === 'return' ? '반품' : '교환'}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-600 font-mono">#${c.sale_id}</td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">${c.product_name}</div>
                    <div class="text-xs text-slate-500">${c.quantity}개 <span class="text-slate-400">|</span> ${c.condition || '상태미상'}</div>
                  </td>
                  <td class="px-6 py-4 text-slate-600">${c.reason || '-'}</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold 
                      ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
        c.status === 'rejected' ? 'bg-red-100 text-red-700' :
          c.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}">
                      ${getKoreanStatus(c.status)}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    ${c.status === 'requested' ? `
                      <button onclick="updateClaimStatus(${c.id}, 'approved')" class="text-emerald-600 hover:text-emerald-800 mr-2 font-medium text-xs bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors">승인</button>
                      <button onclick="updateClaimStatus(${c.id}, 'rejected')" class="text-rose-600 hover:text-rose-800 font-medium text-xs bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 transition-colors">거절</button>
                    ` : '-'}
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="7" class="px-6 py-10 text-center text-slate-500">요청 내역이 없습니다.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('클레임 목록 로드 실패:', error);
    showError(container, '클레임 목록을 불러오는데 실패했습니다.');
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

function injectStockModal() {
  if (document.getElementById('stockModal')) return;

  const modalHtml = `
    <div id="stockModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center z-50 transition-all duration-300">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all border border-slate-100">
        <div class="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 id="stockModalTitle" class="text-xl font-bold text-slate-800">재고 관리</h3>
          <button onclick="closeStockModal()" class="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form id="stockForm" onsubmit="submitStockMovement(event)">
          <div class="p-6 space-y-5">
            <input type="hidden" id="stockMovementType">
            
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">상품 선택</label>
              <select id="stockProduct" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white">
                <option value="">상품을 선택하세요</option>
                <!-- 상품 목록이 여기에 동적으로 추가됨 -->
              </select>
            </div>
            
            <div id="currentStockDisplay" class="hidden text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              현재 재고: <span id="currentStockValue" class="font-bold text-indigo-600">0</span>
            </div>

            <div>
              <label id="stockQuantityLabel" class="block text-sm font-semibold text-slate-700 mb-2">수량</label>
              <input type="number" id="stockQuantity" required min="1" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">사유</label>
              <input type="text" id="stockReason" required class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" placeholder="예: 정기 입고, 파손 폐기 등">
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">비고 (선택)</label>
              <textarea id="stockNotes" rows="3" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"></textarea>
            </div>
          </div>
          
          <div class="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100">
            <button type="button" onclick="closeStockModal()" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
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

  // 상품 선택 시 현재 재고 표시 리스너
  document.getElementById('stockProduct').addEventListener('change', function (e) {
    const productId = parseInt(e.target.value);
    const product = window.products.find(p => p.id === productId);
    const display = document.getElementById('currentStockDisplay');
    const value = document.getElementById('currentStockValue');

    if (product) {
      value.textContent = product.current_stock;
      display.classList.remove('hidden');
    } else {
      display.classList.add('hidden');
    }
  });
}

function openStockModal(type) {
  const modal = document.getElementById('stockModal');
  const title = document.getElementById('stockModalTitle');
  const typeInput = document.getElementById('stockMovementType');
  const productSelect = document.getElementById('stockProduct');
  const quantityLabel = document.getElementById('stockQuantityLabel');
  const reasonInput = document.getElementById('stockReason');

  // 폼 초기화
  document.getElementById('stockForm').reset();
  document.getElementById('currentStockDisplay').classList.add('hidden');

  // 상품 옵션 채우기
  productSelect.innerHTML = '<option value="">상품을 선택하세요</option>';
  if (window.products) {
    window.products.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `${p.name} (${p.sku})`;
      productSelect.appendChild(option);
    });
  }

  typeInput.value = type;

  switch (type) {
    case 'in':
      title.textContent = '재고 입고 등록';
      quantityLabel.textContent = '입고 수량';
      reasonInput.value = '정기 입고';
      break;
    case 'out':
      title.textContent = '재고 출고 등록';
      quantityLabel.textContent = '출고 수량';
      reasonInput.value = '판매 출고';
      break;
    case 'adjust':
      title.textContent = '재고 조정';
      quantityLabel.textContent = '실제 재고 수량 (변경할 최종 수량)';
      reasonInput.value = '재고 실사';
      break;
  }

  modal.classList.remove('hidden');
}

function closeStockModal() {
  document.getElementById('stockModal').classList.add('hidden');
}

async function submitStockMovement(e) {
  e.preventDefault();

  const type = document.getElementById('stockMovementType').value;
  const productId = parseInt(document.getElementById('stockProduct').value);
  const quantity = parseInt(document.getElementById('stockQuantity').value);
  const reason = document.getElementById('stockReason').value;
  const notes = document.getElementById('stockNotes').value;

  if (!productId || isNaN(quantity)) {
    alert('상품과 수량을 올바르게 입력해주세요.');
    return;
  }

  const payload = {
    product_id: productId,
    reason: reason,
    notes: notes
  };

  // API 엔드포인트 및 데이터 설정
  let endpoint = '';
  if (type === 'adjust') {
    endpoint = '/stock/adjust';
    payload.new_stock = quantity; // 조정일 경우 최종 수량
  } else {
    endpoint = `/stock/${type}`; // in or out
    payload.quantity = quantity;
  }

  try {
    await axios.post(`${API_BASE}${endpoint}`, payload);
    showSuccess('처리가 완료되었습니다.');
    closeStockModal();
    loadPage('stock'); // 목록 새로고침
  } catch (error) {
    console.error('재고 처리 실패:', error);
    const msg = error.response?.data?.error || '처리 중 오류가 발생했습니다.';
    alert(msg);
  }
}

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
