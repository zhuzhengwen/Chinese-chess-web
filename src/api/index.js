import request from '../utils/request'

// Auth
export const auth = {
  login(data) {
    return request.post('/auth/login', data)
  },
  register(data) {
    return request.post('/auth/register', data)
  }
}

// Manuals
export const manuals = {
  getList(params) {
    return request.get('/manuals', { params })
  },
  getDetail(id) {
    return request.get(`/manuals/${id}`)
  },
  getRecommended() {
    return request.get('/manuals/recommended')
  },
  getCategories() {
    return request.get('/manuals/categories')
  }
}

// Study records
export const study = {
  recordStudy(data) {
    return request.post('/study/record', data)
  },
  getRecords() {
    return request.get('/study/records')
  },
  getStudiedCount() {
    return request.get('/study/count')
  }
}

// Favorites
export const favorites = {
  getList() {
    return request.get('/favorites')
  },
  add(data) {
    return request.post('/favorites', data)
  },
  remove(manualId) {
    return request.delete(`/favorites/${manualId}`)
  }
}

// Subscribe
export const subscribe = {
  getPlans() {
    return request.get('/subscribe/plans')
  },
  subscribe(data) {
    return request.post('/subscribe', data)
  },
  getMy() {
    return request.get('/subscribe/my')
  }
}

// User
export const user = {
  getProfile() {
    return request.get('/user/profile')
  }
}
