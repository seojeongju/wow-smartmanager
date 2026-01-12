/**
 * 파일 및 데이터 다운로드 유틸리티
 */

/**
 * CSV 다운로드
 * @param {Array} data - 데이터 배열
 * @param {string} filename - 파일명
 * @param {Object} headers - 헤더 맵핑 객체 (optional)
 */
export function downloadCSV(data, filename, headers) {
    if (!data || data.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
    }

    // BOM 추가 (한글 깨짐 방지)
    let csvContent = "\uFEFF";

    // 헤더 추가
    if (headers) {
        csvContent += Object.values(headers).join(',') + '\n';
    } else {
        csvContent += Object.keys(data[0]).join(',') + '\n';
    }

    // 데이터 행 추가
    data.forEach(row => {
        let rowContent = [];
        if (headers) {
            // 헤더 키 순서대로 데이터 매핑
            Object.keys(headers).forEach(key => {
                let cell = row[key] === null || row[key] === undefined ? '' : row[key].toString();
                // 쉼표, 따옴표, 줄바꿈 처리
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                rowContent.push(cell);
            });
        } else {
            rowContent = Object.values(row).map(cell => {
                cell = cell === null || cell === undefined ? '' : cell.toString();
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            });
        }
        csvContent += rowContent.join(',') + '\n';
    });

    // 다운로드 링크 생성 및 실행
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
