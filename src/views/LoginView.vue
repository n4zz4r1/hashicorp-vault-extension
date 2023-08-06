<template>
  <v-container fluid style="height: 100vh" justify="center" align="left">
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="title-card" outlined style="padding-top: 20px;">
          <v-card-title class="d-flex align-center justify-center">
            <img src="img/logo.png" width="150">
          </v-card-title>
          <v-card-text>
            <slot></slot>
          </v-card-text>
        </v-card>
        <br>
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field v-model="server" label="Server" required outlined prepend-inner-icon="mdi-server"></v-text-field>
              <v-text-field v-model="username" label="Username" required outlined prepend-inner-icon="mdi-account"></v-text-field>
              <v-text-field v-model="password" label="Password" required outlined type="password" prepend-inner-icon="mdi-key"></v-text-field>
              <v-btn type="submit" color="secondary" variant="outlined" block :disabled="!(!!username && !!password && !!server)">Login</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
        <br>
        <v-card class="title-card" outlined v-if="loginError">
          <v-card-text>
            <v-alert type="error" dismissible>
              {{ loginError }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
    </v-row>

  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginView',
  data() {
    return {
      username: localStorage.getItem('username') || '',
      password: '',
      server: localStorage.getItem('server') || '',
      loginError: ''
    };
  },
  beforeCreate() {
    if (localStorage.getItem("client_token")) {
      this.$router.push('/home/search');
    }
  },
  methods: {
    async login() {
      localStorage.setItem('server', this.server);
      localStorage.setItem('username', this.username);
      this.loginError = '';

      try {
        await this.loginAndGoHome();

      } catch (error) {
        const errorMessage = (error?.response?.data?.errors?.[0]) || error;
        this.loginError = errorMessage;
      }

    },
    async loginAndGoHome() {
      const response = await axios.post(`${this.server}/v1/auth/userpass/login/${this.username}`, {
        password: this.password
      });

      response.data.auth.client_token;
      localStorage.setItem('client_token', response.data.auth.client_token);
      this.$router.push('/home');
    }
  }
}
</script>

<style scoped></style>
