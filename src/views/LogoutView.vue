<template>
  <span></span>
</template>

<script>
export default {
  name: 'LogoutView',
  created() {
    localStorage.setItem("client_token", "");
    this.$router.push('/login');
  }
}

</script>
