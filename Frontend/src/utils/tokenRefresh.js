import api from '../services/api';

let refreshInterval = null;


//   Start automatic token refresh
//   Refreshes token every 50 minutes (10 minutes before expiration)
 
export const startTokenRefresh = () => {
    // Clear any existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    const REFRESH_INTERVAL = 50 * 60 * 1000;

    refreshInterval = setInterval(async () => {
        const token = localStorage.getItem('a4_token');

        if (token) {
            try {
                const response = await api.post('/auth/refresh');
                const newToken = response.data.access_token;
                localStorage.setItem('a4_token', newToken);
                // console.log('Token refreshed successfully');
            } catch (error) {
                console.error('Failed to refresh token:', error);
                // Token refresh failed, user will be logged out on next API call
            }
        }
    }, REFRESH_INTERVAL);
};


//   Stop automatic token refresh for logout

export const stopTokenRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};