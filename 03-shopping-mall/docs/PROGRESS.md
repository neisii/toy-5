# 쇼핑몰 프로젝트 진행 상황

## 완료된 Phase

### Phase 1: 페이지네이션 (2025-10-14)

#### 구현 내용
1. **Pagination 컴포넌트 생성** (`components/Pagination.tsx`)
   - 페이지당 12개 상품 표시
   - 이전/다음 버튼 (비활성화 상태 처리)
   - 동적 페이지 번호 표시 (최대 5개, 현재 페이지 중심)
   
2. **URL 상태 동기화** (`app/page.tsx`)
   - `useSearchParams`, `useRouter`, `usePathname` 훅 사용
   - 페이지 변경 시 URL 업데이트 (`?page=2`)
   - 카테고리 변경 시 페이지 1로 초기화
   - 페이지 이동 시 스크롤 최상단 이동

3. **E2E 테스트 추가** (`tests/shop.spec.ts`)
   - 페이지 이동 테스트 (25개 상품, 3페이지)
   - 이전/다음 버튼 동작 테스트
   - 카테고리 변경 시 1페이지 초기화 테스트

#### 트러블슈팅
1. **Playwright strict mode violation**
   - 문제: `text=상품 1` 선택자가 "상품 10", "상품 11" 등과 중복 매칭
   - 해결: `[data-id="1"]` 선택자로 변경

2. **toHaveCount.greaterThan() 오류**
   - 문제: Playwright에 해당 메서드 없음
   - 해결: `.count()` 후 `expect().toBeGreaterThan()` 사용

#### 테스트 결과
- 전체 테스트: 6개 (모두 통과)
- 새로 추가된 테스트: 3개 (페이지네이션 관련)

---

## 다음 Phase 예정

### Phase 2: 검색 기능
- 상품명 검색 입력창
- 실시간 필터링
- 검색어 강조 표시

### Phase 3: Toast 알림
- 장바구니 추가 알림
- 자동 사라짐 (3초)
- 위치: 화면 우측 상단

### Phase 4: URL 상태 관리 확장
- 카테고리 필터 URL 반영 (`?category=electronics`)
- 검색어 URL 반영 (`?search=키워드`)
- 페이지 새로고침 시 상태 유지
