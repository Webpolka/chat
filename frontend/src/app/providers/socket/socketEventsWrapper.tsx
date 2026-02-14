import { useSocketEvents } from "@/app/providers/socket/useSocketEvents";

export const SocketEventsWrapper = () => {
  useSocketEvents();
  return null;
};
