/**
 * 포맷팅 유틸리티 함수
 * @fileoverview 날짜, 통화, 텍스트 포맷팅 함수들
 */

/**
 * 날짜를 원하는 형식으로 포맷
 * @param {string|Date} dateStr - 날짜 문자열 또는 Date 객체
 * @param {boolean} includeTime - 시간 포함 여부
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDate(dateStr, includeTime = false) {
    if (!dateStr) return '-';

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        if (includeTime) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }

        return `${year}-${month}-${day}`;
    } catch (e) {
        return '-';
    }
}

/**
 * 날짜를 짧은 형식으로 포맷 (시간 제외)
 * @param {string|Date} dateStr - 날짜 문자열
 * @returns {string} YYYY-MM-DD 형식
 */
export function formatDateClean(dateStr) {
    return formatDate(dateStr, false);
}

/**
 * 통화 형식으로 포맷
 * @param {number} amount - 금액
 * @param {string} currency - 통화 심볼 (기본: '₩')
 * @returns {string} 포맷된 금액 문자열
 */
export function formatCurrency(amount, currency = '₩') {
    if (amount === null || amount === undefined) return '-';

    try {
        const num = Number(amount);
        if (isNaN(num)) return '-';

        return `${currency}${num.toLocaleString('ko-KR')}`;
    } catch (e) {
        return '-';
    }
}

/**
 * 숫자를 천단위 구분 포맷
 * @param {number} num - 숫자
 * @returns {string} 포맷된 숫자 문자열
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';

    try {
        const number = Number(num);
        if (isNaN(number)) return '0';

        return number.toLocaleString('ko-KR');
    } catch (e) {
        return '0';
    }
}

/**
 * 텍스트 자르기 (말줄임표 추가)
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 잘린 텍스트
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
}

/**
 * 전화번호 포맷
 * @param {string} phone - 전화번호
 * @returns {string} 포맷된 전화번호
 */
export function formatPhone(phone) {
    if (!phone) return '-';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    return phone;
}

/**
 * 파일 크기 포맷
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 파일 크기
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
