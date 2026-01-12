/**
 * 대시보드 모듈
 * @fileoverview 대시보드 페이지 관리
 * TODO: Phase 4에서 구현
 */

export class DashboardModule {
    constructor() {
        this.data = null;
    }

    async load(container) {
        // TODO: Phase 4에서 구현
        container.innerHTML = '<div class="p-4">Dashboard Module - To be implemented in Phase 4</div>';
    }
}

export default DashboardModule;
