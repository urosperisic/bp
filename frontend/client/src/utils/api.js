// src/utils/api.js

function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

export async function apiRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }
  
  const config = {
    ...options,
    headers,
    credentials: 'include',
  };
  
  try {
    let response = await fetch(url, config);
    
    if (response.status === 401 && !url.includes('/refresh/') && !url.includes('/login/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return fetch(url, config);
        });
      }
      
      isRefreshing = true;
      
      try {
        const refreshResponse = await fetch('/api/auth/refresh/', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshResponse.ok) {
          isRefreshing = false;
          processQueue(null);
          
          response = await fetch(url, config);
        } else {
          isRefreshing = false;
          processQueue(new Error('Refresh failed'));
          window.location.href = '/login';
          return null;
        }
      } catch (err) {
        isRefreshing = false;
        processQueue(err);
        window.location.href = '/login';
        return null;
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}