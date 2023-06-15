declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      NODE_ENV?: "development" | "production";
      DATABASE_URL?: string;
      JWT_SECRET_KEY: string;
      ADMIN_PASSWORD: string;
    }
  }
}

export {};

