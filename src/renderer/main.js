import Vue from 'vue';
import axios from 'axios';
import Element from 'element-ui';
import VueDragDrop from 'vue-drag-drop';
import VueI18n from 'vue-i18n';

import App from './App';
import router from './router';
import store from './store';

import '../../theme/styles/index.css';
global.Vue = Vue;

const messages = require('./i18n');

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(Element);
Vue.use(VueDragDrop);
// eslint-disable-next-line no-restricted-globals
const locale = location.search.replace('?locale=', '');
/* eslint-disable no-new */
new Vue({
  i18n: new VueI18n({
    locale: locale.match(/^(en|en-US|zh-CN)$/) ? locale : 'en',
    messages,
  }),
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
