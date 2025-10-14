interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 페이지 범위 계산 (최대 5개 버튼 표시)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 총 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 기준으로 앞뒤 2개씩 표시
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      // 시작이 1이면 끝을 늘림
      if (start === 1) {
        end = Math.min(totalPages, maxVisible);
      }

      // 끝이 마지막이면 시작을 당김
      if (end === totalPages) {
        start = Math.max(1, totalPages - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 상품이 없으면 페이지네이션 숨김
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 이전 버튼 */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded border ${
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="이전 페이지"
      >
        이전
      </button>

      {/* 페이지 번호 버튼 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded border ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
          }`}
          aria-label={`${page}페이지`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded border ${
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="다음 페이지"
      >
        다음
      </button>
    </div>
  );
}
