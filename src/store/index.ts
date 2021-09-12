import Vue from 'vue'
import Vuex from 'vuex'
import { mockData } from '@/data/mockData.ts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
    getFinanceData() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            'status': 'success',
            'data': mockData
          })
          reject(new Error('Registration error'))
        }, 200)
      })
    }
  },
  modules: {
  }
})
