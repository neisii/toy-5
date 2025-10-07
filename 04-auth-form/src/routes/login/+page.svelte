<script>
  import { loginSchema } from '$lib/utils/validation';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errors = {};
  let loading = false;

  async function handleSubmit() {
    errors = {};

    // 클라이언트 검증
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      err.errors.forEach(error => {
        errors[error.path[0]] = error.message;
      });
      return;
    }

    // 서버 요청
    loading = true;
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errors.general = data.error;
        return;
      }

      // 프로필 페이지로 이동
      goto('/profile');
    } catch (error) {
      errors.general = '서버에 연결할 수 없습니다';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <div class="form-card">
    <h1>로그인</h1>

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

      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>

    <div class="link">
      계정이 없으신가요? <a href="/signup">회원가입</a>
    </div>
  </div>
</div>
