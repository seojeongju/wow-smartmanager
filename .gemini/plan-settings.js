
// Plan Settings Implementation
async function renderPlanSettings(container) {
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

window.requestPlanChange = async function (planId, planName) {
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
