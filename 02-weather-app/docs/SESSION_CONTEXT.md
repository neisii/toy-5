# Weather App Refactoring - Session Context

> **Purpose**: This document provides complete context for new Claude sessions to continue the Weather App refactoring project without loss of progress or context.

---

## Project Overview

**Goal**: Refactor Weather App using AI-DLC (AI-Driven Development Life Cycle) methodology to implement an adapter pattern that separates core business logic from external weather API services.

**Methodology**: AI-DLC (see `docs/ai-dlc.txt`)
- AI creates plans and asks questions
- Human makes all critical decisions
- Progressive implementation with git tags per phase

**Current Phase**: Completed Phase 5 (UX Improvements), planning Phase 6 (Weather Accuracy Tracking)

**Ultimate Goal**: Determine which weather provider has the highest prediction accuracy through 30+ days of data collection and AI-powered analysis.

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

### 1. Search Engine Usage Priority
**User Request**: "검색 엔진을 활용하여 자료 조사를 할 때는 퍼플렉시티 ai를 최우선으로 활용한다"

**Rule**: 
- ✅ **Primary**: Use Perplexity AI for web research and documentation lookup
- ✅ **Fallback**: Use other search engines only if Perplexity AI is unavailable
- ✅ **Application**: API documentation, latest features, best practices, troubleshooting

**Note**: Perplexity AI provides more accurate and up-to-date technical information than traditional search engines.

### 2. Technical Constraints vs User Experience
**User Request**: "앞으로는 기술적 제약과 사용자 경험을 구분해서 제안해줘"

**Example**:
- ❌ Wrong: "브라우저 timezone 기준으로 리셋하면 사용자가 이해하기 쉽습니다"
- ✅ Correct: 
  - **기술적 제약**: API는 UTC 00:00 기준으로 리셋 (서버 정책)
  - **사용자 경험**: 사용자에게 로컬 시간으로 변환해서 표시 가능

**Application**: Always label recommendations as either technical constraint or UX consideration.

### 3. Avoid Over-Engineering
**User Feedback**: Simplified reverse geocoding from full API integration to pre-defined coordinates

**Learning**: 
- Don't plan for features not yet needed
- YAGNI (You Aren't Gonna Need It) principle
- User will specify when more complexity is needed

### 4. Approval Pattern
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

## Completion Status by Phase

### ✅ Phase 1 (Inception) - v0.1.0-refactor-phase1
- [x] AI-DLC Inception phase questions (5 initial + 8 technical)
- [x] All user decisions documented
- [x] Mock data infrastructure complete (keyMap, JSON, types, loader)
- [x] City coordinates configuration
- [x] Weather icon mapping system
- [x] API provider comparison research

### ✅ Phase 2 (Domain Types) - v0.2.0-refactor-phase2
- [x] Create domain types (types/domain/weather.ts)
- [x] Create WeatherProvider interface
- [x] Implement MockWeatherAdapter
- [x] Implement OpenWeatherAdapter (initial)

### ✅ Phase 3 (Multi-Provider) - v0.3.0-refactor-phase3
- [x] Implement WeatherAPIAdapter
- [x] Implement OpenMeteoAdapter
- [x] Create WeatherService with provider switching
- [x] Update Pinia store to use WeatherService
- [x] Add ProviderSelector and QuotaStatus components
- [x] Security: Husky pre-commit hooks for API key protection

### ✅ Phase 4 (Testing Infrastructure) - v0.4.0-testing
- [x] Install Vitest + happy-dom environment
- [x] Create 67 unit tests (MockWeatherAdapter: 31, OpenMeteoAdapter: 18, WeatherAPIAdapter: 18)
- [x] Fix E2E tests with Mock Provider strategy (5 tests)
- [x] Total: 72 tests, 100% pass rate

### ✅ Phase 5 (UX Improvements) - v0.5.0-ux
- [x] Korean city name auto-conversion (서울 ↔ Seoul)
- [x] Datalist autocomplete UI (8 cities)
- [x] API response caching (5-minute TTL, provider-specific)
- [x] Loading indicator (verified existing implementation)
- [x] Add 13 new tests (9 caching + 4 Korean conversion)
- [x] Total: 85 tests (80 unit + 5 E2E), 100% pass rate
- [x] Core logic coverage: 80%+

### 📋 Future Considerations
- [ ] Phase 6: Weather Accuracy Tracking System (in planning)
  - Forecast API integration for all providers
  - Daily prediction data collection (IndexedDB)
  - 30-day accuracy comparison
  - AI-powered provider ranking (GPT-4o)
- [ ] Phase 7: E2E test expansion (optional)
- [ ] Responsive design (user excluded from Phase 5)
- [ ] See `docs/FUTURE_FEATURES.md` for AI analysis features
- [ ] See `docs/WEATHER_ACCURACY_TRACKING_DESIGN.md` for Phase 6 detailed design

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

## Current Architecture (Completed)

### Domain Types (`src/types/domain/weather.ts`)
```typescript
export interface CurrentWeather {
  location: LocationInfo;
  current: CurrentConditions;
}

export interface LocationInfo {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  localtime: string;
}

export interface CurrentConditions {
  temp_c: number;
  condition: WeatherCondition;
  wind_kph: number;
  humidity: number;
  feelslike_c: number;
}
```

### WeatherProvider Interface (`src/adapters/weather/WeatherProvider.ts`)
- **Implementations**: MockWeatherAdapter, OpenWeatherAdapter, WeatherAPIAdapter, OpenMeteoAdapter
- **Methods**: getCurrentWeather(), checkQuota(), validateConfig()
- **Quota Management**: LocalStorage-based tracking with UTC reset

### WeatherService (`src/services/weather/WeatherService.ts`)
- Provider switching with automatic failover
- API response caching (5-minute TTL)
- Quota tracking and status reporting
- Configuration validation

### Features Implemented
1. ✅ Multi-provider architecture (4 providers)
2. ✅ Korean city name auto-conversion
3. ✅ Datalist autocomplete UI
4. ✅ API response caching
5. ✅ Quota management with visual indicators
6. ✅ Security: Husky pre-commit hooks
7. ✅ Comprehensive testing (85 tests, 80%+ coverage)

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

## Recent Updates (Phase 4-5)

### Phase 4: Testing Infrastructure (v0.4.0-testing)
**Date**: 2025-10-09

**Achievements**:
- Installed Vitest 3.2.4 with happy-dom environment
- Created 67 unit tests across 3 adapters
- Fixed E2E tests using Mock Provider strategy
- Resolved Vitest/Playwright test runner conflict
- 100% test pass rate (72 total tests)

**Git Commits**:
1. `7ad1199` - Vitest setup and configuration
2. `6f95bea` - MockWeatherAdapter tests (31)
3. `71e9e47` - OpenMeteoAdapter tests (18)
4. `f475387` - E2E test fixes (5)
5. `ce5c9b5` - Phase 4 documentation

### Phase 5: UX Improvements (v0.5.0-ux)
**Date**: 2025-10-09

**Achievements**:
- Korean city name auto-conversion in WeatherAPIAdapter
- Datalist autocomplete UI in SearchBar component
- API response caching with 5-minute TTL and provider isolation
- Added 13 new tests (9 caching + 4 Korean conversion)
- Installed @vitest/coverage-v8 for coverage reporting
- Updated GitHub Secret Protection documentation (2025 updates)
- 100% test pass rate (85 total tests)

**Git Commits**:
1. `b10b84e` - Korean city name auto-conversion (Task 1)
2. `cc8e0ae` - Datalist autocomplete UI (Task 2)
3. `17b8679` - API response caching (Task 3)
4. `2d60551` - Phase 5 documentation
5. `a0ec6e1` - Context documentation updates

**Key Learning**: Session context lost after Claude terms acceptance, but successfully recovered and completed all Phase 4-5 work.

### Phase 6: Weather Accuracy Tracking (Planning → In Progress)
**Date**: 2025-10-09

**Objective**: Build a system to track weather prediction accuracy over 30+ days to determine which provider has the most consistent forecasts.

**User Decisions** (Confirmed):

✅ **Question 2**: "Actual Weather" Ground Truth
- **Decision**: Relative Consistency Analysis (self-consistency)
- **Rationale**: Avoid circular logic of consensus averaging
- **Method**: Compare each provider's "forecast vs own observation" consistency
- **KMA API**: Reserved for future (currently unavailable)

✅ **Question 3**: City Coverage
- **Decision**: Seoul only (Option B)
- **Rationale**: Fast PoC, 4-8 week validation
- **Expansion**: 8 cities after verification

✅ **Question 4**: AI Analysis Frequency
- **Decision**: Weekly (Option B)
- **Rationale**: Quick feedback for PoC, $0.20/month for 4 weeks
- **Schedule**: Week 1-4 weekly analysis, then monthly

✅ **Question 1**: Data Storage Strategy
- **Decision**: GitHub Actions + JSON files (Option C variant)
- **Rationale**: 
  - Completely free (2,000 min/month)
  - Git-based version control
  - No database setup required
  - Auto-commit data files
- **Case Studies Reviewed**:
  1. GitHub Actions (⭐⭐⭐⭐⭐): Chosen
  2. Vercel Cron (⭐⭐⭐): Limited to 2 jobs
  3. cron-job.org (⭐⭐): Too complex

**macOS Sleep Analysis** (Completed):
- Cron jobs don't run during sleep
- launchd can catch up missed schedules on wake
- **Recommended**: pmset + launchd (auto-wake at midnight, minimal battery impact)
- **Reference**: `docs/MACOS_SLEEP_LOCAL_SERVER_ANALYSIS.md`

**Core Workflow**:
```
Day 0 (00:00 UTC): GitHub Action → Collect tomorrow's forecast → Commit to Git
Day 1 (00:00 UTC): GitHub Action → Collect today's weather → Compare with Day 0 forecast → Calculate consistency
Weekly: GitHub Action → AI analysis (GPT-4o) → Generate provider rankings
```

**Data Structure**:
```
data/
├── predictions/2025-10-09.json     # Tomorrow's forecasts
├── observations/2025-10-09.json    # Today's actual weather
└── analysis/week-1.json            # Weekly AI analysis results
```

**TalkPython Weather API Investigation** (New):
- **Status**: Verified working, returns valid data
- **Rate Limit**: 50 unique lookups/hour
- **Limitations**: 
  - No Forecast API (Phase 6 incompatible)
  - Educational use only restriction
- **Decision Pending**: Add to Phase 5 (current weather only) or skip
- **Reference**: `docs/TALKPYTHON_API_ANALYSIS.md`

**Implementation Plan**: `docs/PHASE_6_PLAN.md`
- Week 1: Forecast API integration + GitHub Actions setup
- Week 2: Consistency calculation + Weekly AI analysis
- Week 3-4: Admin UI + Data visualization
- Week 5-8: Continuous data collection + Final analysis

**Cost**: $0.20/month (OpenAI API only, GitHub Actions free)

---

## Quick Start for New Session

To continue this project in a new Claude session:

1. Read this document completely
2. Review phase summaries: `docs/PHASE_4_SUMMARY.md` and `docs/PHASE_5_SUMMARY.md`
3. Check `docs/USER_DECISIONS.md` for all final decisions
4. Review recent git tags: `v0.4.0-testing` and `v0.5.0-ux`
5. Follow the user's approval pattern (wait for "이행" before major changes)
6. Always distinguish technical constraints from UX recommendations
7. Always use Perplexity AI for web research (primary requirement)

**Current Status**: Phase 5 complete. 85 tests passing. **Phase 6 (Weather Accuracy Tracking) planning complete - ready to start Week 1 implementation.**

**Test Coverage**: 80%+ on core logic (Adapters, WeatherService), 50% overall (includes Vue components)

**Confirmed Decisions for Phase 6**:
1. ✅ Data storage: GitHub Actions + JSON files (free, Git-based)
2. ✅ Ground truth: Relative consistency analysis (self-consistency)
3. ✅ City coverage: Seoul only (PoC, expand later)
4. ✅ AI analysis: Weekly ($0.20/month for 4 weeks)

**Pending Decisions**:
1. ⏳ TalkPython Weather API: Add to Phase 5 (current weather only) or skip?
   - Pros: Provider diversity, educational fit
   - Cons: "Educational use only" restriction, no Forecast API
   - Recommended: Conditional addition (Phase 5 only, exclude from Phase 6)

**Next Steps**:
1. Decide on TalkPython API addition
2. Start Phase 6 Week 1: Forecast API integration
3. Setup GitHub Actions workflows

**Recent Commits** (2025-10-09):
- `6ce1934`: Phase 6 design document
- `69f4d6f`: SESSION_CONTEXT update (Phase 4-5 completion)
- `13097b9`: Phase 6 plan + macOS sleep analysis

**Key Documents**:
- `docs/PHASE_6_PLAN.md`: Week-by-week implementation plan
- `docs/WEATHER_ACCURACY_TRACKING_DESIGN.md`: System architecture
- `docs/MACOS_SLEEP_LOCAL_SERVER_ANALYSIS.md`: Local server analysis
- `docs/TALKPYTHON_API_ANALYSIS.md`: TalkPython API evaluation

---

*Document created: 2025-10-08*  
*Last updated: 2025-10-09*  
*Version: 2.2*
