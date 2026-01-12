/**
 * 공통 상수 정의
 * @fileoverview 애플리케이션 전체에서 사용하는 상수들
 */

// API 기본 URL
export const API_BASE = '/api';

// 상태 상수
export const STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED'
};

// 사용자 권한
export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    STAFF: 'STAFF'
};

// 플랜 타입
export const PLANS = {
    FREE: 'FREE',
    BASIC: 'BASIC',
    PRO: 'PRO',
    ENTERPRISE: 'ENTERPRISE'
};

// 페이지 크기
export const PAGE_SIZE = {
    DEFAULT: 20,
    SMALL: 10,
    LARGE: 50
};

// 날짜 포맷
export const DATE_FORMAT = {
    SHORT: 'YYYY-MM-DD',
    LONG: 'YYYY-MM-DD HH:mm:ss',
    TIME: 'HH:mm:ss'
};
