/**
 * API 호출 유틸리티
 * @fileoverview Axios를 래핑한 API 클래스
 */

import { API_BASE } from './constants.js';

/**
 * API 호출을 위한 래퍼 클래스
 */
export class API {
    /**
     * GET 요청
     * @param {string} url - API 엔드포인트
     * @param {Object} config - Axios 설정
     * @returns {Promise<any>} 응답 데이터
     */
    static async get(url, config = {}) {
        try {
            const response = await axios.get(`${API_BASE}${url}`, config);
            return response.data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    /**
     * POST 요청
     * @param {string} url - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @param {Object} config - Axios 설정
     * @returns {Promise<any>} 응답 데이터
     */
    static async post(url, data = {}, config = {}) {
        try {
            const response = await axios.post(`${API_BASE}${url}`, data, config);
            return response.data;
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }

    /**
     * PUT 요청
     * @param {string} url - API 엔드포인트
     * @param {Object} data - 요청 데이터
     * @param {Object} config - Axios 설정
     * @returns {Promise<any>} 응답 데이터
     */
    static async put(url, data = {}, config = {}) {
        try {
            const response = await axios.put(`${API_BASE}${url}`, data, config);
            return response.data;
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    }

    /**
     * DELETE 요청
     * @param {string} url - API 엔드포인트
     * @param {Object} config - Axios 설정
     * @returns {Promise<any>} 응답 데이터
     */
    static async delete(url, config = {}) {
        try {
            const response = await axios.delete(`${API_BASE}${url}`, config);
            return response.data;
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }

    /**
     * 에러 메시지 추출
     * @param {Error} error - 에러 객체
     * @returns {string} 사용자 친화적 에러 메시지
     */
    static getErrorMessage(error) {
        if (error.response) {
            // 서버 응답 에러
            return error.response.data?.error || error.response.data?.message || '서버 오류가 발생했습니다.';
        } else if (error.request) {
            // 요청 전송 실패
            return '서버에 연결할 수 없습니다.';
        } else {
            // 기타 에러
            return error.message || '알 수 없는 오류가 발생했습니다.';
        }
    }
}

// 기본 export
export default API;
