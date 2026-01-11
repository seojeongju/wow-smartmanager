
// Team Settings Implementation
async function renderTeamSettings(container) {
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

window.inviteTeamMember = function () {
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

window.removeTeamMember = function (memberId, memberName) {
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
