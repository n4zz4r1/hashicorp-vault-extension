<template>
  <v-app-bar app height="40">
    <v-btn variant="plain" color="secondary" density="comfortable" @click="home">
      <v-icon>mdi-home</v-icon>
    </v-btn>
    <v-btn variant="tonal" color="secondary" density="comfortable" @click="openCreate">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn to="/logout" variant="plain">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
  <v-main>
    <v-container>
      <span v-show="!this.currentItem.key && !this.isNew">
        <v-text-field v-model="searchTerm" label="Search" placeholder="search a secret..." variant="solo"
          prepend-inner-icon="mdi-magnify" @input="search" density="compact"></v-text-field>
        <v-card class="mx-auto" v-show="!this.currentItem.key">

          <v-list lines="three" v-if="searchTerm" density="compact">
            <v-list-item v-for="item in currentKeys" :key="item.index" density="compact">
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
      </span>

      <v-card v-show="!!this.currentItem.key || !!this.isNew" class="mx-auto" prepend-icon="mdi-key">
        <template v-slot:title>
          {{ this.currentItem.group }}<b>{{ this.currentItem.key }}</b>
        </template>

        <v-card-text>
          <v-select label="Group" v-model="this.currentItem.group" :items="groups" variant="outlined" density="compact"
            v-if="this.isNew"></v-select>
          <v-text-field density="compact" v-model="this.currentItem.key" :type="text" label="Key" variant="outlined"
            v-if="this.isNew"></v-text-field>
          <v-text-field density="compact" v-model="this.currentItem.username" style="cursor: pointer"
            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :type="show1 ? 'text' : 'password'" label="Username"
            @click:append="show1 = !show1" @click="copyText(this.currentItem.username)" variant="outlined"></v-text-field>
          <v-text-field density="compact" v-model="this.currentItem.secret" style="cursor: pointer"
            :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" :type="show2 ? 'text' : 'password'" label="Secret"
            @click:append="show2 = !show2" @click="copyText(this.currentItem.secret)" variant="outlined"></v-text-field>
          <v-text-field density="compact" v-model="this.currentItem.domain" style="cursor: pointer"
            :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'" :type="show3 ? 'text' : 'password'" label="Domain"
            @click:append="show3 = !show3" @click="copyText(this.currentItem.domain)" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" color="teal-accent-4" @click="clean()">
            back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="save()" color="secondary" variant="elevated" v-if="isNew"
            :disabled="!this.currentItem.secret || !this.currentItem.username || !this.currentItem.domain || !this.currentItem.group || !this.currentItem.key">
            create
          </v-btn>
        </v-card-actions>

      </v-card>

      <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
        {{ snackbarText }}
        <template v-slot:actions>
        </template>
      </v-snackbar>

    </v-container>
  </v-main>
</template>

<script>
import axios from 'axios';
// import { Transition } from 'vue';

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
      snackbar: false,
      snackbarTimeout: 1500,
      groups: [],
      snackbarText: "",

      currentItem: {
        selectedGroup: "",
        key: "",
        secret: "",
        username: "",
        domain: "",
      },
      isNew: false,
    };
  },
  async created() {
    this.fetchAll();
  },
  methods: {
    async fetchAll() {
      const response = await axios.get(`${this.server}/v1/sys/internal/ui/mounts`, {
        headers: {
          "X-Vault-Token": this.clientToken
        }
      });
      this.groups = Object.keys(response.data.data.secret);
      for (let index = 0; index < this.groups.length; index++) {
        try {
          await this.addSecretKey(this.groups[index]);
        }
        catch (error) {
          // do nothing
        }
      }
    },
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
      }
      else {
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
      }
      catch (error) {
        return undefined;
      }
    },
    async save() {
      try {
        await axios.post(`${this.server}/v1/${this.currentItem.group}data/${this.currentItem.key}`, {
          "data": {
            "username": this.currentItem.username,
            "password": this.currentItem.secret
          },
          "options": {
            "cas": 0
          }
        }, {
          headers: {
            "X-Vault-Token": this.clientToken
          }
        });

        await axios.post(`${this.server}/v1/${this.currentItem.group}metadata/${this.currentItem.key}`, {
          "id": this.currentItem.key,
          "custom_metadata": {
            "domain": this.currentItem.domain,
            "mfa": "--k"
          },
          "max_versions": 10,
          "cas_required": false,
          "delete_version_after": 0
        }, {
          headers: {
            "X-Vault-Token": this.clientToken
          }
        });
        this.currentItem.key = "";
        this.currentItem.username = "";
        this.currentItem.secret = "";
        this.currentItem.domain = "";

        this.snackbarText = "Created!";
        this.snackbar = true;
        this.fetchAll();

      }
      catch (error) {
        console.error("error", error);
        return undefined;
      }
    },
    home() {
      this.searchTerm = "";
      this.clean();
    },
    openCreate() {
      this.clean();
      this.show1 = true;
      this.show2 = true;
      this.show3 = true;
      this.isNew = true;
    },
    clean() {
      this.isNew = false;
      this.currentItem = {
        selectedGroup: "",
        key: "",
        secret: "",
        username: "",
        domain: "",
      }
      this.show1 = false;
      this.show2 = false;
      this.show3 = false;

    },
    async copy(text) {
      if (!text || this.isNew) {
        return;
      }
      // Create a temporary textarea element
      let textarea = document.createElement('textarea');
      textarea.id = "temp_passwd";
      textarea.value = JSON.parse(JSON.stringify(text));
      document.body.appendChild(textarea);
      // Select the text in the textarea
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.snackbarText = "Copied!";
      this.snackbar = true;
    },
    async copyTextToClipboard(item) {
      const secret = await this.fetchSecret(item);
      await this.copy(secret?.data?.password);
    },
    async copyText(item) {
      await this.copy(item);
    },
    async showKeys(item) {
      const secret = await this.fetchSecret(item);
      this.currentItem = {
        username: secret?.data?.username,
        secret: secret?.data?.password,
        group: item.group,
        key: item.key,
        domain: secret?.metadata?.custom_metadata?.domain,
      };
      this.dialog = true;
    },
  },
  // components: { Transition }
}
</script>
<style>
.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}
</style>cop