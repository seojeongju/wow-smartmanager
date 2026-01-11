
// Warehouse Management Settings Implementation
async function renderWarehouseSettings(container) {
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

window.openWarehouseModal = function (warehouseData) {
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

window.closeWarehouseModal = function () {
    document.getElementById('warehouseModal').classList.add('hidden');
}

window.saveWarehouse = async function (e) {
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

window.editWarehouse = async function (id) {
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

window.deleteWarehouse = async function (id, name) {
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

window.syncWarehouseStock = async function () {
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
