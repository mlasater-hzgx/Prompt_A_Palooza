const AZURE_AD_CLIENT_ID = import.meta.env.VITE_AZURE_AD_CLIENT_ID ?? '';
const AZURE_AD_AUTHORITY = import.meta.env.VITE_AZURE_AD_AUTHORITY ?? '';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI ?? window.location.origin;

export const msalConfig = {
  auth: {
    clientId: AZURE_AD_CLIENT_ID,
    authority: AZURE_AD_AUTHORITY,
    redirectUri: REDIRECT_URI,
    postLogoutRedirectUri: REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage' as const,
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

export const isAzureAdConfigured = !!AZURE_AD_CLIENT_ID && !!AZURE_AD_AUTHORITY;
