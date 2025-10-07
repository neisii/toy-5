<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user = null;
  let error = '';
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/profile', {
        credentials: 'include'
      });

      if (!response.ok) {
        goto('/login');
        return;
      }

      const data = await response.json();
      user = data.user;
    } catch (err) {
      error = '프로필을 불러올 수 없습니다';
    } finally {
      loading = false;
    }
  });

  async function handleLogout() {
    try {
      await fetch('http://localhost:3002/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      goto('/login');
    } catch (err) {
      error = '로그아웃 중 오류가 발생했습니다';
    }
  }
</script>

<div class="container">
  <div class="form-card">
    <h1>프로필</h1>

    {#if loading}
      <p>로딩 중...</p>
    {:else if error}
      <div class="error message">{error}</div>
    {:else if user}
      <div style="margin: 20px 0;">
        <p><strong>이메일:</strong> {user.email}</p>
        <p><strong>가입일:</strong> {new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
      </div>

      <button on:click={handleLogout}>로그아웃</button>
    {/if}
  </div>
</div>
