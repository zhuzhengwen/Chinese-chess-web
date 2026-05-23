import Vue from 'vue'
import Vuex from 'vuex'
import { auth, manuals, user as userApi } from '../api/index'

Vue.use(Vuex)

const userModule = {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || '',
    userInfo: null,
    authModalVisible: false,
    authModalMode: 'login'
  },
  mutations: {
    OPEN_AUTH_MODAL(state, mode = 'login') {
      state.authModalMode = mode
      state.authModalVisible = true
    },
    CLOSE_AUTH_MODAL(state) {
      state.authModalVisible = false
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_USER(state, userInfo) {
      state.userInfo = userInfo
    },
    LOGOUT(state) {
      state.token = ''
      state.userInfo = null
      localStorage.removeItem('token')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const res = await auth.login(credentials)
      if (res && res.data) {
        // res.data = LoginResponse: { token, user }
        commit('SET_TOKEN', res.data.token)
        commit('SET_USER', res.data.user || res.data.userInfo || res.data)
      }
      return res
    },
    async register(context, params) {
      const res = await auth.register(params)
      if (!res || res.code !== 200) {
        throw new Error((res && res.message) || '注册失败')
      }
      return res
    },
    async resetPassword(context, params) {
      const res = await auth.resetPassword(params)
      if (!res || res.code !== 200) {
        throw new Error((res && res.message) || '重置失败')
      }
      return res
    },
    logout({ commit }) {
      commit('LOGOUT')
    },
    async fetchProfile({ commit }) {
      try {
        const res = await userApi.getProfile()
        if (res && res.data) {
          commit('SET_USER', res.data)
        }
      } catch (e) {
        // ignore
      }
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    isVip: state => state.userInfo && state.userInfo.vip,
    isAdmin: state => !!(state.userInfo && (state.userInfo.role === 'admin' || state.userInfo.isAdmin))
  }
}

const manualModule = {
  namespaced: true,
  state: {
    categories: [],
    recommended: []
  },
  mutations: {
    SET_CATEGORIES(state, list) {
      state.categories = list
    },
    SET_RECOMMENDED(state, list) {
      state.recommended = list
    }
  },
  actions: {
    async fetchCategories({ commit }) {
      try {
        const res = await manuals.getCategories()
        commit('SET_CATEGORIES', res.data || res || [])
      } catch (e) {
        // ignore
      }
    },
    async fetchRecommended({ commit }) {
      try {
        const res = await manuals.getRecommended()
        commit('SET_RECOMMENDED', res.data || res || [])
      } catch (e) {
        // ignore
      }
    }
  }
}

export default new Vuex.Store({
  modules: {
    user: userModule,
    manual: manualModule
  }
})
