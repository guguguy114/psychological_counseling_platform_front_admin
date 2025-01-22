import Vue from 'vue'
import Vuex from 'vuex'
import http from '@/utils/request'
import authToken from '@/utils/authToken'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    async getadmininfobytoken(context) {
      return await http.post("/admin/get_admin_info_by_token", {
        token: authToken.getToken()
      }).then(res => {
        if (res.code == 200) {
          context.commit("SETUSERDATA", res.data);
          return true;
        } else {
          return false;
        }
      }).catch(err => {
        return false;
      })
    },
    setuserdata(context, value) {
      context.commit("SETUSERDATA", value);

    }
  },
  mutations: {
    SETUSERDATA(state, value) {
      state.userData = value;

    }
  },
  state: {
    userData: {}
  },
  getters: {
  },
  modules: {
  }
})
