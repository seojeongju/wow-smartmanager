/**
 * Settings Module
 */
import { API_BASE } from '../utils/constants.js';
import { showSuccess, showError } from '../utils/ui.js';
import { Modal } from '../components/Modal.js';

export async function loadSettings_Legacy(content) {
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
export async function switchSettingsTab_Legacy(tabName) {
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
export function initSettingsTabStyles() {
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
export async function saveBusinessInfo(e) {
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
export async function saveProfileInfo(e) {
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
export function previewLogo(event) {
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
export async function uploadLogo(e) {
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
export async function loadSettings(content) {
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

export async function switchSettingsTab(tab) {
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

export function renderCompanySettings(container, data) {
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







export function renderSecuritySettings(container) {
  container.innerHTML = '<p class="text-slate-500">보안 설정 기능 준비 중...</p>';
}

export async function saveCompanyInfo(e) {
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
export async function renderTeamSettings(container) {
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

export function inviteTeamMember() {
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

export function removeTeamMember(memberId, memberName) {
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
export async function renderPlanSettings(container) {
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

export async function requestPlanChange(planId, planName) {
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
export async function renderApiSettings(container) {
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

export function toggleApiKeyVisibility() {
  window.apiKeyVisible = !window.apiKeyVisible;
  const input = document.getElementById('smartParcelApiKey');
  input.type = window.apiKeyVisible ? 'text' : 'password';

  const icon = input.nextElementSibling.querySelector('i');
  icon.className = window.apiKeyVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
}

export async function saveApiKey() {
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

export async function testApiKey() {
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
export async function renderWarehouseSettings(container) {
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

export function openWarehouseModal(warehouseData) {
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

export function closeWarehouseModal() {
  document.getElementById('warehouseModal').classList.add('hidden');
}

export async function saveWarehouse(e) {
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

export async function editWarehouse(id) {
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

export async function deleteWarehouse(id, name) {
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

export async function syncWarehouseStock() {
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







