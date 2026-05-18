import request from '../utils/request'

export const auth = {
  login(data) { return request.post('/auth/login', data) },
  register(data) { return request.post('/auth/register', data) }
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
  getGames(id) { return request.get(`/tournaments/${id}/games`) }
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
