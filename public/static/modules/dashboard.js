/**
 * Dashboard Module
 */
import { API_BASE } from '../utils/constants.js';

// 대시보드 로드
export async function loadDashboard(content) {
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


