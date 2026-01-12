/**
 * System Module
 * 시스템 관리 기능 (조직, 사용자, 통계, 플랜)
 */
import { API_BASE } from '../utils/constants.js';
import { Modal } from '../components/Modal.js';
import { showError, showSuccess } from '../utils/ui.js';

// 시스템 관리
export async function loadSystem(content) {
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

export async  function switchSystemTab (tab) {
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

export async function renderSystemTenants(container) {
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

export async function renderSystemUsers(container) {
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

export async function renderSystemStats(container) {
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

export async function renderPlanRequests(container) {
  const res = await axios.get(`${API_BASE}/system/plan-requests`);
  const requests = res.data.data;

  // 전역 변수에 요청 데이터 저장 (ID로 접근 가능)
  window._planRequests = {};
  requests.forEach(r => {
    window._planRequests[r.id] = {
      tenantName: r.tenant_name,
      currentPlan: r.current_plan,
      requestedPlan: r.requested_plan
    };
  });

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
                                    <button onclick="processPlanRequest(${r.id}, 'approve')" class="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-bold mr-1 border border-emerald-200 transition-colors">수락</button>
                                    <button onclick="processPlanRequest(${r.id}, 'reject')" class="text-rose-500 hover:bg-rose-50 px-2 py-1 rounded text-xs font-bold border border-rose-200 transition-colors">거절</button>
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
export  function openTenantModal () {
  const modalId = 'tenantCreateModal';
  const content = `
    <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
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
  `;

  new Modal({
    id: modalId,
    content: content,
    size: 'md'
  }).open();

  setTimeout(() => {
    const input = document.getElementById('tenantName');
    if (input) input.focus();
  }, 100);
}

export  function closeTenantModal (type) {
  const modalId = type === 'create' ? 'tenantCreateModal' : type === 'edit' ? 'tenantEditModal' : 'tenantDetailModal';
  const closeFunc = window[`Modal_${modalId}_close`];
  if (typeof closeFunc === 'function') {
    closeFunc();
  } else {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  }
}

export async  function submitCreateTenant () {
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
export async  function viewTenantDetail (tenantId) {
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
export  function editTenant (tenantId, currentName, currentPlan, currentStatus) {
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

export async  function submitEditTenant (tenantId) {
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
export async  function deleteTenant (tenantId, tenantName) {
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
export  function manageTenant (tenantId) {
  // TODO: 조직 관리 대시보드로 이동하는 기능
  // 현재는 상세보기와 동일하게 처리
  alert(`조직 #${tenantId} 관리 기능은 추후 구현 예정입니다.\n현재는 상세보기로 이동합니다.`);
  viewTenantDetail(tenantId);
}

// 플랜 변경 요청 처리 (수락/거절)
export async  function processPlanRequest (id, action) {
  // 전역 변수에서 요청 정보 가져오기
  const requestData = window._planRequests?.[id];
  const tenantName = requestData?.tenantName || '';
  const currentPlan = requestData?.currentPlan || '';
  const requestedPlan = requestData?.requestedPlan || '';

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
export async  function resetUserPassword (userId, userName) {
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
export  function changeUserRole (userId, userName, currentRole) {
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

export  function closeRoleModal () {
  const modal = document.getElementById('roleChangeModal');
  if (modal) {
    modal.classList.add('opacity-0');
    modal.querySelector('.bg-white').classList.add('scale-95');
    modal.querySelector('.bg-white').classList.remove('scale-100');
    setTimeout(() => modal.remove(), 300);
  }
}

export async  function selectRole (newRole, userId, userName) {
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


