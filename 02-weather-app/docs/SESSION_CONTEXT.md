# Weather App Refactoring - Session Context

> **Purpose**: This document provides complete context for new Claude sessions to continue the Weather App refactoring project without loss of progress or context.

---

## Project Overview

**Goal**: Refactor Weather App using AI-DLC (AI-Driven Development Life Cycle) methodology to implement an adapter pattern that separates core business logic from external weather API services.

**Methodology**: AI-DLC (see `docs/ai-dlc.txt`)
- AI creates plans and asks questions
- Human makes all critical decisions
- Progressive implementation with git tags per phase

**Current Phase**: Completed Phase 1 (Inception), ready to begin Phase 2 (Construction)

---

## Architecture Target

```
[Vue Component]
    ↓
[Pinia Store] ← 표준 도메인 타입 사용 (CurrentWeather)
    ↓
[WeatherService] ← 도메인 로직 (비즈니스 규칙)
    ↓
[WeatherProviderAdapter Interface] ← 추상화 계층
    ↓         ↓              ↓
[OpenWeather] [MockWeather] [OtherAPI]
```

**Key Benefits**:
- API providers are interchangeable
- No API key billing risks (Mock provider available)
- Business logic decoupled from external services
- Easy to add new weather providers

---

## User Decisions (All Final)

### 1. API Provider Strategy
- **Selected Providers**: OpenWeatherMap 2.5 (Current Weather API), WeatherAPI.com, Open-Meteo, Mock
- **Rationale**: OpenWeatherMap 2.5 Current Weather API is still active and free (60 calls/minute, no credit card)
- **Note**: One Call API 2.5 was deprecated June 2024, but we're using Current Weather API

### 2. Provider Selection UI
- **Method**: Dropdown menu in settings
- **Visual Indicators**: 
  - 🟢 Green: Normal operation (quota < 80%)
  - 🟡 Yellow: Warning (quota 80-95%)
  - 🔴 Red: Limit reached (quota ≥ 95%)
- **Display**: Provider name + status + remaining calls

### 3. Quota Reset Policy
- **Decision**: UTC 기준으로 00:00에 리셋 (기술적 제약)
- **Rationale**: API key는 개발자에게 발급, API 서버 정책(UTC)을 따라야 함
- **Important**: User requested separation of "기술적 제약" vs "사용자 경험" in all recommendations

### 4. Mock Data Strategy
- **Cities**: 8 real Korean cities + 6 test cases (extreme weather)
- **Optimization**: Short key + Gzip (~75% size reduction)
- **Real Cities**: 서울, 부산, 인천, 대구, 광주, 대전, 울산, 제주
- **Test Cases**: 테스트_비, 테스트_눈, 테스트_폭염, 테스트_한파, 테스트_태풍, 테스트_안개

### 5. Reverse Geocoding
- **Decision**: Pre-defined city coordinates only, NO reverse geocoding API
- **Rationale**: "어차피 기본으로 몇 개 지역만 검색할 수 있게 할 거니까 각 지역의 중심좌표정도만 사전에 정의해두고"
- **Implementation**: `src/config/cityCoordinates.ts` with 8 cities

### 6. Translation Strategy
- **Decision**: Static mapping (90/100 score)
- **Rejected**: AI translation (65-68/100 score, cost overhead)
- **Rationale**: Better accuracy, no API costs, faster response

### 7. Migration Strategy
- **Method**: Progressive migration with git tags per phase
- **Format**: `v0.1.0-refactor-{phase-name}`
- **Documentation**: PHASE_X_SUMMARY.md for each phase

### 8. Future Features (Separate from Refactoring)
- **Moved to**: `docs/FUTURE_FEATURES.md`
- **Features**: AI weather analysis, provider accuracy ranking, pattern prediction
- **Decision**: "AI 날씨 분석은 아직 생각만 한 기능이니 당장 리팩토링 일정에선 제외하고 별도 문서로 만들어두자"

---

## Critical User Feedback Patterns

### 1. Technical Constraints vs User Experience
**User Request**: "앞으로는 기술적 제약과 사용자 경험을 구분해서 제안해줘"

**Example**:
- ❌ Wrong: "브라우저 timezone 기준으로 리셋하면 사용자가 이해하기 쉽습니다"
- ✅ Correct: 
  - **기술적 제약**: API는 UTC 00:00 기준으로 리셋 (서버 정책)
  - **사용자 경험**: 사용자에게 로컬 시간으로 변환해서 표시 가능

**Application**: Always label recommendations as either technical constraint or UX consideration.

### 2. Avoid Over-Engineering
**User Feedback**: Simplified reverse geocoding from full API integration to pre-defined coordinates

**Learning**: 
- Don't plan for features not yet needed
- YAGNI (You Aren't Gonna Need It) principle
- User will specify when more complexity is needed

### 3. Approval Pattern
**User Signal**: "이행" (proceed)
- Used multiple times to approve plans and continue implementation
- Indicates user has reviewed and approved the work
- Safe to proceed with implementation

---

## Completed Files

### Documentation (docs/)
1. **TROUBLESHOOTING.md** - Comprehensive troubleshooting guide
2. **REFACTORING_PLAN.md** - Complete refactoring strategy with phases
3. **TECHNICAL_QA.md** - 8 technical questions answered in detail
4. **WEATHER_API_COMPARISON.md** - Detailed comparison of 3 providers
5. **FUTURE_FEATURES.md** - AI analysis features (separate from refactoring)
6. **USER_DECISIONS.md** - All user decisions recorded

### Configuration (src/config/)
7. **cityCoordinates.ts** - Pre-defined coordinates for 8 Korean cities
   - Includes getCityCoordinate() helper function
   - Supports both Korean and English names

### Types (src/types/domain/)
8. **weatherIcon.ts** - Unified icon mapping across all providers
   - OpenWeatherMap codes (standard)
   - WeatherAPI.com codes
   - WMO codes (Open-Meteo)
   - Bidirectional conversion functions

### Mock Data (src/data/)
9. **keyMap.ts** - JSON compression via short key mapping
   - KEY_MAP with 30+ mappings
   - expandKeys() and compressKeys() functions
10. **mockWeather.json** - Compressed weather data (8 cities + 6 test cases)
11. **types.ts** - TypeScript interfaces for compressed and expanded data
12. **loader.ts** - Data loading with caching and validation
    - loadMockWeatherData()
    - getMockWeatherByCity()
    - getAvailableCities()
    - validateMockData()
13. **README.md** - Complete documentation for Mock data system

---

## Phase 1 Completion Status

### ✅ Completed
- [x] AI-DLC Inception phase questions (5 initial + 8 technical)
- [x] All user decisions documented
- [x] Mock data infrastructure complete (keyMap, JSON, types, loader)
- [x] City coordinates configuration
- [x] Weather icon mapping system
- [x] API provider comparison research

### ⏳ Ready for Phase 2
- [ ] Create domain types (types/domain/weather.ts)
- [ ] Create WeatherProvider interface
- [ ] Implement OpenWeatherAdapter
- [ ] Implement MockWeatherAdapter
- [ ] Create WeatherService
- [ ] Update Pinia store to use WeatherService
- [ ] Update Playwright tests

---

## Key Technical Decisions

### OpenWeatherMap Version Selection
**Question**: "OpenWeatherMap은 3.0버전이 존재하는데 2.5버전을 다른 날씨 제공자와 비교하는 이유는?"

**Answer**:
- **One Call API 2.5**: Deprecated June 2024
- **One Call API 3.0**: Requires credit card, includes AI features
- **Current Weather API 2.5**: Still active, free, no card required ← **We use this**

**Documentation**: See `docs/TECHNICAL_QA.md` Question 1

### Rate Limit Detection
**Method**: HTTP 429 response + LocalStorage tracking

**Implementation**:
```typescript
interface QuotaInfo {
  used: number;
  limit: number;
  resetTime: string; // UTC ISO 8601
}
```

**Reset**: UTC 00:00 daily (matches API policy)

### Mock JSON Optimization
**Selected**: Short key + Gzip

**Results**:
- Original JSON: ~100KB
- Short keys: ~67KB (33% reduction)
- Short keys + Gzip: ~25KB (75% reduction)

**Rationale**: Best compression with minimal complexity, Vite auto-applies Gzip

---

## Error History & Learnings

### Error 1: Timezone Reset Logic Confusion
**Mistake**: Recommended browser timezone for user-friendliness

**User Correction**: "왜 개발자인 나에게 발급된 API KEY가 기준인데 사용자가 느끼는 시간을 고려해야 하는 거야?"

**Root Cause**: Conflated user experience with technical constraints

**Fix**: UTC-based reset (technical constraint), can display in local time (UX)

**Learning**: Always distinguish technical requirements from UX considerations

### Error 2: Over-Engineering Reverse Geocoding
**Mistake**: Planned full reverse geocoding API integration

**User Feedback**: "각 지역의 중심좌표정도만 사전에 정의해두고"

**Root Cause**: Planned for features not yet needed

**Fix**: Pre-defined coordinates in cityCoordinates.ts

**Learning**: YAGNI - implement only what's needed now

### Error 3: API Version Documentation Gap
**Issue**: Didn't clarify difference between One Call API 2.5 (deprecated) and Current Weather API 2.5 (active)

**Fix**: Created detailed comparison in TECHNICAL_QA.md

**Learning**: Be explicit about API versioning when multiple versions exist

---

## Code Patterns & Standards

### Type Safety
- Strict TypeScript throughout
- Separate types for compressed vs expanded data
- Domain types independent of API structure

### File Organization
```
weather-app/
├── docs/                          # All documentation
│   ├── REFACTORING_PLAN.md
│   ├── TECHNICAL_QA.md
│   ├── USER_DECISIONS.md
│   └── ...
├── src/
│   ├── config/                    # Configuration files
│   │   └── cityCoordinates.ts
│   ├── types/
│   │   └── domain/               # Domain types (API-agnostic)
│   │       └── weatherIcon.ts
│   ├── data/                      # Mock data system
│   │   ├── keyMap.ts
│   │   ├── mockWeather.json
│   │   ├── types.ts
│   │   ├── loader.ts
│   │   └── README.md
│   ├── services/                  # Business logic (Phase 2)
│   │   └── weather/
│   ├── adapters/                  # API adapters (Phase 2)
│   │   └── weather/
│   └── stores/                    # Pinia stores
│       └── weather.ts
└── tests/
    └── weather.spec.ts
```

### Naming Conventions
- **Files**: camelCase.ts
- **Types**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Korean text**: Prefer Korean for user-facing strings in mock data

### Documentation Standards
- JSDoc comments for all public functions
- Include @example blocks
- Explain "why" not just "what"
- Document user decisions with rationale

---

## Next Steps for Phase 2

### 1. Domain Types (Priority: HIGH)
**File**: `src/types/domain/weather.ts`

**Required Interfaces**:
```typescript
export interface CurrentWeather {
  location: LocationInfo;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  weather: WeatherCondition;
  timestamp: Date;
}

export interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
}

export interface LocationInfo {
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}
```

### 2. WeatherProvider Interface (Priority: HIGH)
**File**: `src/adapters/weather/WeatherProvider.ts`

```typescript
export interface WeatherProvider {
  name: string;
  getCurrentWeather(city: string): Promise<CurrentWeather>;
  checkQuota(): Promise<QuotaInfo>;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  resetTime: Date;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}
```

### 3. Adapters (Priority: HIGH)
- `src/adapters/weather/MockWeatherAdapter.ts` (implement first for testing)
- `src/adapters/weather/OpenWeatherAdapter.ts`

### 4. WeatherService (Priority: MEDIUM)
**File**: `src/services/weather/WeatherService.ts`
- Manages provider selection
- Handles quota tracking
- Business logic layer

### 5. Update Existing Code (Priority: MEDIUM)
- Update `src/stores/weather.ts` to use WeatherService
- Update `tests/weather.spec.ts` for new architecture

### 6. Documentation (Priority: LOW)
- Create PHASE_2_SUMMARY.md after completion
- Update PROGRESS.md
- Git tag: `v0.1.0-refactor-phase2`

---

## Important Context for AI

### User Communication Style
- Prefers concise, direct responses
- Uses "이행" to approve and proceed
- Asks clarifying questions when something doesn't make sense
- Values separation of technical constraints vs UX considerations

### Decision-Making Pattern
1. AI presents options with pros/cons
2. AI asks questions to clarify requirements
3. User makes final decision
4. User says "이행" to approve
5. AI implements the decision

### Quality Expectations
- Type safety is critical
- Documentation must be thorough
- Code must be production-ready
- No over-engineering (YAGNI principle)
- Distinguish technical constraints from UX recommendations

### Troubleshooting Approach
- Document all errors in TROUBLESHOOTING.md
- Explain root cause, not just symptoms
- Provide learning points for future reference

---

## Reference Documents

For detailed information, refer to:

1. **Architecture & Planning**:
   - `docs/REFACTORING_PLAN.md` - Complete phase breakdown
   - `docs/ai-dlc.txt` - AI-DLC methodology explanation

2. **Technical Decisions**:
   - `docs/USER_DECISIONS.md` - All user decisions with rationale
   - `docs/TECHNICAL_QA.md` - 8 technical questions answered
   - `docs/WEATHER_API_COMPARISON.md` - Provider comparison

3. **Implementation Details**:
   - `src/data/README.md` - Mock data system documentation
   - `docs/TROUBLESHOOTING.md` - Error history and solutions

4. **Future Work**:
   - `docs/FUTURE_FEATURES.md` - AI analysis features (post-refactoring)

---

## Quick Start for New Session

To continue this project in a new Claude session:

1. Read this document completely
2. Review `docs/REFACTORING_PLAN.md` for phase details
3. Check `docs/USER_DECISIONS.md` for all final decisions
4. Start with Phase 2, Step 1: Create domain types
5. Follow the user's approval pattern (wait for "이행" before major changes)
6. Always distinguish technical constraints from UX recommendations

**Current Status**: Phase 1 complete, Mock data infrastructure ready, awaiting Phase 2 implementation.

**Last User Message**: [Implied approval to proceed with Phase 2]

---

*Document created: 2025-10-08*  
*Last updated: 2025-10-08*  
*Version: 1.0*
