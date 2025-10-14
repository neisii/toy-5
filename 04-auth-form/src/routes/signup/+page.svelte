<script>
  import { signupSchema } from '$lib/utils/validation';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let errors = {};
  let successMessage = '';
  let loading = false;

  async function handleSubmit() {
    errors = {};
    successMessage = '';

    // 클라이언트 검증
    try {
      signupSchema.parse({ email, password, confirmPassword });
    } catch (err) {
      // Zod validation error uses 'issues' not 'errors'
      if (err.issues) {
        err.issues.forEach(issue => {
          errors[issue.path[0]] = issue.message;
        });
      } else {
        errors.general = '검증 오류가 발생했습니다';
      }
      return;
    }

    // 서버 요청
    loading = true;
    try {
      const response = await fetch('http://localhost:3002/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errors.general = data.error;
        return;
      }

      successMessage = '회원가입 완료!';
      setTimeout(() => {
        goto('/login');
      }, 1500);
    } catch (error) {
      errors.general = '서버에 연결할 수 없습니다';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <div class="form-card">
    <h1>회원가입</h1>

    {#if successMessage}
      <div class="success message">{successMessage}</div>
    {/if}

    {#if errors.general}
      <div class="error message">{errors.general}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          bind:value={email}
          placeholder="이메일을 입력하세요"
        />
        {#if errors.email}
          <div class="error">{errors.email}</div>
        {/if}
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          bind:value={password}
          placeholder="비밀번호를 입력하세요"
        />
        {#if errors.password}
          <div class="error">{errors.password}</div>
        {/if}
      </div>

      <div class="form-group">
        <label for="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          bind:value={confirmPassword}
          placeholder="비밀번호를 다시 입력하세요"
        />
        {#if errors.confirmPassword}
          <div class="error">{errors.confirmPassword}</div>
        {/if}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '가입 중...' : '가입하기'}
      </button>
    </form>

    <div class="link">
      이미 계정이 있으신가요? <a href="/login">로그인</a>
    </div>
  </div>
</div>
