import request from '../utils/request'

export const auth = {
  login(data) { return request.post('/auth/login', data) },
  register(data) { return request.post('/auth/register', data) },
  resetPassword(data) { return request.post('/auth/reset-password', data) }
}

export const manuals = {
  getList(params) { return request.get('/manuals', { params }) },
  getDetail(id) { return request.get(`/manuals/${id}`) },
  getRecommended() { return request.get('/manuals/recommended') },
  getCategories() { return request.get('/manuals/categories') },
  create(data) { return request.post('/manuals', data) },
  update(id, data) { return request.put(`/manuals/${id}`, data) },
  remove(id) { return request.delete(`/manuals/${id}`) }
}

export const myManuals = {
  getList(params) { return request.get('/my-manuals', { params }) },
  getDetail(id) { return request.get(`/my-manuals/${id}`) },
  create(data) { return request.post('/my-manuals', data) },
  update(id, data) { return request.put(`/my-manuals/${id}`, data) },
  remove(id) { return request.delete(`/my-manuals/${id}`) }
}

export const tournaments = {
  getList(params) { return request.get('/tournaments', { params }) },
  getDetail(id) { return request.get(`/tournaments/${id}`) },
  getGames(id) { return request.get(`/tournaments/${id}/games`) },
  getGame(gameId) { return request.get(`/tournaments/game/${gameId}`) }
}

export const players = {
  getList(params) { return request.get('/players', { params }) },
  getDetail(id) { return request.get(`/players/${id}`) },
  getManuals(id) { return request.get(`/players/${id}/manuals`) }
}

export const study = {
  recordStudy(data) { return request.post('/study/record', data) },
  getRecords() { return request.get('/study/records') },
  getStudiedCount() { return request.get('/study/count') }
}

export const favorites = {
  getList() { return request.get('/favorites') },
  add(data) { return request.post('/favorites', data) },
  remove(manualId) { return request.delete(`/favorites/${manualId}`) }
}

export const subscribe = {
  getPlans() { return request.get('/subscribe/plans') },
  subscribe(data) { return request.post('/subscribe', data) },
  getMy() { return request.get('/subscribe/my') }
}

export const user = {
  getProfile() { return request.get('/user/profile') }
}

export const news = {
  getList(params) { return request.get('/news', { params }) }
}

export const admin = {
  manuals: {
    getList(params)    { return request.get('/admin/manuals', { params }) },
    create(data)       { return request.post('/admin/manuals', data) },
    update(id, data)   { return request.put(`/admin/manuals/${id}`, data) },
    remove(id)         { return request.delete(`/admin/manuals/${id}`) },
    uploadPgn(id, file) {
      const fd = new FormData(); fd.append('file', file)
      return request.post(`/admin/manuals/${id}/upload-pgn`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
  },
  tournaments: {
    getList(params)    { return request.get('/admin/tournaments', { params }) },
    create(data)       { return request.post('/admin/tournaments', data) },
    update(id, data)   { return request.put(`/admin/tournaments/${id}`, data) },
    remove(id)         { return request.delete(`/admin/tournaments/${id}`) },
    uploadPgn(id, file) {
      const fd = new FormData(); fd.append('file', file)
      return request.post(`/admin/tournaments/${id}/upload-pgn`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
  },
  players: {
    getList(params)    { return request.get('/admin/players', { params }) },
    create(data)       { return request.post('/admin/players', data) },
    update(id, data)   { return request.put(`/admin/players/${id}`, data) },
    remove(id)         { return request.delete(`/admin/players/${id}`) }
  },
  news: {
    getList(params)    { return request.get('/admin/news', { params }) },
    create(data)       { return request.post('/admin/news', data) },
    update(id, data)   { return request.put(`/admin/news/${id}`, data) },
    remove(id)         { return request.delete(`/admin/news/${id}`) }
  }
}
