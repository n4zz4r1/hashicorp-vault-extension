<template>
  <v-container>
    <v-text-field v-model="searchTerm" label="Search" placeholder="search a secret..." variant="solo"
      prepend-inner-icon="mdi-magnify" @input="search" density="compact"></v-text-field>
    <v-card class="mx-auto">

      <v-list lines="three" v-if="searchTerm">
        <v-list-item v-if="currentKeys.length == 0">
          No keys found.
        </v-list-item>
        <v-list-item v-for="item in currentKeys" :key="item.index">
          <template v-slot:title>
            {{ item.key }}
          </template>
          <template v-slot:subtitle>
            {{ item.group }}
          </template>
          <template v-slot:prepend>
          </template>
          <template v-slot:append>
            <v-btn icon="mdi-auto-fix" variant="text" size="small"></v-btn>
            <v-btn icon="mdi-content-copy" variant="text" size="small" @click="copyTextToClipboard(item)"></v-btn>
            <v-btn icon="mdi-eye" variant="text" size="small" @click="showKeys(item)"></v-btn>
          </template>
        </v-list-item>
        <v-list-item v-if="currentKeys.length == 0">
          No keys found.
        </v-list-item>
      </v-list>
    </v-card>
    <v-dialog v-model="dialog" width="300px">
      <v-card>
        <v-card-text>
          <h4>Key: <b>{{ this.currentItem.key }}</b></h4>
          <h5>Group: <b>{{ this.currentItem.group }}</b></h5>
        </v-card-text>
        <v-container>
          <v-text-field v-model="currentUsername" :prepend-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show1 ? 'text' : 'password'" name="input-10-1" label="Username" @click:prepend="show1 = !show1"
            @click="copyText(this.currentUsername)" variant="outlined"></v-text-field>
          <v-text-field v-model="currentPassword" :prepend-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show2 ? 'text' : 'password'" name="input-10-1" label="Password" @click:prepend="show2 = !show2"
            @click="copyText(this.currentPassword)" variant="outlined"></v-text-field>
          <v-text-field v-model="currentDomain" :prepend-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show3 ? 'text' : 'password'" name="input-10-1" label="Domain" @click:prepend="show3 = !show3"
            @click="copyText(this.currentDomain)" variant="outlined"></v-text-field>
        </v-container>
        <v-card-actions>
          <v-btn color="primary" block @click="dialog = false">Close Dialog</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomeView',
  data() {
    return {
      server: localStorage.getItem('server'),
      clientToken: localStorage.getItem('client_token'),
      clientKeys: [],
      currentKeys: [],
      dialog: false,
      show1: false,
      show2: false,
      show3: false,
      secretOpened: false,

      searchTerm: "",
      currentPassword: "",
      currentUsername: "",
      currentDomain: " ",
      currentItem: {},
    };
  },
  async created() {
    const response = await axios.get(`${this.server}/v1/sys/internal/ui/mounts`, {
      headers: {
        "X-Vault-Token": this.clientToken
      }
    });

    const groups = Object.keys(response.data.data.secret);
    for (let index = 0; index < groups.length; index++) {
      try {
        await this.addSecretKey(groups[index]);

      } catch (error) {
        // do nothing
      }
    }
  },
  methods: {
    async addSecretKey(group) {
      let response = await axios.get(`${this.server}/v1/${group}/metadata?list=true`, {
        headers: {
          "X-Vault-Token": this.clientToken
        }
      });
      const secretKeyList = response.data.data.keys;

      for (let index = 0; index < secretKeyList.length; index++) {
        const secretKey = secretKeyList[index];

        this.clientKeys.push({
          "intex": index,
          "group": group,
          "key": secretKey
        });
      }

    },
    search() {
      if (this.searchTerm) {
        this.currentKeys = this.clientKeys.filter(this.searchFilter);
      } else {
        this.currentKeys = [];
      }
    },
    searchFilter(item) {
      return item.key.includes(this.searchTerm);
    },
    async fetchSecret(item) {
      try {
        let response = await axios.get(`${this.server}/v1/${item.group}/data/${item.key}?version=1`, {
          headers: {
            "X-Vault-Token": this.clientToken
          }
        });

        return response.data.data;

      } catch (error) {
        return undefined;
      }

    },
    async copy(text) {
      // Create a temporary textarea element
      let textarea = document.createElement('textarea');
      textarea.id = "temp_passwd";
      textarea.value = JSON.parse(JSON.stringify(text));
      document.body.appendChild(textarea);

      // Select the text in the textarea
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    },
    async copyTextToClipboard(item) {
      const secret = await this.fetchSecret(item);
      await this.copy(secret?.data?.password)
    },
    async copyText(item) {
      await this.copy(item)
    },
    async showKeys(item) {
      const secret = await this.fetchSecret(item);
      this.currentUsername = secret?.data?.username;
      this.currentPassword = secret?.data?.password;
      // change to domain
      // this.currentDomain = secret?.data?.metadata['custom_metadata']['site'];
      this.currentItem = item;
      this.dialog = true;

    },
  }

}
</script>
