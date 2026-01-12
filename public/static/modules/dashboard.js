/**
 * Dashboard Module
 */
import { API_BASE } from '../utils/constants.js';

// Pagination state
window.dashboardState = {
  recentProducts: { page: 1, data: [], itemsPerPage: 5 },
  recentSales: { page: 1, data: [], itemsPerPage: 5 },
  lowStock: { page: 1, data: [], itemsPerPage: 5 },
  salesChartView: 'daily', // 'daily' or 'monthly'
  salesChartData: null,
  categoryView: 'chart', // 'chart' or 'list'
  categoryData: null
};

// 대시보드 로드
export async function loadDashboard(content) {
  try {
    // 병렬 데이터 로드 - limit을 늘려서 더 많은 데이터 가져오기
    const [summaryRes, salesChartRes, categoryStatsRes, recentProductsRes, recentSalesRes, lowStockRes] = await Promise.all([
      axios.get(`${API_BASE}/dashboard/summary`),
      axios.get(`${API_BASE}/dashboard/sales-chart?days=30`),
      axios.get(`${API_BASE}/dashboard/category-stats`),
      axios.get(`${API_BASE}/dashboard/recent-products?limit=20`), // 20개로 증가
      axios.get(`${API_BASE}/dashboard/recent-sales?limit=20`),    // 20개로 증가
      axios.get(`${API_BASE}/dashboard/low-stock-alerts?limit=20`) // 20개로 증가
    ]);

    const summary = summaryRes.data.data;
    const salesData = salesChartRes.data.data;
    const categoryData = categoryStatsRes.data.data;

    // 페이지네이션 상태 업데이트
    window.dashboardState.recentProducts.data = recentProductsRes.data.data;
    window.dashboardState.recentSales.data = recentSalesRes.data.data;
    window.dashboardState.lowStock.data = lowStockRes.data.data;

    const recentProducts = window.dashboardState.recentProducts.data;
    const recentSales = window.dashboardState.recentSales.data;
    const lowStock = window.dashboardState.lowStock.data;

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
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-800 flex items-center">
              <i class="fas fa-chart-line mr-2 text-indigo-500"></i>매출 및 순익 분석
            </h3>
            <div class="flex bg-slate-50 rounded-lg p-1">
              <button onclick="switchSalesChartView('daily')" id="btnChartDaily" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200 transition-all">일별</button>
              <button onclick="switchSalesChartView('monthly')" id="btnChartMonthly" class="px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all">월별</button>
            </div>
          </div>
          
          <!-- 요약 통계 -->
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg p-3 border border-indigo-200">
              <p class="text-xs text-indigo-600 font-semibold mb-1">총 매출</p>
              <p class="text-lg font-bold text-indigo-700" id="chartTotalRevenue">-</p>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200">
              <p class="text-xs text-emerald-600 font-semibold mb-1">총 순익</p>
              <p class="text-lg font-bold text-emerald-700" id="chartTotalProfit">-</p>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-3 border border-amber-200">
              <p class="text-xs text-amber-600 font-semibold mb-1">평균 성장률</p>
              <p class="text-lg font-bold text-amber-700" id="chartGrowthRate">-</p>
            </div>
          </div>
          
          <div class="h-[280px]">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <!-- 카테고리별 비중 (1칸 차지) -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-800 flex items-center">
              <i class="fas fa-chart-pie mr-2 text-emerald-500"></i>카테고리별 판매 비중
            </h3>
            <div class="flex bg-slate-50 rounded-lg p-1">
              <button onclick="switchCategoryView('chart')" id="btnCategoryChart" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200 transition-all">
                <i class="fas fa-chart-pie text-[10px] mr-1"></i>차트
              </button>
              <button onclick="switchCategoryView('list')" id="btnCategoryList" class="px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all">
                <i class="fas fa-list text-[10px] mr-1"></i>리스트
              </button>
            </div>
          </div>
          
          <!-- 차트 뷰 -->
          <div id="categoryChartView" class="h-[340px]">
            <div class="h-full flex items-center justify-center relative">
              <canvas id="categoryChart"></canvas>
              <!-- 중앙 텍스트는 차트 렌더링 후 추가 -->
            </div>
          </div>
          
          <!-- 리스트 뷰 -->
          <div id="categoryListView" class="hidden h-[340px] overflow-y-auto">
            <div id="categoryListContent" class="space-y-2">
              <!-- 동적으로 채워짐 -->
            </div>
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
            <ul class="space-y-4" id="recentProductsList">
              ${renderPaginatedProducts()}
            </ul>
          </div>
          <div class="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
             <button onclick="changeDashboardPage('recentProducts', -1)" id="btnProductsPrev" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               <i class="fas fa-chevron-left mr-1"></i>이전
             </button>
             <span class="text-xs font-mono text-slate-600" id="productsPageIndicator">1 / 1</span>
             <button onclick="changeDashboardPage('recentProducts', 1)" id="btnProductsNext" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               다음<i class="fas fa-chevron-right ml-1"></i>
             </button>
          </div>
          <div class="px-4 pb-4 text-center border-t border-slate-50">
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
            <ul class="space-y-4" id="recentSalesList">
              ${renderPaginatedSales()}
            </ul>
          </div>
          <div class="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
             <button onclick="changeDashboardPage('recentSales', -1)" id="btnSalesPrev" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               <i class="fas fa-chevron-left mr-1"></i>이전
             </button>
             <span class="text-xs font-mono text-slate-600" id="salesPageIndicator">1 / 1</span>
             <button onclick="changeDashboardPage('recentSales', 1)" id="btnSalesNext" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               다음<i class="fas fa-chevron-right ml-1"></i>
             </button>
          </div>
          <div class="px-4 pb-4 text-center border-t border-slate-50">
             <button onclick="loadPage('sales')" class="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center w-full py-1">
                전체보기 <i class="fas fa-chevron-right ml-1 text-[10px]"></i>
             </button>
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
            <ul class="space-y-3" id="lowStockList">
              ${renderPaginatedLowStock()}
            </ul>
          </div>
          <div class="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
             <button onclick="changeDashboardPage('lowStock', -1)" id="btnLowStockPrev" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               <i class="fas fa-chevron-left mr-1"></i>이전
             </button>
             <span class="text-xs font-mono text-slate-600" id="lowStockPageIndicator">1 / 1</span>
             <button onclick="changeDashboardPage('lowStock', 1)" id="btnLowStockNext" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
               다음<i class="fas fa-chevron-right ml-1"></i>
             </button>
          </div>
          <div class="px-4 pb-4 text-center border-t border-slate-50">
             <button onclick="loadPage('stock')" class="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center w-full py-1">
                전체보기 <i class="fas fa-chevron-right ml-1 text-[10px]"></i>
             </button>
          </div>
        </div>
      </div>
    `;

    // 차트 데이터 저장
    window.dashboardState.salesChartData = salesData;
    window.dashboardState.categoryData = categoryData;

    // 차트 렌더링
    renderSalesChart(salesData);
    renderCategoryChart(categoryData);

    // 페이지 인디케이터 업데이트
    updateDashboardPaginationControls();

  } catch (error) {
    console.error('대시보드 로드 실패:', error);
    showError(content, '대시보드 정보를 불러오는데 실패했습니다.');
  }
}

// 페이지네이션 렌더링 함수들
function renderPaginatedProducts() {
  const { page, data, itemsPerPage } = window.dashboardState.recentProducts;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = data.slice(start, end);

  if (pageData.length === 0) {
    return '<li class="text-center text-slate-400 py-8 text-sm">등록된 상품이 없습니다.</li>';
  }

  return pageData.map(p => `
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
  `).join('');
}

function renderPaginatedSales() {
  const { page, data, itemsPerPage } = window.dashboardState.recentSales;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = data.slice(start, end);

  if (pageData.length === 0) {
    return '<li class="text-center text-slate-400 py-4 text-sm">판매 내역이 없습니다.</li>';
  }

  return pageData.map(s => `
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
  `).join('');
}

function renderPaginatedLowStock() {
  const { page, data, itemsPerPage } = window.dashboardState.lowStock;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = data.slice(start, end);

  if (pageData.length === 0) {
    return '<li class="text-center text-slate-400 py-4 text-sm">재고 부족 상품이 없습니다.</li>';
  }

  return pageData.map(p => `
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
  `).join('');
}

// 페이지 변경 함수
export function changeDashboardPage(widgetName, delta) {
  const state = window.dashboardState[widgetName];
  if (!state) return;

  const totalPages = Math.ceil(state.data.length / state.itemsPerPage);
  const newPage = state.page + delta;

  if (newPage >= 1 && newPage <= totalPages) {
    state.page = newPage;

    // 위젯별 리스트 업데이트
    if (widgetName === 'recentProducts') {
      document.getElementById('recentProductsList').innerHTML = renderPaginatedProducts();
    } else if (widgetName === 'recentSales') {
      document.getElementById('recentSalesList').innerHTML = renderPaginatedSales();
    } else if (widgetName === 'lowStock') {
      document.getElementById('lowStockList').innerHTML = renderPaginatedLowStock();
    }

    updateDashboardPaginationControls();
  }
}

// 페이지네이션 컨트롤 업데이트
function updateDashboardPaginationControls() {
  // 최근 상품
  const productsState = window.dashboardState.recentProducts;
  const productsTotalPages = Math.ceil(productsState.data.length / productsState.itemsPerPage);
  document.getElementById('productsPageIndicator').textContent = `${productsState.page} / ${productsTotalPages}`;
  document.getElementById('btnProductsPrev').disabled = productsState.page <= 1;
  document.getElementById('btnProductsNext').disabled = productsState.page >= productsTotalPages;

  // 최근 판매
  const salesState = window.dashboardState.recentSales;
  const salesTotalPages = Math.ceil(salesState.data.length / salesState.itemsPerPage);
  document.getElementById('salesPageIndicator').textContent = `${salesState.page} / ${salesTotalPages}`;
  document.getElementById('btnSalesPrev').disabled = salesState.page <= 1;
  document.getElementById('btnSalesNext').disabled = salesState.page >= salesTotalPages;

  // 재고 부족
  const lowStockState = window.dashboardState.lowStock;
  const lowStockTotalPages = Math.ceil(lowStockState.data.length / lowStockState.itemsPerPage);
  document.getElementById('lowStockPageIndicator').textContent = `${lowStockState.page} / ${lowStockTotalPages}`;
  document.getElementById('btnLowStockPrev').disabled = lowStockState.page <= 1;
  document.getElementById('btnLowStockNext').disabled = lowStockState.page >= lowStockTotalPages;
}

// 매출 차트 렌더링 함수
function renderSalesChart(salesData) {
  // 기존 차트 제거
  const existingChart = Chart.getChart("salesChart");
  if (existingChart) existingChart.destroy();

  const ctx = document.getElementById('salesChart').getContext('2d');

  // 그라데이션 효과 (매출)
  const revenueGradient = ctx.createLinearGradient(0, 0, 0, 280);
  revenueGradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
  revenueGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

  // 그라데이션 효과 (순익)
  const profitGradient = ctx.createLinearGradient(0, 0, 0, 280);
  profitGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
  profitGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

  // 라벨 포맷팅
  const view = window.dashboardState.salesChartView;
  const labels = salesData.map(d => {
    if (view === 'monthly') {
      return d.date.substring(0, 7); // YYYY-MM
    }
    return d.date.substring(5); // MM-DD
  });

  // 통계 계산
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalProfit = salesData.reduce((sum, d) => sum + (d.profit || d.revenue * 0.3), 0);
  const avgGrowthRate = calculateGrowthRate(salesData.map(d => d.revenue));

  // 요약 카드 업데이트
  document.getElementById('chartTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('chartTotalProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('chartGrowthRate').textContent = avgGrowthRate >= 0 ? `+${avgGrowthRate.toFixed(1)}%` : `${avgGrowthRate.toFixed(1)}%`;
  document.getElementById('chartGrowthRate').className = avgGrowthRate >= 0
    ? 'text-lg font-bold text-emerald-700'
    : 'text-lg font-bold text-rose-700';

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '매출액',
          data: salesData.map(d => d.revenue),
          borderColor: '#6366f1',
          backgroundColor: revenueGradient,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#6366f1',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          order: 1
        },
        {
          label: '순익',
          data: salesData.map(d => d.profit || d.revenue * 0.3), // 순익 데이터가 없으면 매출의 30%로 계산
          borderColor: '#10b981',
          backgroundColor: profitGradient,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            font: { size: 11, weight: '600', family: 'Inter' },
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          bodySpacing: 6,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += formatCurrency(context.parsed.y);
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [4, 4],
            color: '#f1f5f9',
            drawBorder: false
          },
          ticks: {
            callback: value => formatCurrency(value).replace('₩', ''),
            font: { size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: view === 'monthly' ? 12 : 15,
            font: { size: 11 }
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    }
  });
}

// 차트 뷰 전환 함수
export async function switchSalesChartView(view) {
  if (window.dashboardState.salesChartView === view) return;

  window.dashboardState.salesChartView = view;

  // 버튼 스타일 업데이트
  const dailyBtn = document.getElementById('btnChartDaily');
  const monthlyBtn = document.getElementById('btnChartMonthly');

  if (view === 'daily') {
    dailyBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200 transition-all';
    monthlyBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
  } else {
    dailyBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    monthlyBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200 transition-all';
  }

  // 새로운 데이터 로드
  try {
    const endpoint = view === 'daily'
      ? `${API_BASE}/dashboard/sales-chart?days=30`
      : `${API_BASE}/dashboard/sales-chart?months=12`;

    const response = await axios.get(endpoint);
    const salesData = response.data.data;

    window.dashboardState.salesChartData = salesData;
    renderSalesChart(salesData);
  } catch (error) {
    console.error('차트 데이터 로드 실패:', error);
    // 에러 시 기존 데이터로 렌더링
    renderSalesChart(window.dashboardState.salesChartData);
  }
}

// 성장률 계산 헬퍼 함수
function calculateGrowthRate(data) {
  if (!data || data.length < 2) return 0;

  const recentAvg = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const previousAvg = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;

  if (previousAvg === 0) return 0;
  return ((recentAvg - previousAvg) / previousAvg) * 100;
}

// 카테고리 차트 렌더링 함수
function renderCategoryChart(categoryData) {
  // 기존 차트 제거
  const existingChart = Chart.getChart("categoryChart");
  if (existingChart) existingChart.destroy();

  const categoryCtx = document.getElementById('categoryChart').getContext('2d');

  // 색상 팔레트
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ];

  // 총 매출 계산
  const totalRevenue = categoryData.reduce((sum, d) => sum + d.total_revenue, 0);

  new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: categoryData.map(d => d.category),
      datasets: [{
        data: categoryData.map(d => d.total_revenue),
        backgroundColor: colors.slice(0, categoryData.length),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8,
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'point'
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            padding: 12,
            font: { size: 11, weight: '600', family: 'Inter' },
            color: '#64748b'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const percentage = ((value / totalRevenue) * 100).toFixed(1);
              return ` ${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 800,
        easing: 'easeInOutQuart'
      }
    },
    plugins: [{
      id: 'centerText',
      beforeDraw: function (chart) {
        const { ctx, width, height } = chart;
        ctx.restore();

        const fontSize = Math.floor(height / 180);
        ctx.font = `${fontSize * 2.5}px Inter`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e293b';
        ctx.fontWeight = 'bold';

        const text = formatCurrency(totalRevenue);
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2 - fontSize;

        ctx.fillText(text, textX, textY);

        // 서브텍스트
        ctx.font = `${fontSize}px Inter`;
        ctx.fillStyle = '#64748b';
        const subText = '총 매출';
        const subTextX = Math.round((width - ctx.measureText(subText).width) / 2);
        const subTextY = height / 2 + fontSize * 1.5;

        ctx.fillText(subText, subTextX, subTextY);
        ctx.save();
      }
    }]
  });

  // 리스트 뷰 렌더링
  renderCategoryList(categoryData, totalRevenue);
}

// 카테고리 리스트 렌더링
function renderCategoryList(categoryData, totalRevenue) {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ];

  // 매출액 기준 정렬
  const sortedData = [...categoryData].sort((a, b) => b.total_revenue - a.total_revenue);

  const listHTML = sortedData.map((item, index) => {
    const percentage = ((item.total_revenue / totalRevenue) * 100).toFixed(1);
    const color = colors[index % colors.length];

    return `
      <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
        <div class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" style="background-color: ${color}20; color: ${color};">
          ${index + 1}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <p class="font-semibold text-slate-800 text-sm truncate">${item.category}</p>
            <span class="text-xs font-mono text-slate-500 ml-2">${percentage}%</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${percentage}%; background-color: ${color};"></div>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-slate-800 text-sm">${formatCurrency(item.total_revenue)}</p>
          <p class="text-[10px] text-slate-500">${item.total_quantity || '-'}개</p>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('categoryListContent').innerHTML = listHTML || '<div class="text-center text-slate-400 py-8">데이터가 없습니다.</div>';
}

// 카테고리 뷰 전환 함수
export function switchCategoryView(view) {
  if (window.dashboardState.categoryView === view) return;

  window.dashboardState.categoryView = view;

  // 버튼 스타일 업데이트
  const chartBtn = document.getElementById('btnCategoryChart');
  const listBtn = document.getElementById('btnCategoryList');

  if (view === 'chart') {
    chartBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200 transition-all';
    listBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';

    document.getElementById('categoryChartView').classList.remove('hidden');
    document.getElementById('categoryListView').classList.add('hidden');
  } else {
    chartBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    listBtn.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-800 shadow-sm border border-slate-200 transition-all';

    document.getElementById('categoryChartView').classList.add('hidden');
    document.getElementById('categoryListView').classList.remove('hidden');
  }
}

