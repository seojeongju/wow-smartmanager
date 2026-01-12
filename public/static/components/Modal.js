/**
 * 모달 컴포넌트
 * @fileoverview 재사용 가능한 모달 컴포넌트
 */

/**
 * 모달 클래스
 * @class
 */
export class Modal {
  /**
   * @constructor
   * @param {Object} options - 모달 옵션
   * @param {string} options.id - 모달 ID
   * @param {string} options.title - 모달 제목
   * @param {string} options.content - 모달 내용 (HTML)
   * @param {string} options.size - 모달 크기 (sm, md, lg, xl)
   * @param {Function} options.onClose - 닫기 콜백
   */
  constructor(options = {}) {
    this.id = options.id || `modal-${Date.now()}`;
    this.title = options.title || '';
    this.content = options.content || '';
    this.size = options.size || 'md';
    this.onClose = options.onClose || null;
  }

  /**
   * 모달 HTML 렌더링
   * @returns {string} HTML 문자열
   */
  render() {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };

    return `
      <div id="${this.id}" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
        <div class="bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[this.size]} transform scale-95 transition-all duration-300 overflow-hidden">
          ${this.title ? `
            <div class="modal-header px-6 py-4 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-slate-800">${this.title}</h3>
                <button onclick="window.Modal_${this.id}_close()" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                  <i class="fas fa-times text-slate-400"></i>
                </button>
              </div>
            </div>
          ` : ''}
          <div class="modal-body">
            ${this.content}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 모달 열기
   */
  open() {
    // 기존 모달 제거
    const existing = document.getElementById(this.id);
    if (existing) existing.remove();

    // 새 모달 추가
    document.body.insertAdjacentHTML('beforeend', this.render());

    // 닫기 함수 전역 등록
    window[`Modal_${this.id}_close`] = () => this.close();

    // 애니메이션
    setTimeout(() => {
      const modal = document.getElementById(this.id);
      if (modal) {
        modal.classList.remove('opacity-0');
        modal.querySelector('.bg-white').classList.remove('scale-95');
        modal.querySelector('.bg-white').classList.add('scale-100');
      }
    }, 10);

    // ESC 키로 닫기
    this.escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this.escHandler);

    // 배경 클릭으로 닫기
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }
  }

  /**
   * 모달 닫기
   */
  close() {
    const modal = document.getElementById(this.id);
    if (modal) {
      modal.classList.add('opacity-0');
      modal.querySelector('.bg-white').classList.add('scale-95');
      modal.querySelector('.bg-white').classList.remove('scale-100');

      setTimeout(() => {
        modal.remove();
        if (this.onClose) this.onClose();
      }, 300);
    }

    // 이벤트 리스너 제거
    if (this.escHandler) {
      document.removeEventListener('keydown', this.escHandler);
    }

    // 전역 함수 제거
    delete window[`Modal_${this.id}_close`];
  }

  /**
   * 모달 내용 업데이트
   * @param {string} content - 새 내용 (HTML)
   */
  updateContent(content) {
    const modal = document.getElementById(this.id);
    if (modal) {
      const body = modal.querySelector('.modal-body');
      if (body) body.innerHTML = content;
    }
  }
}

export default Modal;
