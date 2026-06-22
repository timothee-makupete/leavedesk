import { api } from "./client";
import type { Notification, PaginatedResponse } from "./types";

export const notificationsApi = {
  async list(page = 1) {
    const { data } = await api.get<PaginatedResponse<Notification>>("/notifications/", {
      params: { page },
    });
    return data;
  },

  async unreadCount() {
    const { data } = await api.get<{ unread_count: number }>("/notifications/unread-count/");
    return data.unread_count;
  },

  async markRead(id: number) {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read/`);
    return data;
  },

  async markAllRead() {
    const { data } = await api.post<{ marked_read: number }>("/notifications/mark-all-read/");
    return data;
  },
};
