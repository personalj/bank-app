import Vue from 'vue'
import Vuesax from 'vuesax'
import 'vuesax/dist/vuesax.css'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles.scss'
import { yearFilter } from '@/filters/year';

Vue.use(Vuesax);
Vue.filter('yearFilter', yearFilter);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
