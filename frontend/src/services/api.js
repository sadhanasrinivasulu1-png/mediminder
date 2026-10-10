const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('mediminder_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Auto logout on expired session if it's not a login attempt
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('mediminder_token');
        localStorage.removeItem('mediminder_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    getProfile: () => request('/auth/profile'),
    updateProfile: (userData) => request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  },
  medicines: {
    getAll: () => request('/medicines'),
    getById: (id) => request(`/medicines/${id}`),
    create: (data) => request('/medicines', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/medicines/${id}`, {
      method: 'DELETE'
    })
  },
  reminders: {
    getToday: (date) => request(`/reminders/today${date ? `?date=${date}` : ''}`),
    getUpcoming: (limit = 10) => request(`/reminders/upcoming?limit=${limit}`),
    updateStatus: (id, status) => request(`/reminders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
    getHistory: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/reminders/history${query ? `?${query}` : ''}`);
    },
    getStats: () => request('/reminders/stats'),
    triggerGenerate: () => request('/reminders/generate', { method: 'POST' })
  }
};
