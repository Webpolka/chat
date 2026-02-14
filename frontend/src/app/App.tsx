// src/app/App.tsx
import React from "react";
import { GlobalProviders } from "@/app/providers/global/GlobalProvider";
import { SocketProvider } from "@/app/providers/socket/SocketProvider";
import { AuthProvider } from "@/app/providers/auth/AuthProvider";
import { AppRouter } from "./routes/AppRouter";
import { SocketEventsWrapper } from "./providers/socket/socketEventsWrapper";

export const App: React.FC = () => {

  return (
    <GlobalProviders>
      <AuthProvider>
        <SocketProvider>
          <SocketEventsWrapper />
          <AppRouter />
        </SocketProvider>
      </AuthProvider>
    </GlobalProviders>
  );
};
