import { Bell, LogOut, Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsApi } from "../api/notifications";
import type { Notification } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { initialsFor } from "../utils/format";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const initials = user ? initialsFor(user.first_name, user.last_name) : "?";
  const isAdmin = user?.role === "ADMIN";

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        notificationsApi.list(1),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(list.results);
      setUnreadCount(count);
    } catch {
      // silently ignore — bell stays usable
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) loadNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await notificationsApi.markRead(notification.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    }
    setOpen(false);
    if (!isAdmin) {
      navigate("/employee/history");
    }
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setUnreadCount(0);
    setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[#E2E8F0] bg-white px-2.5 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium text-slate-500">
          {isAdmin ? "" : ""}
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2 sm:gap-3">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[90vw] max-w-sm p-0 sm:w-80">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`block w-full border-b border-[#F1F5F9] px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    !notification.is_read ? "bg-[#EFF6FF]/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[#0F172A]">{notification.title}</p>
                    {!notification.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" />
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{timeAgo(notification.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

        <div className="flex items-center gap-1.5 border-l border-[#E2E8F0] pl-1.5 sm:gap-2 sm:pl-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-xs font-semibold text-[#1D4ED8] sm:h-9 sm:w-9 sm:text-sm">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-[#0F172A]">
              {user ? user.full_name || `${user.first_name} ${user.last_name}` : "—"}
            </div>
            <div className="text-xs text-slate-500">{isAdmin ? "Administrator" : "Employee"}</div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            className="inline-flex items-center justify-center rounded-md border border-[#E2E8F0] p-2 text-slate-700 hover:bg-slate-50 sm:px-3 sm:py-1.5"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="ml-1.5 hidden text-xs font-medium sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
