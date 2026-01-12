-- 사용자 테이블에 password 컬럼 추가
ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'wow1234';

-- 기존 사용자들에게 기본 비밀번호 설정
UPDATE users SET password = 'wow1234' WHERE password IS NULL;
