// src/app/App.tsx
import React from "react";
import { AuthProvider } from "@/app/providers/auth/AuthProvider";
import { AppRouter } from "./routes/AppRouter";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};
