/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_API_BASE_URL: string;
  readonly VITE_REACT_APP_SOCKET_URL: string;
  readonly AUTH_TOKEN_KEY: string;
  readonly VITE_USE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
