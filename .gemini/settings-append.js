
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
          <button onclick="switchSettingsTab('security')" id="tab-security" class="px-4 py-2 text-slate-500 border-b-2 border-transparent">보안 설정</button>
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
        } else {
            renderSecuritySettings(container);
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
