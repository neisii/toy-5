# Phase 7: 자전거 라이딩 추천 - 기본 점수 시스템

## 📋 Phase 정보

- **Phase**: 7
- **제목**: Cycling Recommendation - Basic Score System
- **난이도**: ⭐⭐⭐ (중급)
- **소요 시간**: 3시간
- **완료일**: 2025-10-21

## 🎯 Phase 목표

날씨 조건을 분석하여 자전거 타기 적합도를 0-100점으로 계산하고, 이에 따른 추천도와 권장 복장을 제공하는 기본 점수 시스템 구현

## ✅ 구현 내용

### 1. 타입 정의 (src/types/cycling.ts)

**RecommendationLevel**: 5단계 추천도
```typescript
export type RecommendationLevel = 
  | 'excellent'   // 최고! 🚴‍♂️ (80-100점)
  | 'good'        // 좋음 👍 (60-79점)
  | 'fair'        // 보통 🤔 (40-59점)
  | 'poor'        // 비추천 👎 (20-39점)
  | 'dangerous';  // 위험 ⚠️ (0-19점)
```

**CyclingScore**: 추천 결과 인터페이스
```typescript
export interface CyclingScore {
  score: number;                    // 종합 점수 (0-100)
  recommendation: RecommendationLevel;
  reasons: string[];                // 평가 이유 목록
  clothing: ClothingItem[];         // 권장 복장 목록
}
```

**ClothingItem**: 복장 아이템
```typescript
export interface ClothingItem {
  name: string;
  essential: boolean;  // 필수 여부
}
```

**RECOMMENDATION_DISPLAY**: UI 표시 정보
- 텍스트, 이모지, CSS 클래스, 그라디언트 색상 매핑

### 2. 점수 계산 로직 (src/utils/cyclingRecommender.ts)

**calculateCyclingScore()**: 메인 점수 계산 함수

**5가지 평가 요소**:

1. **기온 평가** (0-20점 감점)
   - 영하: -20점 (빙판 위험)
   - 0-10°C: -10점 (쌀쌀함)
   - 15-25°C: 0점 (최적 온도)
   - 30-35°C: -5점 (더움)
   - 35°C 초과: -15점 (폭염)

2. **강수량 평가** (0-35점 감점)
   - 강한 비: -30점
   - 약한 비: -15점
   - 강한 눈: -35점
   - 약한 눈: -25점

3. **풍속 평가** (0-25점 감점)
   - 10-15 km/h: -10점
   - 15+ km/h: -25점

4. **습도 평가** (0-10점 감점)
   - 80% 초과: -10점
   - 30% 미만: -3점

5. **체감 온도 평가** (0-5점 감점)
   - 차이 10도 초과: -5점
   - 차이 5-10도: -2점

**복장 추천 로직**:
- 기본 필수: 헬멧, 선글라스
- 온도별: 방한 장갑, 긴팔 저지, 선크림 등
- 날씨별: 방수 재킷, 신발 커버 등
- 바람: 방풍 조끼

### 3. Vue 컴포넌트 (src/components/CyclingRecommendation.vue)

**주요 기능**:
- Weather Store에서 현재 날씨 가져오기
- 점수 계산 및 UI 표시
- 반응형 디자인 (모바일 대응)

**UI 구성**:
```
┌─────────────────────────────────┐
│ 🚴‍♂️ 자전거 라이딩 추천          │
├─────────────────────────────────┤
│     ┌───────────────┐           │
│     │      85       │           │
│     │      🚴‍♂️       │           │
│     │     최고!      │           │
│     └───────────────┘           │
├─────────────────────────────────┤
│ 평가 이유                        │
│ • 완벽한 라이딩 온도             │
│ • 바람이 약해 쾌적한 라이딩      │
├─────────────────────────────────┤
│ 권장 복장                        │
│ [자전거 헬멧 필수] [선글라스 필수]│
│ [반팔 저지 필수]                │
└─────────────────────────────────┘
```

**스타일링**:
- 점수 원형 디스플레이 (그라디언트 배경)
- 점수별 색상:
  - Excellent: Purple (#667eea → #764ba2)
  - Good: Blue (#42a5f5 → #478ed1)
  - Fair: Orange (#ffa726 → #fb8c00)
  - Poor: Deep Orange (#ff7043 → #f4511e)
  - Dangerous: Red (#e53935 → #c62828)
- 호버 효과 (1.05배 확대)
- 필수 복장 강조 (그라디언트 배경)

### 4. 통합 (src/views/HomeView.vue)

```vue
<template>
  <CurrentWeather ... />
  <CyclingRecommendation v-if="weatherStore.currentWeather" />
</template>
```

## 📊 테스트 결과

### Unit Tests (27개)
- ✅ getRecommendationLevel: 5개 테스트
- ✅ Temperature evaluation: 5개 테스트
- ✅ Rain evaluation: 4개 테스트
- ✅ Wind evaluation: 4개 테스트
- ✅ Humidity evaluation: 3개 테스트
- ✅ Feels-like evaluation: 2개 테스트
- ✅ Comprehensive scenarios: 4개 테스트

**결과**: 27/27 passed ✅

### E2E Tests (6개)
- ✅ 자전거 추천 컴포넌트 표시
- ✅ 점수 표시
- ✅ 추천 이유 표시
- ✅ 권장 복장 표시
- ✅ 필수 복장 배지 표시
- ✅ 도시 변경 시 업데이트

**결과**: 6/6 passed ✅

## 📁 생성/수정된 파일

### 생성된 파일
```
src/types/cycling.ts                              (116 lines)
src/utils/cyclingRecommender.ts                   (305 lines)
src/components/CyclingRecommendation.vue          (250 lines)
src/utils/__tests__/cyclingRecommender.spec.ts    (278 lines)
tests/cycling.spec.ts                             (186 lines)
docs/PHASE_7_SUMMARY.md                           (this file)
```

### 수정된 파일
```
src/views/HomeView.vue                            (+2 lines)
  - Import CyclingRecommendation
  - Add component to template
```

## 🎨 사용자 경험

### 점수 범위별 사용자 피드백

**Excellent (80-100점)**
```
┌────────────────┐
│      95        │  <- 그라디언트: Purple
│      🚴‍♂️        │
│     최고!       │
└────────────────┘

평가 이유:
• 완벽한 라이딩 온도
• 바람이 약해 쾌적한 라이딩

권장 복장:
[자전거 헬멧 필수] [선글라스 필수] [반팔 저지 필수]
```

**Poor (20-39점)**
```
┌────────────────┐
│      25        │  <- 그라디언트: Deep Orange
│      👎        │
│    비추천       │
└────────────────┘

평가 이유:
• 영하 기온으로 빙판 위험
• 강풍으로 주행 어려움 및 균형 잡기 힘듦

권장 복장:
[자전거 헬멧 필수] [선글라스 필수] [방한 장갑 필수]
[넥워머 필수] [방풍 재킷 필수] [방한 레그워머 필수]
```

**Dangerous (0-19점)**
```
┌────────────────┐
│      10        │  <- 그라디언트: Red
│      ⚠️        │
│     위험        │
└────────────────┘

평가 이유:
• 영하 기온으로 빙판 위험
• 눈으로 인한 도로 위험
• 매우 강한 바람
• 높은 습도로 불쾌감 증가

권장 복장:
[자전거 헬멧 필수] [선글라스 필수] [방수 방한 재킷 필수]
[방한 장갑 필수] [넥워머 필수] [방풍 재킷 필수]
```

## 🔧 기술적 구현 세부사항

### 1. 타입 안정성
- CurrentWeather 타입 완전 준수
- 모든 함수에 명시적 타입 지정
- JSDoc으로 상세 문서화

### 2. 단위 변환
- windSpeed: m/s → km/h (×3.6)
- 모든 온도: Celsius 기준

### 3. 점수 계산 알고리즘
```typescript
초기 점수: 100점

1. 기온 평가 → -0 ~ -20점
2. 강수량 평가 → -0 ~ -35점
3. 풍속 평가 → -0 ~ -25점
4. 습도 평가 → -0 ~ -10점
5. 체감온도 평가 → -0 ~ -5점

최종 점수 = Math.max(0, Math.min(100, 초기점수 - 총감점))
```

### 4. 복장 추천 로직
- **기본 필수 아이템**: 항상 포함
- **조건부 필수**: 위험한 날씨 (essential: true)
- **권장 아이템**: 편의성 향상 (essential: false)

## 📈 성능 최적화

### Computed Properties 사용
```typescript
const cyclingScore = computed(() => {
  if (!weatherStore.currentWeather) return null;
  return calculateCyclingScore(weatherStore.currentWeather);
});
```
- 날씨 데이터 변경 시에만 재계산
- 불필요한 연산 방지

### CSS 최적화
- 호버/전환 효과에 transform 사용 (GPU 가속)
- 클래스 기반 스타일링 (재사용성)

## 🐛 알려진 제한사항

### 현재 버전 (v0.7.0)
1. **고정된 임계값**: 모든 사용자에게 동일한 기준 적용
2. **개인화 부족**: 사용자별 선호도 미반영
3. **단순 점수 계산**: 요소 간 상호작용 미고려
4. **기본 복장 추천**: 경험 수준, 라이딩 거리 미고려

## 🚀 다음 단계 (Phase 8 Preview)

### Phase 8: 민감도 설정
- 사용자별 추천 임계값 조정
- LocalStorage 저장
- UI 설정 패널

예시:
```typescript
interface UserSensitivity {
  cold: 'low' | 'medium' | 'high';
  heat: 'low' | 'medium' | 'high';
  rain: 'low' | 'medium' | 'high';
  wind: 'low' | 'medium' | 'high';
}
```

## 📚 학습 포인트

### 1. 도메인 로직 분리
- 비즈니스 로직을 utils로 분리
- 컴포넌트는 표시에만 집중

### 2. 테스트 주도 개발
- 27개 유닛 테스트로 모든 시나리오 커버
- E2E 테스트로 사용자 플로우 검증

### 3. 타입 안전성
- 기존 타입 시스템과 완벽한 통합
- 런타임 에러 사전 방지

### 4. 점진적 기능 추가
- 기존 기능에 영향 없이 새 기능 추가
- 독립적인 컴포넌트 구조

## 🎓 권장사항

### 코드 재사용
- `evaluateTemperature()` 등의 함수는 Phase 8, 9에서도 활용 가능
- `RECOMMENDATION_DISPLAY`는 확장 가능한 구조

### 테스트 작성 패턴
```typescript
// 1. Mock 데이터 생성 헬퍼
const createMockWeather = (overrides) => ({ ...defaults, ...overrides });

// 2. 경계값 테스트
expect(getRecommendationLevel(80)).toBe('excellent');
expect(getRecommendationLevel(79)).toBe('good');

// 3. 통합 시나리오 테스트
expect(result.score).toBeGreaterThanOrEqual(80);
expect(result.reasons.length).toBeGreaterThan(0);
expect(result.clothing.some(c => c.essential)).toBe(true);
```

### UI/UX 개선 아이디어
- 점수 변화 애니메이션
- 이전 검색 결과와 비교
- 주간 날씨 기반 라이딩 추천일 표시

## ✅ Phase 7 완료 체크리스트

- [x] 타입 정의 (cycling.ts)
- [x] 점수 계산 로직 (cyclingRecommender.ts)
- [x] Vue 컴포넌트 (CyclingRecommendation.vue)
- [x] HomeView 통합
- [x] Unit 테스트 27개 (100% 통과)
- [x] E2E 테스트 6개 (100% 통과)
- [x] Phase 7 문서화
- [ ] Git commit & tag (v0.7.0-cycling-basic)

## 📝 커밋 메시지

```
feat(cycling): implement Phase 7 basic cycling recommendation system

- Add cycling types (RecommendationLevel, CyclingScore, ClothingItem)
- Implement 5-factor scoring algorithm (temp, rain, wind, humidity, feels-like)
- Create CyclingRecommendation.vue component with score display
- Add 27 unit tests for cyclingRecommender (100% pass)
- Add 6 E2E tests for cycling feature (100% pass)
- Integrate cycling recommendation into HomeView
- Document Phase 7 implementation

Phase 7 완료: 기본 자전거 라이딩 추천 시스템
```

## 🏷️ Git Tag

```bash
git tag -a v0.7.0-cycling-basic -m "Phase 7: Cycling Recommendation - Basic Score System"
```
