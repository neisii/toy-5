# GitHub Secret Scanning 설정 가이드

**작성일**: 2025-10-08  
**목적**: GitHub Secret Scanning 및 Push Protection 활성화 방법

---

## 📋 개요

GitHub Secret Scanning은 저장소에 푸시된 코드에서 **API 키, 토큰 등의 시크릿을 자동으로 탐지**하는 GitHub의 보안 기능입니다.

### 주요 기능
1. **Secret Scanning**: 이미 푸시된 코드에서 시크릿 탐지 (사후 감지)
2. **Push Protection**: 시크릿 포함 시 푸시 차단 (사전 차단)

---

## 🎯 활성화 방법

### 1. Repository 설정 페이지 접속

```
1. GitHub 저장소 페이지로 이동
   https://github.com/neisii/toy-5

2. 상단 메뉴에서 "Settings" 클릭

3. 왼쪽 사이드바에서 "Security" 섹션 찾기
   - "Code security and analysis" 클릭
```

### 2. Secret Scanning 활성화

```
"Secret scanning" 섹션 찾기
  ↓
[Enable] 버튼 클릭
  ↓
✅ "Secret scanning alerts" 활성화됨
```

**기능**:
- 저장소의 모든 커밋 히스토리 스캔
- 새로운 푸시마다 자동 스캔
- 시크릿 발견 시 Security 탭에 알림
- 저장소 관리자에게 이메일 발송

**요금**:
- ✅ Public 저장소: **무료**
- ❌ Private 저장소: GitHub Advanced Security 필요 (유료)

### 3. Push Protection 활성화 (권장)

```
"Push protection" 섹션 찾기
  ↓
[Enable] 버튼 클릭
  ↓
✅ "Push protection" 활성화됨
```

**기능**:
- 시크릿 포함 시 **푸시 전에 차단**
- 즉시 에러 메시지 표시
- 강제 푸시도 차단

**요금**:
- ✅ Public 저장소: **무료** (2023년부터)
- ❌ Private 저장소: GitHub Advanced Security 필요 (유료)

---

## 📸 설정 화면 예시

### Code security and analysis 페이지

```
┌─────────────────────────────────────────────────────┐
│ Code security and analysis                          │
├─────────────────────────────────────────────────────┤
│                                                       │
│ Secret scanning                                      │
│ ○ Disabled    ● Enabled    [Enable]                │
│                                                       │
│ Secret scanning helps prevent accidental commits    │
│ of API keys and other credentials.                  │
│                                                       │
│ Push protection                                      │
│ ○ Disabled    ● Enabled    [Enable]                │
│                                                       │
│ Block commits that contain supported secrets.        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 동작 방식

### Secret Scanning (사후 감지)

#### 1. 푸시 후 자동 스캔
```bash
$ git push origin main
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Writing objects: 100% (3/3), 300 bytes | 300.00 KiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To https://github.com/neisii/toy-5.git
   abc123..def456  main -> main

# 푸시는 성공하지만...
```

#### 2. 몇 분 내에 GitHub가 분석
```
GitHub 서버
  ↓
커밋 내용 분석
  ↓
200+ 종류의 시크릿 패턴 매칭
  ↓
매칭되면 알림 발송
```

#### 3. 이메일 알림 수신
```
From: GitHub <noreply@github.com>
Subject: [neisii/toy-5] Secret scanning alert: WeatherAPI key detected

We found a potential secret in your repository:
  - Type: WeatherAPI key
  - Commit: def456
  - Path: docs/PHASE_3_PLAN.md:442
  - Value: 4fc732b449b14468b80102642250810
```

#### 4. Security 탭에서 확인
```
GitHub → Repository → Security → Secret scanning alerts
  ↓
알림 목록 표시
  ↓
상세 정보 및 해결 방법 제공
```

---

### Push Protection (사전 차단)

#### 1. 시크릿 포함 커밋 푸시 시도
```bash
$ git push origin main
```

#### 2. GitHub가 즉시 차단
```bash
remote: error: GH013: Repository rule violations found
remote: 
remote: —— Push Protection ——————————————————————————
remote: 
remote: Resolve the following secrets detected:
remote: 
remote:   (WeatherAPI key) docs/file.md:10
remote:     pattern: weatherapi_key
remote:     token: 4fc732b449b14468b80102642250810
remote: 
remote: —————————————————————————————————————————————
remote: 
remote: Push blocked. Remove secrets and try again.
remote: 
remote: If you believe this is a false positive, you can:
remote:   1. Create a Secret Scanning Exclusion
remote:   2. Contact GitHub Support
remote: 
To https://github.com/neisii/toy-5.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/neisii/toy-5.git'
```

#### 3. 개발자가 수정 필요
```bash
# 1. 시크릿 제거 또는 마스킹
git add docs/file.md
git commit --amend

# 2. 다시 푸시
git push origin main
✅ 성공
```

---

## 🛡️ 탐지 가능한 시크릿 유형

GitHub Secret Scanning은 **200+ 종류**의 패턴을 자동 탐지합니다:

### API Keys
- AWS Access Keys
- Azure Keys
- Google Cloud API Keys
- OpenAI API Keys
- Stripe API Keys
- WeatherAPI Keys
- Generic API Keys (32+ characters)

### Tokens
- GitHub Personal Access Tokens
- OAuth Tokens
- JWT Tokens
- Slack Tokens

### Credentials
- Database Connection Strings
- Private SSH Keys
- TLS/SSL Certificates
- NPM Tokens

### 우리 프로젝트 관련
- ✅ OpenWeatherMap API Keys
- ✅ WeatherAPI.com Keys
- ✅ VITE_ 환경 변수 (일반 패턴)

---

## 📊 실제 사용 예시 (우리 프로젝트)

### 첫 번째 사고
```
파일: docs/PHASE_2_TO_3_CHECKLIST.md
노출 키: ad8d9ef4b10a050bb675e82e37db5d8b (OpenWeatherMap)
  ↓
GitHub 감지 (몇 분 내)
  ↓
이메일 알림: "Secret scanning alert"
  ↓
사용자 확인 및 키 폐기
```

### 두 번째 사고
```
파일: docs/PHASE_3_PLAN.md
노출 키: 4fc732b449b14468b80102642250810 (WeatherAPI)
  ↓
GitHub 감지
  ↓
이메일 알림
  ↓
사용자: "github.com에서 먼저 감지해서 나에게 이메일 알림이 온 상태야"
```

### 세 번째 사고
```
파일: docs/SECURITY_INCIDENT_20251008.md
노출 키: eaa7da9004ee47bc919135224250810 (WeatherAPI)
  ↓
GitHub 감지 예상
  ↓
수동 발견으로 선제 대응
```

---

## ✅ 활성화 확인 방법

### 1. Security 탭 확인
```
Repository → Security
  ↓
"Secret scanning" 섹션 존재 확인
  ↓
"Push protection" 배지 확인
```

### 2. 테스트 (권장하지 않음)
```bash
# 가짜 시크릿으로 테스트
echo "FAKE_KEY=abc123def456ghi789jkl012mno345pqr678" > test.txt
git add test.txt
git commit -m "test"
git push origin main

# Push Protection 활성화 시 → 차단됨
# 비활성화 시 → 푸시 후 알림
```

**⚠️ 주의**: 테스트 후 반드시 커밋 제거!

---

## 🔧 문제 해결

### Q1: Push Protection이 차단하지 않아요
**A**: 
- Push Protection이 활성화되었는지 확인
- Public 저장소인지 확인 (Private은 유료)
- 패턴이 GitHub 지원 목록에 있는지 확인

### Q2: False Positive (정상 문자열 차단)
**A**:
```
1. Secret scanning exclusion 추가
   Settings → Security → Secret scanning
   → "New exclusion"
   
2. 특정 파일/패턴 제외
   - Path: test/fixtures/*.txt
   - Pattern: 특정 정규식
```

### Q3: Private 저장소에서 활성화하려면?
**A**:
- GitHub Advanced Security 구독 필요 (유료)
- Organization 레벨 설정
- [GitHub Pricing 참조](https://github.com/pricing)

---

## 📝 활성화 체크리스트

### 필수 단계
- [ ] GitHub 저장소 Settings 페이지 이동
- [ ] Code security and analysis 섹션 찾기
- [ ] Secret scanning [Enable] 클릭
- [ ] Push protection [Enable] 클릭 (권장)
- [ ] 활성화 상태 확인 (녹색 ● 표시)

### 확인 단계
- [ ] Security 탭에서 "Secret scanning" 섹션 확인
- [ ] 이전 커밋에서 감지된 알림 확인 (있을 경우)
- [ ] 팀원에게 공지 (Push Protection 활성화됨)

### 문서 업데이트
- [ ] CONTRIBUTING.md에 언급
- [ ] README.md에 보안 배지 추가 (선택)

---

## 🎯 Pre-commit Hook과의 조합

### 다층 방어 전략

```
1차 방어: Pre-commit Hook (로컬)
  ↓
  커밋 전 차단
  ↓
  개발자 PC에서 검증
  
2차 방어: Push Protection (GitHub)
  ↓
  푸시 전 차단
  ↓
  서버에서 검증
  
3차 방어: Secret Scanning (GitHub)
  ↓
  푸시 후 탐지
  ↓
  즉시 알림
```

**효과**: 3번의 보안 사고 → 0번으로 감소

---

## 📚 추가 리소스

### 공식 문서
- [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [About push protection](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations)
- [Supported patterns](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns)

### 관련 프로젝트 문서
- `CONTRIBUTING.md`: 전체 보안 정책
- `docs/SECURITY_INCIDENT_20251008.md`: 보안 사고 기록
- `.husky/pre-commit`: Pre-commit hook 스크립트

---

## ✅ 요약

### 즉시 실행
1. **Settings** → **Security** → **Code security and analysis**
2. **Secret scanning** → **[Enable]**
3. **Push protection** → **[Enable]**

### 예상 시간
- 설정: **1-2분**
- 효과: **즉시**

### 비용
- Public 저장소: **무료** ✅
- Private 저장소: GitHub Advanced Security 필요

---

**마지막 업데이트**: 2025-10-08  
**다음 확인**: 설정 후 Security 탭에서 알림 확인
