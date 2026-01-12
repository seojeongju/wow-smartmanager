/**
 * Customers Module
 */
import { API_BASE } from '../utils/constants.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { showSuccess, showError } from '../utils/ui.js';
import { downloadCSV } from '../utils/files.js';

// 고객 관리 로드 (간단 버전)
export async function loadCustomers(content) {
  content.innerHTML = '<div class="flex items-center justify-center h-full"><i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i></div>';

  try {
    const response = await axios.get(`${API_BASE}/customers`);
    window.allCustomers = response.data.data;
    window.customerState = { search: '', grade: '', page: 1 };

    renderCustomerPage(content);
  } catch (error) {
    showError(content, '고객 데이터 로드 실패');
  }
}

export function renderCustomerPage(content) {
  const total = window.allCustomers.length;
  const vips = window.allCustomers.filter(c => c.grade && (c.grade.includes('VIP') || c.grade === 'VVIP')).length;
  const newCustomers = window.allCustomers.filter(c => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalSales = window.allCustomers.reduce((a, c) => a + (c.total_purchase_amount || 0), 0);

  content.innerHTML = `
      <div class="flex flex-col h-full bg-slate-50 overflow-hidden">
          <div class="px-8 py-6 bg-white border-b border-slate-200">
             <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold text-slate-800 flex items-center">
                    <i class="fas fa-users text-indigo-600 mr-2"></i>고객 관리
                </h1>
                <div class="flex gap-2">
                    <button onclick="downloadCustomers()" class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-bold transition-colors text-sm border border-emerald-200">
                        <i class="fas fa-file-excel mr-2"></i>엑셀
                    </button>
                    <button onclick="showCustomerModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 text-sm">
                        <i class="fas fa-plus mr-2"></i>고객 등록
                    </button>
                </div>
             </div>
             
             <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-4">
                    <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 shadow-sm text-xl"><i class="fas fa-user-friends"></i></div>
                    <div>
                        <div class="text-xs text-indigo-500 font-bold uppercase mb-1">전체 고객</div>
                        <div class="text-2xl font-bold text-slate-800">${total.toLocaleString()}명</div>
                    </div>
                </div>
                 <div class="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-4">
                    <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-amber-500 shadow-sm text-xl"><i class="fas fa-crown"></i></div>
                    <div>
                        <div class="text-xs text-amber-600 font-bold uppercase mb-1">VIP / VVIP</div>
                        <div class="text-2xl font-bold text-slate-800">${vips.toLocaleString()}명</div>
                    </div>
                </div>
                 <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
                    <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 shadow-sm text-xl"><i class="fas fa-user-plus"></i></div>
                    <div>
                        <div class="text-xs text-emerald-600 font-bold uppercase mb-1">이달의 신규</div>
                        <div class="text-2xl font-bold text-slate-800">${newCustomers.toLocaleString()}명</div>
                    </div>
                </div>
                  <div class="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                     <div class="bg-white w-12 h-12 rounded-full flex items-center justify-center text-slate-500 shadow-sm text-xl"><i class="fas fa-coins"></i></div>
                     <div>
                        <div class="text-xs text-slate-500 font-bold uppercase mb-1">총 구매액</div>
                        <div class="text-lg font-bold text-slate-800">₩${(totalSales / 10000).toLocaleString()}만원</div>
                     </div>
                 </div>
             </div>
          </div>

          <div class="px-8 py-4 bg-white border-b border-slate-200 flex flex-wrap gap-4 items-center">
             <div class="relative flex-1 min-w-[300px]">
                 <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                 <input type="text" id="custSearch" class="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                        placeholder="이름, 연락처, 회사명으로 검색..." onkeyup="filterCustomers()">
             </div>
             <div class="flex items-center gap-2">
                 <select id="custGrade" class="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-slate-700 font-medium text-sm" onchange="filterCustomers()">
                     <option value="">전체 등급</option>
                     <option value="일반">일반</option>
                     <option value="VIP">VIP</option>
                     <option value="VVIP">VVIP</option>
                 </select>
             </div>
          </div>

          <div class="flex-1 overflow-auto p-8" id="customerListArea"></div>
      </div>
   `;

  injectCustomerModal();
  filterCustomers();
}

export  function filterCustomers () {
  const search = document.getElementById('custSearch')?.value.toLowerCase() || '';
  const grade = document.getElementById('custGrade')?.value || '';

  const filtered = window.allCustomers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search) || c.phone.includes(search) || (c.company || '').toLowerCase().includes(search);
    const matchGrade = grade ? c.grade === grade : true;
    return matchSearch && matchGrade;
  });

  renderCustomerTable(filtered);
}

export function renderCustomerTable(customers) {
  const area = document.getElementById('customerListArea');
  if (customers.length === 0) {
    area.innerHTML = '<div class="text-center py-20 text-slate-400"><i class="fas fa-user-slash text-4xl mb-4 text-slate-200"></i><p>조건에 맞는 고객이 없습니다.</p></div>';
    return;
  }

  area.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th class="px-6 py-4 border-b border-slate-100">고객명</th>
                        <th class="px-6 py-4 border-b border-slate-100">연락처/이메일</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-center">등급</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-right">총 구매액</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-center">구매횟수</th>
                        <th class="px-6 py-4 border-b border-slate-100 text-center">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    ${customers.map(c => `
                    <tr class="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onclick="openCustomerDetail(${c.id})">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full ${['VIP', 'VVIP'].includes(c.grade) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'} flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                    ${c.name.charAt(0)}
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">${c.name}</div>
                                    <div class="text-xs text-slate-400">${c.company || '개인고객'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-slate-600 font-mono tracking-tight"><i class="fas fa-phone-alt w-3 text-slate-300 mr-1"></i> ${c.phone}</div>
                            ${c.email ? `<div class="text-xs text-slate-400 mt-0.5 font-mono"><i class="fas fa-envelope w-3 text-slate-300 mr-1"></i> ${c.email}</div>` : ''}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border 
                                ${c.grade === 'VVIP' ? 'bg-purple-50 text-purple-700 border-purple-100' :
      c.grade === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}">
                                ${c.grade}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right font-mono font-bold text-slate-700">
                            ₩${(c.total_purchase_amount || 0).toLocaleString()}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <span class="text-sm text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">${c.purchase_count || 0}회</span>
                        </td>
                        <td class="px-6 py-4 text-center" onclick="event.stopPropagation()">
                             <div class="flex justify-center gap-1">
                                <button onclick="editCustomer(${c.id})" class="text-slate-400 hover:text-indigo-600 p-2 transition-colors rounded hover:bg-indigo-50" title="수정"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteCustomer(${c.id})" class="text-slate-400 hover:text-rose-500 p-2 transition-colors rounded hover:bg-rose-50" title="삭제"><i class="fas fa-trash"></i></button>
                             </div>
                        </td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export async  function openCustomerDetail (id) {
  if (!document.getElementById('customerDetailModal')) {
    injectCustomerDetailModal();
  }

  const customer = window.allCustomers.find(c => c.id === id);
  if (!customer) return;

  const modal = document.getElementById('customerDetailModal');
  const content = document.getElementById('customerDetailContent');

  content.innerHTML = '<div class="flex justify-center p-20"><i class="fas fa-spinner fa-spin text-3xl text-indigo-500"></i></div>';
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.remove('opacity-0'), 10);

  let purchaseHistoryHtml = '<div class="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">구매 이력이 없습니다.</div>';
  try {
    const res = await axios.get(`${API_BASE}/customers/${id}/purchases`);
    const purchases = res.data.data;
    if (purchases.length > 0) {
      purchaseHistoryHtml = `
               <table class="w-full text-sm text-left">
                  <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                    <tr><th class="p-3 pl-4">날짜</th><th class="p-3">구매 상품</th><th class="p-3 text-right pr-4">금액</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${purchases.map(p => `
                        <tr class="hover:bg-slate-50">
                            <td class="p-3 pl-4 text-slate-500 whitespace-nowrap font-mono text-xs">${new Date(p.created_at).toLocaleDateString()}</td>
                            <td class="p-3 text-slate-800 font-medium">${p.items || '상품 정보 없음'}</td>
                            <td class="p-3 pr-4 text-right font-mono font-bold text-slate-700">₩${p.total_amount.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                  </tbody>
               </table>
            `;
    }
  } catch (e) { console.error(e); }

  content.innerHTML = `
       <div class="flex flex-col md:flex-row gap-8">
           <div class="w-full md:w-1/3 md:border-r md:border-slate-100 md:pr-6">
               <div class="flex flex-col items-center mb-6">
                   <div class="w-24 h-24 rounded-full ${['VIP', 'VVIP'].includes(customer.grade) ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
                       ${customer.name.charAt(0)}
                   </div>
                   <h2 class="text-2xl font-bold text-slate-800 mb-1">${customer.name}</h2>
                   <span class="px-3 py-1 rounded-full text-xs font-bold border ${customer.grade === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}">${customer.grade} Member</span>
                   
                   <div class="mt-6 w-full space-y-2">
                       <button onclick="openContractModal(null, {id: ${customer.id}, name: '${customer.name}'})" class="w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                          <i class="fas fa-file-contract"></i>계약 단가 관리
                       </button>
                        <button onclick="editCustomer(${customer.id}); document.getElementById('customerDetailModal').classList.add('hidden');" class="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold text-sm transition-colors">
                          <i class="fas fa-edit mr-2"></i>정보 수정
                       </button>
                   </div>
               </div>
               
               <div class="space-y-4 text-sm mt-8">
                   <div class="flex justify-between items-center py-2 border-b border-slate-50">
                       <span class="text-slate-500"><i class="fas fa-phone mr-2 text-slate-300"></i>연락처</span> 
                       <span class="font-medium text-slate-800 font-mono">${customer.phone}</span>
                   </div>
                   <div class="flex justify-between items-center py-2 border-b border-slate-50">
                       <span class="text-slate-500"><i class="fas fa-envelope mr-2 text-slate-300"></i>이메일</span> 
                       <span class="font-medium text-slate-800">${customer.email || '-'}</span>
                   </div>
                   <div class="flex justify-between items-center py-2 border-b border-slate-50">
                       <span class="text-slate-500"><i class="fas fa-building mr-2 text-slate-300"></i>회사/부서</span> 
                       <span class="font-medium text-slate-800 text-right">${customer.company || '-'}${customer.department ? ' / ' + customer.department : ''}</span>
                   </div>
                    <div class="flex justify-between items-center py-2">
                       <span class="text-slate-500"><i class="fas fa-calendar mr-2 text-slate-300"></i>등록일</span> 
                       <span class="font-medium text-slate-800 font-mono">${new Date(customer.created_at).toLocaleDateString()}</span>
                   </div>
               </div>
               
               <div class="mt-6">
                    <h4 class="font-bold text-slate-700 mb-2 text-xs uppercase"><i class="fas fa-sticky-note mr-1 text-slate-400"></i>메모</h4>
                    <div class="text-sm text-slate-600 bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl min-h-[80px]">
                        ${customer.notes ? customer.notes.replace(/\n/g, '<br>') : '<span class="text-slate-400 italic">등록된 메모가 없습니다.</span>'}
                    </div>
               </div>
           </div>
           
           <div class="w-full md:w-2/3 mt-6 md:mt-0">
               <div class="flex justify-between items-end mb-4">
                   <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                       <i class="fas fa-history text-indigo-500"></i> 구매 이력
                   </h3>
                   <span class="text-xs text-slate-500">최근 30건</span>
               </div>
               <div class="bg-white border boundary-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
                   ${purchaseHistoryHtml}
               </div>
           </div>
       </div>
    `;
}

export function injectCustomerDetailModal() {
  const html = `
      <div id="customerDetailModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 hidden transition-opacity opacity-0 flex items-center justify-center p-4" onclick="if(event.target===this) this.classList.add('hidden')">
         <div class="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transform transition-all scale-100 flex flex-col">
             <div class="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur sticky top-0 bg-white/90 z-10">
                 <h3 class="font-bold text-lg text-slate-800">고객 상세 정보</h3>
                 <button onclick="document.getElementById('customerDetailModal').classList.add('hidden')" class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors">
                    <i class="fas fa-times"></i>
                 </button>
             </div>
             <div class="p-8" id="customerDetailContent">
             </div>
         </div>
      </div>
    `;
  document.body.insertAdjacentHTML('beforeend', html);
}

// 고객 데이터 다운로드
export async function downloadCustomers() {
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

// --- 고객 관리 모달 ---

export function injectCustomerModal() {
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

export function toggleGradeInput(value) {
  const input = document.getElementById('custGradeInput');
  if (value === 'custom') {
    input.classList.remove('hidden');
    input.required = true;
  } else {
    input.classList.add('hidden');
    input.required = false;
  }
}

export function showCustomerModal() {
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

export async function editCustomer(id) {
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

export function closeCustomerModal() {
  document.getElementById('customerModal').classList.add('hidden');
}

export async function submitCustomer(e) {
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
    window.loadPage('customers');
  } catch (error) {
    console.error('고객 저장 실패:', error);
    const msg = error.response?.data?.error || '저장 중 오류가 발생했습니다.';
    alert(msg);
  }
}

export function deleteCustomer(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    axios.delete(`${API_BASE}/customers/${id}`)
      .then(() => {
        showSuccess('삭제되었습니다.');
        window.loadPage('customers');
      })
      .catch(err => alert('삭제 실패: ' + err.message));
  }
}
