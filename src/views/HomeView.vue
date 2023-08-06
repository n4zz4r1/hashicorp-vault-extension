<template>
  <v-app-bar app>
    <v-btn to="/home/search" variant="plain">
      <v-icon>mdi-home</v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn to="/logout" variant="plain">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
  <v-main>
    <router-view></router-view>
  </v-main>
</template>

<script>

export default {
  name: 'HomeView'
}
</script>

<style>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s;
}

.slide-right-enter,
.slide-right-leave-to {
  transform: translateX(-100%);
}
</style>
