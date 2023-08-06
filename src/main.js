import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import router from './router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
    components,
    directives,
    defaultSet: 'mdi',
    aliases,
    sets: {
        mdi
    },
    theme: {
        defaultTheme: "dark"
    }
})

createApp(App).use(router).use(vuetify).mount('#app')
