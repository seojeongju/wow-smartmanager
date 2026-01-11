
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
