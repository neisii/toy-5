<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/login');
  });
</script>

<div class="container">
  <p>리다이렉트 중...</p>
</div>
