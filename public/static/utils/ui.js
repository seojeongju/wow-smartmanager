/**
 * UI 유틸리티 (토스트, 에러 표시 등)
 */

/**
 * 컨테이너 내부에 에러 메시지 표시
 * container가 없으면 토스트로 표시
 * @param {HTMLElement} container 
 * @param {string} message 
 */
export function showError(container, message) {
    if (container && typeof container.innerHTML !== 'undefined') {
        container.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800"><i class="fas fa-exclamation-circle mr-2"></i>${message}</p>
      </div>
    `;
    } else {
        // container가 없거나 문자열만 전달된 경우 토스트로 표시
        const msg = typeof container === 'string' ? container : message;
        showToast(msg || '오류가 발생했습니다.', 'error');
    }
}

/**
 * 성공 토스트 메시지 표시
 * @param {string} message 
 */
export function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * 내부 토스트 표시 함수
 */
function showToast(message, type = 'success') {
    const div = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    div.className = `fixed bottom-10 right-10 ${bg} text-white px-6 py-4 rounded-xl shadow-2xl z-[100] flex items-center gap-3 transition-all duration-300 transform translate-y-10 opacity-0`;
    div.innerHTML = `<i class="fas ${icon} text-xl"></i> <span class="font-bold text-base shadow-sm">${message}</span>`;

    document.body.appendChild(div);

    // Animate in
    requestAnimationFrame(() => {
        div.classList.remove('translate-y-10', 'opacity-0');
    });

    // Remove after 3s
    setTimeout(() => {
        div.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => div.remove(), 300);
    }, 3000);
}
