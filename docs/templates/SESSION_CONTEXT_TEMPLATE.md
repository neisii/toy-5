# [Project Name] - Session Context

**Purpose**: Provide complete context for new Claude sessions to continue the [Project Name] project.

**Last Updated**: YYYY-MM-DD

---

## Project Overview

**Goal**: [프로젝트의 주요 목표를 한 문장으로]

**Tech Stack**:
- Frontend: [프레임워크/라이브러리]
- Styling: [CSS 프레임워크]
- State Management: [상태 관리 도구]
- Backend/API: [백엔드 기술]
- Testing: [테스트 프레임워크]

**Project Status**: [완료율]% Complete / In Progress / Planning

**Methodology**: AI-DLC (see `../docs/ai-dlc.txt`)

---

## Communication Guidelines

1. **Tone**: Informal (반말) between user and Claude
2. **Documentation**: 
   - SESSION_CONTEXT.md: English (for Claude sessions)
   - Other docs: Korean (for user reading)
   - Style: Fact-based (현상-원인-결과), avoid emojis, use numbering/bullets
3. **Phase Documentation Templates**:
   - Planning: Use `docs/templates/PHASE_PLAN_TEMPLATE.md`
   - Summary: Use `docs/templates/PHASE_SUMMARY_TEMPLATE.md`
   - Copy template and fill in sections for each phase
4. **Progress Tracking**: Always update this file after completing tasks
5. **Approval**: Ask user approval when requirements are ambiguous
6. **Troubleshooting**: Record all problem-solving processes in TROUBLESHOOTING.md
7. **Phase Management**: Divide work into phases, document each phase
8. **Commit Convention**: Follow Conventional Commits with Scope (see `docs/COMMIT_CONVENTION.md`)

---

## Architecture

### System Design
```
[Component Layer]
    ↓
[State Management] ← Domain types
    ↓
[Service Layer] ← Business logic
    ↓
[API/Data Layer] ← External services
```

**Key Design Principles**:
- [원칙 1]
- [원칙 2]
- [원칙 3]

### Technology Decisions
- **[기술 선택 1]**: [이유]
- **[기술 선택 2]**: [이유]
- **[기술 선택 3]**: [이유]

---

## Implemented Features

### Completed Phases

#### Phase 1: [Phase 제목] (YYYY-MM-DD)
**Status**: ✅ Complete

**Features**:
1. **[기능 1]**: [설명]
2. **[기능 2]**: [설명]
3. **[기능 3]**: [설명]

**Tests**: N/N passing

**Reference**: `docs/PHASE_1_SUMMARY.md`

---

#### Phase 2: [Phase 제목] (YYYY-MM-DD)
**Status**: ✅ Complete

**Features**:
1. **[기능 1]**: [설명]
2. **[기능 2]**: [설명]

**Tests**: N/N passing

**Reference**: `docs/PHASE_2_SUMMARY.md`

---

### In Progress

#### Phase [N]: [Phase 제목]
**Status**: ⚠️ In Progress

**Planned Features**:
- [ ] [기능 1]
- [ ] [기능 2]
- [ ] [기능 3]

**Reference**: `docs/PHASE_[N]_PLAN.md`

---

### Not Implemented

1. **[미구현 기능 1]**: [간단한 설명]
2. **[미구현 기능 2]**: [간단한 설명]
3. **[미구현 기능 3]**: [간단한 설명]

**Reference**: `docs/FUTURE_FEATURES.md`

---

## File Structure

```
[project-directory]/
├── src/
│   ├── [경로]/
│   │   ├── [파일1].ts           # [설명]
│   │   └── [파일2].ts           # [설명]
│   ├── [경로]/
│   │   ├── [파일3].tsx          # [설명]
│   │   └── [파일4].tsx          # [설명]
│   └── [경로]/
│       └── [파일5].ts           # [설명]
├── tests/
│   ├── [테스트1].spec.ts
│   └── [테스트2].spec.ts
├── docs/
│   ├── SESSION_CONTEXT.md       # This file
│   ├── PHASE_1_SUMMARY.md
│   ├── PHASE_2_SUMMARY.md
│   ├── TROUBLESHOOTING.md
│   └── FUTURE_FEATURES.md
├── [설정파일1]
├── [설정파일2]
└── README.md
```

**Important Files**:
- `[경로/파일]`: [역할 설명]
- `[경로/파일]`: [역할 설명]

---

## Data Models

### [Model 1]
```typescript
interface ModelName {
  id: number;
  name: string;
  property: type;
  // ...
}
```

**Usage**: [어디서 사용하는지]

---

### [Model 2]
```typescript
interface AnotherModel {
  // ...
}
```

---

## API Endpoints (if applicable)

### [API Provider Name]

**Base URL**: `https://api.example.com/v1`

**Endpoints**:
```bash
# Endpoint 1
GET /path?param=value

# Endpoint 2
POST /path
```

**Authentication**: [인증 방식]

**Rate Limits**: [제한 사항]

**Reference**: `docs/API_INTEGRATION_GUIDE.md`

---

## Environment Variables

```bash
# Required
VAR_NAME=value_description

# Optional
OPTIONAL_VAR=value_description
```

**Setup**:
```bash
cp .env.example .env
# Edit .env with your values
```

---

## User Decisions (All Final)

### 1. [결정 주제 1]
- **Decision**: [결정 내용]
- **Rationale**: [이유]
- **Date**: YYYY-MM-DD
- **Alternatives Considered**: [고려했던 다른 방안]

---

### 2. [결정 주제 2]
- **Decision**: [결정 내용]
- **Rationale**: [이유]
- **Impact**: [영향 범위]

---

### 3. [결정 주제 3]
[동일한 패턴으로 계속]

**Reference**: `docs/USER_DECISIONS.md` (if exists)

---

## Development Workflow

### Getting Started
```bash
cd [project-directory]
npm install
npm run dev
```

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npx playwright test

# Watch mode
npm run test:watch
```

### Building
```bash
npm run build
npm run preview  # Preview production build
```

---

## Testing Strategy

### Unit Tests
- **Framework**: [테스트 프레임워크]
- **Coverage Target**: N%
- **Current Coverage**: N%

**Key Test Files**:
- `tests/[파일].spec.ts`: [테스트 내용]

---

### E2E Tests
- **Framework**: Playwright
- **Test Scenarios**: N scenarios

**Test Coverage**:
- ✅ [시나리오 1]
- ✅ [시나리오 2]
- ⚠️ [시나리오 3] (flaky)

---

## Known Issues

### Active Issues

#### 1. [이슈 제목] (Priority: High/Medium/Low)
**Status**: Open / In Progress / Blocked

**Description**: [문제 설명]

**Impact**: [영향 범위]

**Workaround**: [임시 해결 방법]

**Tracked In**: `docs/TROUBLESHOOTING.md#issue-N`

---

### Resolved Issues

#### 1. [해결된 이슈]
**Resolved**: YYYY-MM-DD

**Solution**: [해결 방법]

**Reference**: `docs/TROUBLESHOOTING.md#issue-N`

---

## Performance Metrics (if applicable)

- **Build Time**: N seconds
- **Bundle Size**: N KB (gzip: N KB)
- **Lighthouse Score**:
  - Performance: N/100
  - Accessibility: N/100
  - Best Practices: N/100
  - SEO: N/100

---

## Security Considerations

### API Keys
- ⚠️ **Never commit API keys to git**
- ✅ Use `.env` file (git-ignored)
- ✅ Mask keys in documentation (e.g., `abc***xyz`)

### Best Practices
- [보안 실천 사항 1]
- [보안 실천 사항 2]

**Reference**: `docs/SECURITY_GUIDELINES.md` (if exists)

---

## Deployment (if applicable)

### Staging
- **URL**: https://staging.example.com
- **Deploy Command**: `npm run deploy:staging`

### Production
- **URL**: https://example.com
- **Deploy Command**: `npm run deploy:prod`
- **CI/CD**: [도구명] (GitHub Actions / Vercel / etc.)

---

## Dependencies

### Core Dependencies
```json
{
  "dependency1": "^version",
  "dependency2": "^version",
  "dependency3": "^version"
}
```

### Dev Dependencies
```json
{
  "dev-dependency1": "^version",
  "dev-dependency2": "^version"
}
```

**Update Policy**: [업데이트 정책]

---

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Convention
**Format**: `<type>(<scope>): <subject>`

**Types**: feat, fix, docs, style, refactor, test, chore

**Scopes**: [프로젝트별 스코프]

**Reference**: `docs/COMMIT_CONVENTION.md`

---

## Team Communication (if applicable)

### Decision Making
- **Format**: [결정 방식]
- **Documentation**: All decisions recorded in this file

### Code Review
- **Required Reviewers**: N
- **Merge Policy**: [정책]

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run type-check       # TypeScript type checking

# Database (if applicable)
npm run db:start         # Start JSON Server
npm run db:seed          # Seed database
```

---

## Quick Reference

### Common Tasks

#### Add New Feature
1. Create feature branch
2. Implement feature
3. Write tests
4. Update documentation
5. Commit with conventional format
6. Create PR / merge

#### Fix Bug
1. Reproduce bug
2. Write failing test
3. Fix bug
4. Verify test passes
5. Document in TROUBLESHOOTING.md
6. Commit

#### Update Dependencies
```bash
npm outdated           # Check outdated packages
npm update            # Update packages
npm run test          # Verify tests still pass
```

---

## Resources

### Documentation
- [Project Documentation](link)
- [API Documentation](link)
- [Design System](link)

### External Links
- [Framework Docs](link)
- [Library Docs](link)
- [Related Project](link)

---

## Changelog

### [Version] - YYYY-MM-DD
- [변경 사항 1]
- [변경 사항 2]

### [Previous Version] - YYYY-MM-DD
- [변경 사항]

**Full Changelog**: `CHANGELOG.md`

---

## Notes for New Sessions

### What to Check First
1. [ ] Read this SESSION_CONTEXT.md
2. [ ] Check latest PHASE_N_PLAN.md
3. [ ] Review open issues in Known Issues section
4. [ ] Run `npm install` and `npm run dev`
5. [ ] Verify tests pass: `npm run test`

### Important Reminders
- ⚠️ [중요 주의사항 1]
- ⚠️ [중요 주의사항 2]
- ✅ [권장 사항 1]
- ✅ [권장 사항 2]

---

**Last Session**: YYYY-MM-DD  
**Next Steps**: [다음 작업 내용]  
**Status**: Active / On Hold / Completed
