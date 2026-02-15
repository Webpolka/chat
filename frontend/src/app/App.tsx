// src/app/App.tsx
import React from "react";
import { GlobalProviders } from "@/app/providers/global/GlobalProvider";

import { AuthProvider } from "@/app/providers/auth/AuthProvider";
import { AppRouter } from "./routes/AppRouter";

export const App: React.FC = () => {

  return (
    <GlobalProviders>
      <AuthProvider>
       
          <AppRouter />
       
      </AuthProvider>
    </GlobalProviders>
  );
};
