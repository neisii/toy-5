# Commit Convention

**작성일**: 2025-10-14  
**목적**: 모노레포 환경에서 프로젝트별 커밋 구분 및 히스토리 추적

---

## 📋 커밋 메시지 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type (필수)

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 변경만 (코드 변경 없음)
- **style**: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- **refactor**: 리팩토링 (기능 변경 없음)
- **test**: 테스트 추가 또는 수정
- **chore**: 빌드, 설정, 의존성 업데이트 등
- **perf**: 성능 개선
- **ci**: CI/CD 설정 변경

### Scope (필수)

프로젝트 디렉토리에 따른 scope:

| 디렉토리 | Scope | 설명 |
|---------|-------|------|
| `01-todo-app/` | `todo-app` | 할 일 관리 앱 |
| `02-weather-app/` | `weather-app` | 날씨 검색 앱 |
| `03-shopping-mall/` | `shopping-mall` | 쇼핑몰 앱 |
| `04-auth-form/` | `auth-form` | 로그인/회원가입 폼 |
| `05-chat-app/` | `chat-app` | 실시간 채팅 앱 |
| 루트 디렉토리 | `root` | 공통 설정, 문서 등 |
| `docs/` | `docs` | 문서 전용 변경 |

### Subject (필수)

- 명령형 현재 시제 사용 ("add", "change" not "added", "changes")
- 첫 글자 소문자
- 마침표 없음
- 50자 이내

---

## ✅ 올바른 예시

```bash
# 기능 추가
feat(weather-app): add demo mode for accuracy dashboard
feat(todo-app): implement drag and drop reordering
feat(shopping-mall): add product search functionality

# 버그 수정
fix(auth-form): resolve JWT token expiration issue
fix(chat-app): fix message scroll position bug
fix(weather-app): correct forecast date filtering

# 문서
docs(weather-app): update Phase 6 completion status
docs(root): add commit convention guide
docs(shopping-mall): update API documentation

# 테스트
test(todo-app): add LocalStorage persistence tests
test(auth-form): add JWT validation tests

# 리팩토링
refactor(weather-app): extract API logic to separate service
refactor(shopping-mall): simplify cart state management

# 설정/빌드
chore(weather-app): upgrade vue-router to v4.5
chore(root): update Playwright to v1.50
ci(weather-app): add GitHub Actions for data collection
```

---

## ❌ 잘못된 예시

```bash
# Scope 없음
feat: add new feature  ❌

# Type 없음
weather-app: add demo mode  ❌

# 과거형 사용
feat(todo-app): added new filter  ❌

# 첫 글자 대문자
feat(chat-app): Add typing indicator  ❌

# 마침표 사용
feat(auth-form): implement login.  ❌

# 모호한 메시지
fix(weather-app): fix bug  ❌  (어떤 버그인지 불명확)
```

---

## 🔍 Git Log 필터링

### 프로젝트별 히스토리 조회

```bash
# weather-app 관련 커밋만
git log --oneline --grep="weather-app"

# todo-app 관련 커밋만
git log --oneline --grep="todo-app"

# 특정 디렉토리 변경사항
git log --oneline -- 02-weather-app/

# 특정 프로젝트의 feat만
git log --oneline --grep="feat.*weather-app"

# 특정 프로젝트의 최근 10개 커밋
git log --oneline --grep="weather-app" -10
```

### 프로젝트별 통계

```bash
# 프로젝트별 커밋 수
git log --oneline | grep -o '([a-z-]*)' | sort | uniq -c

# 최근 20개 커밋의 프로젝트 분포
git log --oneline -20 | grep -o '([a-z-]*)' | sort | uniq -c

# 특정 기간 동안의 weather-app 커밋
git log --oneline --grep="weather-app" --since="2025-10-01" --until="2025-10-31"
```

---

## 📊 실제 커밋 예시 (2025-10-14 기준)

```bash
a46d15a docs(weather-app): update documentation with Phase 6 completion and first data collection
99f506a chore(weather-app): collect weather observations for 2025-10-14
bfc5134 chore(weather-app): collect weather predictions for 2025-10-14
df65567 feat(weather-app): add demo data mode for UI preview
dee70c6 feat(weather-app): implement accuracy tracking UI
eab3310 feat(weather-app): implement Week 1 - Forecast API and data collection
8df61d7 fix(weather-app): resolve localStorage and GitHub Actions issues
7e53413 fix(weather-app): move workflows to repository root for monorepo compatibility
```

---

## 💡 추가 가이드라인

### Body 사용 (선택사항)

복잡한 변경사항은 body에 상세 설명:

```bash
git commit -m "feat(weather-app): add demo mode for accuracy dashboard

- Generate 2 weeks of realistic sample data
- Add toggle button in dashboard header
- Support provider-specific accuracy profiles
- Enable immediate UI preview without waiting for data collection

Closes #123"
```

### Footer 사용 (선택사항)

- **Breaking Changes**: `BREAKING CHANGE:` 사용
- **Issue 참조**: `Closes #123`, `Fixes #456`
- **리뷰어**: `Reviewed-by: name`

```bash
feat(auth-form): implement OAuth 2.0 authentication

BREAKING CHANGE: JWT token structure changed, requires re-login

Closes #89
```

---

## 🚫 여러 프로젝트 동시 변경 시

**원칙**: 가능한 한 프로젝트별로 커밋 분리

```bash
# 나쁜 예
git add 01-todo-app/ 02-weather-app/
git commit -m "feat: update multiple projects"  ❌

# 좋은 예
git add 01-todo-app/
git commit -m "feat(todo-app): add new feature"
git add 02-weather-app/
git commit -m "feat(weather-app): add related feature"  ✅
```

**예외**: 공통 설정 변경 시 `root` scope 사용

```bash
# Playwright 설정이 모든 프로젝트에 영향
git commit -m "chore(root): upgrade Playwright to v1.50"
```

---

## 📈 향후 개선 (필요 시)

### Phase 2: 협업 시작 시
- CONTRIBUTING.md에 커밋 규칙 추가
- Git hook으로 format 가이드 표시

### Phase 3: 자동화 필요 시
- Commitizen + Commitlint 도입
- Changelog 자동 생성
- Semantic versioning

---

## 📚 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

**최종 업데이트**: 2025-10-14  
**버전**: 1.0.0
