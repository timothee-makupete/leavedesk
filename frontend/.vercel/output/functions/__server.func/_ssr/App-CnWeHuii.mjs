import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as require_dist } from "../_libs/react-router-dom.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { n as y, t as xo } from "../_libs/react-toastify.mjs";
import { t as axios } from "../_libs/axios+[...].mjs";
import { C as CalendarClock, S as CalendarX, T as Bell, _ as ClipboardList, a as ShieldCheck, b as Check, c as Pencil, d as LogOut, f as LayoutDashboard, g as EyeOff, h as Eye, i as Trash2, l as Minus, m as FilePlusCorner, n as Users, o as Search, p as History, r as User, s as Plus, t as X, u as Menu, v as ChevronRight, w as CalendarCheck, x as Calendar, y as ChevronLeft } from "../_libs/lucide-react.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/@radix-ui/react-popover+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { a as stringType, i as objectType, n as enumType, r as literalType, t as booleanType } from "../_libs/zod.mjs";
import { n as jt, t as Lt } from "../_libs/input-otp.mjs";
import { a as CartesianGrid, c as Cell, d as Legend, i as XAxis, l as ResponsiveContainer, n as BarChart, o as Bar, r as YAxis, s as Pie, t as PieChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/App-CnWeHuii.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_dist = require_dist();
var API_BASE_URL = "https://leavedesk.onrender.com".replace(/\/+$/, "");
var ACCESS_KEY = "ems.access";
var REFRESH_KEY = "ems.refresh";
var USER_KEY = "ems.user";
var tokenStore = {
	getAccess: () => localStorage.getItem(ACCESS_KEY),
	getRefresh: () => localStorage.getItem(REFRESH_KEY),
	setTokens: (access, refresh) => {
		localStorage.setItem(ACCESS_KEY, access);
		localStorage.setItem(REFRESH_KEY, refresh);
	},
	clear: () => {
		localStorage.removeItem(ACCESS_KEY);
		localStorage.removeItem(REFRESH_KEY);
		localStorage.removeItem(USER_KEY);
	}
};
var api = axios.create({
	baseURL: `${API_BASE_URL}/api`,
	headers: { "Content-Type": "application/json" },
	timeout: 2e4
});
api.interceptors.request.use((config) => {
	const access = tokenStore.getAccess();
	if (access) config.headers.Authorization = `Bearer ${access}`;
	return config;
});
var refreshing = null;
async function refreshAccessToken() {
	if (refreshing) return refreshing;
	const refresh = tokenStore.getRefresh();
	if (!refresh) throw new Error("No refresh token");
	refreshing = axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh }, { headers: { "Content-Type": "application/json" } }).then((res) => {
		tokenStore.setTokens(res.data.access, res.data.refresh);
		return res.data.access;
	}).finally(() => {
		refreshing = null;
	});
	return refreshing;
}
api.interceptors.response.use((r) => r, async (error) => {
	const original = error.config;
	const status = error.response?.status;
	const url = original?.url || "";
	const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/verify-email") || url.includes("/auth/resend-verification") || url.includes("/auth/forgot-password") || url.includes("/auth/reset-password") || url.includes("/auth/token/refresh");
	if (status === 401 && original && !original._retry && !isAuthEndpoint && tokenStore.getRefresh()) {
		original._retry = true;
		try {
			const newAccess = await refreshAccessToken();
			original.headers = {
				...original.headers || {},
				Authorization: `Bearer ${newAccess}`
			};
			return api(original);
		} catch {
			tokenStore.clear();
			if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) window.location.assign("/login");
			return Promise.reject(error);
		}
	}
	if (status === 401 && !isAuthEndpoint) {
		tokenStore.clear();
		if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) window.location.assign("/login");
	} else if (status === 429) y.error("Too many requests. Please slow down and try again shortly.");
	else if (status && status >= 500) y.error("Server error. Please try again later.");
	return Promise.reject(error);
});
/** Extract a user-friendly message from a DRF error response. */
function getErrorMessage(error, fallback = "Something went wrong.") {
	const data = error?.response?.data;
	if (!data) return error?.message || fallback;
	if (typeof data === "string") return data;
	if (typeof data.detail === "string") return data.detail;
	if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0];
	const firstKey = Object.keys(data)[0];
	if (!firstKey) return fallback;
	const value = data[firstKey];
	if (Array.isArray(value)) return `${firstKey}: ${value[0]}`;
	if (typeof value === "string") return value;
	return fallback;
}
var authApi = {
	async login(email, password) {
		const { data } = await api.post("/auth/login/", {
			email,
			password
		});
		tokenStore.setTokens(data.access, data.refresh);
		localStorage.setItem(USER_KEY, JSON.stringify(data.user));
		return data;
	},
	async register(payload) {
		const { data } = await api.post("/auth/register/", payload);
		return data;
	},
	async verifyEmail(email, code) {
		const { data } = await api.post("/auth/verify-email/", {
			email,
			code
		});
		return data;
	},
	async resendVerification(email) {
		const { data } = await api.post("/auth/resend-verification/", { email });
		return data;
	},
	async forgotPassword(email) {
		const { data } = await api.post("/auth/forgot-password/", { email });
		return data;
	},
	async resetPassword(payload) {
		const { data } = await api.post("/auth/reset-password/", payload);
		return data;
	},
	async logout() {
		const refresh = tokenStore.getRefresh();
		try {
			if (refresh) await api.post("/auth/logout/", { refresh });
		} catch {} finally {
			tokenStore.clear();
		}
	},
	async getProfile() {
		const { data } = await api.get("/profile/");
		localStorage.setItem(USER_KEY, JSON.stringify(data));
		return data;
	},
	async updateProfile(patch) {
		const { data } = await api.patch("/profile/", patch);
		localStorage.setItem(USER_KEY, JSON.stringify(data));
		return data;
	}
};
var Ctx = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function bootstrapSession() {
			if (!tokenStore.getAccess()) {
				if (!cancelled) setLoading(false);
				return;
			}
			try {
				const profile = await authApi.getProfile();
				if (!cancelled) setUser(profile);
			} catch {
				tokenStore.clear();
				if (!cancelled) setUser(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		bootstrapSession();
		return () => {
			cancelled = true;
		};
	}, []);
	const value = {
		user,
		loading,
		async login(email, password) {
			const res = await authApi.login(email, password);
			setUser(res.user);
			return res.user;
		},
		async register(data) {
			return authApi.register(data);
		},
		async logout() {
			await authApi.logout();
			setUser(null);
		},
		async updateProfile(patch) {
			const u = await authApi.updateProfile(patch);
			setUser(u);
			return u;
		},
		async refreshUser() {
			if (!tokenStore.getAccess()) return null;
			try {
				const u = await authApi.getProfile();
				setUser(u);
				return u;
			} catch {
				tokenStore.clear();
				setUser(null);
				return null;
			}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
function ProtectedRoute() {
	const { user, loading } = useAuth();
	const location = (0, import_dist.useLocation)();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-slate-500",
		children: "Loading…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Navigate, {
		to: "/login",
		replace: true,
		state: { from: location.pathname }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Outlet, {});
}
function RoleRoute({ role }) {
	const { user } = useAuth();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Navigate, {
		to: "/login",
		replace: true
	});
	if (user.role !== role) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Navigate, {
		to: user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
		replace: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Outlet, {});
}
function AuthLayout() {
	const { user } = useAuth();
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Navigate, {
		to: user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
		replace: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-[#F8FAFC]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden flex-col justify-between border-r border-[#E2E8F0] bg-white p-12 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-9 w-9 place-items-center rounded-md bg-[#2563EB] font-semibold text-white",
							children: "LD"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base font-semibold text-[#0F172A]",
							children: "LeaveDesk"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight text-[#0F172A]",
							children: "Employee Leave Management"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-sm text-sm leading-6 text-slate-600",
							children: "A single workspace for HR teams and employees to request, review and track time-off in one place."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-6 space-y-2 text-sm text-slate-600",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• Submit leave requests in seconds" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• Track approvals and remaining balance" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• Manage employees and policies as an admin" })
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-slate-500",
						children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" LeaveDesk Inc."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center p-6 sm:p-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full max-w-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Outlet, {})
				})
			})]
		})
	});
}
var employeeNav = [
	{
		to: "/employee/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/employee/apply-leave",
		label: "Apply Leave",
		icon: FilePlusCorner
	},
	{
		to: "/employee/history",
		label: "Leave History",
		icon: History
	},
	{
		to: "/employee/profile",
		label: "Profile",
		icon: User
	}
];
var adminNav = [
	{
		to: "/admin/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/admin/leaves",
		label: "Leave Requests",
		icon: ClipboardList
	},
	{
		to: "/admin/employees",
		label: "Employees",
		icon: Users
	},
	{
		to: "/admin/audit-logs",
		label: "Audit Logs",
		icon: ShieldCheck
	},
	{
		to: "/admin/profile",
		label: "Profile",
		icon: User
	}
];
function Sidebar({ mobileOpen, onClose }) {
	const { user } = useAuth();
	const isAdmin = user?.role === "ADMIN";
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-16 items-center justify-between border-b border-[#E2E8F0] px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-8 w-8 place-items-center rounded-md bg-[#2563EB] text-sm font-semibold text-white",
						children: "LM"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-[#0F172A]",
						children: "LeaveDesk"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden",
					onClick: onClose,
					"aria-label": "Close menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex-1 space-y-1 px-3 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400",
					children: isAdmin ? "Administration" : "Workspace"
				}), (isAdmin ? adminNav : employeeNav).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.NavLink, {
					to: item.to,
					onClick: onClose,
					className: ({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-[#EFF6FF] text-[#1D4ED8]" : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"}`,
					end: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4" }), item.label]
				}, item.to))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-[#E2E8F0] p-4 text-xs text-slate-500",
				children: ["Logged in as", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 font-medium text-[#0F172A]",
					children: user ? user.full_name || `${user.first_name} ${user.last_name}` : "—"
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "fixed inset-y-0 left-0 hidden w-64 border-r border-[#E2E8F0] lg:block",
		children: content
	}), mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 lg:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-slate-900/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-y-0 left-0 w-64 border-r border-[#E2E8F0] shadow-lg",
			children: content
		})]
	})] });
}
var notificationsApi = {
	async list(page = 1) {
		const { data } = await api.get("/notifications/", { params: { page } });
		return data;
	},
	async unreadCount() {
		const { data } = await api.get("/notifications/unread-count/");
		return data.unread_count;
	},
	async markRead(id) {
		const { data } = await api.patch(`/notifications/${id}/read/`);
		return data;
	},
	async markAllRead() {
		const { data } = await api.post("/notifications/mark-all-read/");
		return data;
	}
};
function formatDate(d) {
	if (!d) return "—";
	const date = typeof d === "string" ? new Date(d) : d;
	if (isNaN(+date)) return "—";
	return date.toLocaleDateString(void 0, {
		year: "numeric",
		month: "short",
		day: "2-digit"
	});
}
function formatDateTime(d) {
	if (!d) return "—";
	const date = typeof d === "string" ? new Date(d) : d;
	if (isNaN(+date)) return "—";
	return date.toLocaleDateString(void 0, {
		year: "numeric",
		month: "short",
		day: "2-digit"
	}) + " • " + date.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function daysBetween(start, end) {
	const s = new Date(start);
	const e = new Date(end);
	if (isNaN(+s) || isNaN(+e)) return 0;
	return Math.max(1, Math.round((+e - +s) / 864e5) + 1);
}
function initialsFor(firstName, lastName) {
	return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase() || "?";
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
function timeAgo(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 6e4);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}
function Topbar({ onMenu }) {
	const { user, logout } = useAuth();
	const navigate = (0, import_dist.useNavigate)();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [unreadCount, setUnreadCount] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const initials = user ? initialsFor(user.first_name, user.last_name) : "?";
	const isAdmin = user?.role === "ADMIN";
	const loadNotifications = (0, import_react.useCallback)(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const [list, count] = await Promise.all([notificationsApi.list(1), notificationsApi.unreadCount()]);
			setNotifications(list.results);
			setUnreadCount(count);
		} catch {} finally {
			setLoading(false);
		}
	}, [user]);
	(0, import_react.useEffect)(() => {
		loadNotifications();
		const interval = window.setInterval(loadNotifications, 3e4);
		return () => window.clearInterval(interval);
	}, [loadNotifications]);
	const handleOpenChange = (next) => {
		setOpen(next);
		if (next) loadNotifications();
	};
	const handleNotificationClick = async (notification) => {
		if (!notification.is_read) {
			await notificationsApi.markRead(notification.id);
			setUnreadCount((c) => Math.max(0, c - 1));
			setNotifications((items) => items.map((item) => item.id === notification.id ? {
				...item,
				is_read: true
			} : item));
		}
		setOpen(false);
		if (!isAdmin) navigate("/employee/history");
	};
	const handleMarkAllRead = async () => {
		await notificationsApi.markAllRead();
		setUnreadCount(0);
		setNotifications((items) => items.map((item) => ({
			...item,
			is_read: true
		})));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onMenu,
				className: "rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden",
				"aria-label": "Open menu",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-slate-500",
					children: isAdmin ? "" : ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open,
				onOpenChange: handleOpenChange,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "relative rounded-md p-2 text-slate-500 hover:bg-slate-100",
						"aria-label": "Notifications",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-semibold text-white",
							children: unreadCount > 9 ? "9+" : unreadCount
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
					align: "end",
					className: "w-80 p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-[#0F172A]",
							children: "Notifications"
						}), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleMarkAllRead,
							className: "text-xs font-medium text-[#2563EB] hover:underline",
							children: "Mark all read"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-80 overflow-y-auto",
						children: loading && notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 py-6 text-center text-sm text-slate-500",
							children: "Loading…"
						}) : notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 py-6 text-center text-sm text-slate-500",
							children: "No notifications yet."
						}) : notifications.map((notification) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => handleNotificationClick(notification),
							className: `block w-full border-b border-[#F1F5F9] px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!notification.is_read ? "bg-[#EFF6FF]/40" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-[#0F172A]",
										children: notification.title
									}), !notification.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-5 text-slate-600",
									children: notification.message
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-slate-400",
									children: timeAgo(notification.created_at)
								})
							]
						}, notification.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 border-l border-[#E2E8F0] pl-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-9 w-9 place-items-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#1D4ED8]",
						children: initials
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden text-sm sm:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-[#0F172A]",
							children: user ? user.full_name || `${user.first_name} ${user.last_name}` : "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-slate-500",
							children: isAdmin ? "Administrator" : "Employee"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: async () => {
							await logout();
							navigate("/login", { replace: true });
						},
						className: "inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Logout"]
					})
				]
			})
		]
	});
}
function AppLayout() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[#F8FAFC] text-[#0F172A]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
			mobileOpen: open,
			onClose: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:pl-64",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Topbar, { onMenu: () => setOpen(true) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Outlet, {})
			})]
		})]
	});
}
var loginSchema = objectType({
	email: stringType().trim().min(1, "Email is required").email("Enter a valid email"),
	password: stringType().min(1, "Password is required")
});
var registerSchema = objectType({
	first_name: stringType().trim().min(2, "First name is required").max(50),
	last_name: stringType().trim().min(2, "Last name is required").max(50),
	email: stringType().trim().email("Enter a valid email").max(255),
	phone_number: stringType().trim().min(7, "Enter a valid phone number").max(20),
	department: stringType().trim().min(1, "Select a department"),
	employee_id: stringType().trim().min(1, "Employee ID is required").max(20),
	password: stringType().min(8, "Password must be at least 8 characters"),
	password_confirm: stringType().min(8, "Confirm your password")
}).refine((v) => v.password === v.password_confirm, {
	path: ["password_confirm"],
	message: "Passwords do not match"
});
var forgotPasswordSchema = objectType({ email: stringType().trim().min(1, "Email is required").email("Enter a valid email") });
objectType({
	email: stringType().trim().min(1, "Email is required").email("Enter a valid email"),
	code: stringType().length(6, "Enter the 6-digit code"),
	password: stringType().min(8, "Password must be at least 8 characters"),
	password_confirm: stringType().min(8, "Confirm your password")
}).refine((v) => v.password === v.password_confirm, {
	path: ["password_confirm"],
	message: "Passwords do not match"
});
var base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";
var variants = {
	primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#2563EB]",
	secondary: "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-slate-50 focus-visible:ring-slate-300",
	ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
	danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]",
	success: "bg-[#16A34A] text-white hover:bg-[#15803D] focus-visible:ring-[#16A34A]"
};
var sizes = {
	sm: "px-2.5 py-1.5 text-xs",
	md: "px-3.5 py-2"
};
var Button = (0, import_react.forwardRef)(function Button({ variant = "primary", size = "md", className = "", loading, children, disabled, ...rest }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		ref,
		disabled: disabled || loading,
		className: `${base} ${variants[variant]} ${sizes[size]} ${className}`,
		...rest,
		children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" }), children]
	});
});
var Input = (0, import_react.forwardRef)(function Input({ label, error, hint, className = "", id, ...rest }, ref) {
	const inputId = id || rest.name;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: inputId,
				className: "mb-1.5 block text-xs font-medium text-slate-700",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref,
				id: inputId,
				className: `block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${error ? "border-[#DC2626]" : "border-[#E2E8F0] focus:border-[#2563EB]"} ${className}`,
				...rest
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-[#DC2626]",
				children: error
			}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-slate-500",
				children: hint
			}) : null
		]
	});
});
function LoginPage() {
	const { login } = useAuth();
	const navigate = (0, import_dist.useNavigate)();
	const location = (0, import_dist.useLocation)();
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [serverError, setServerError] = (0, import_react.useState)(null);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: u(loginSchema),
		defaultValues: {
			email: location.state?.email ?? "",
			password: ""
		}
	});
	const onSubmit = async (values) => {
		setServerError(null);
		try {
			const user = await login(values.email, values.password);
			y.success(`Welcome back, ${user.first_name}`);
			navigate(location.state?.from || (user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"), { replace: true });
		} catch (err) {
			const message = getErrorMessage(err, "Unable to sign in");
			setServerError(message);
			if (message.toLowerCase().includes("verify your email")) y.info("Please verify your email before signing in.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-8 lg:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-9 w-9 place-items-center rounded-md bg-[#2563EB] font-semibold text-white",
				children: "LM"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Sign in to LeaveDesk"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "Use the email address registered with your LeaveDesk."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit(onSubmit),
			className: "mt-6 space-y-4",
			noValidate: true,
			children: [
				serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]",
					children: serverError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					label: "Email",
					type: "email",
					autoComplete: "email",
					placeholder: "you@company.com",
					error: errors.email?.message,
					...register("email")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Password",
						type: showPw ? "text" : "password",
						autoComplete: "current-password",
						placeholder: "••••••••",
						error: errors.password?.message,
						...register("password")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowPw((v) => !v),
						className: "absolute right-2 top-7 rounded p-1.5 text-slate-500 hover:bg-slate-100",
						"aria-label": showPw ? "Hide password" : "Show password",
						children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					loading: isSubmitting,
					className: "w-full",
					children: "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-right text-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
						to: "/forgot-password",
						className: "text-[#1D4ED8] hover:underline",
						children: "Forgot password?"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-slate-500",
					children: [
						"Don't have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/register",
							className: "text-[#1D4ED8] hover:underline",
							children: "Create one"
						}),
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/verify-email",
							className: "text-[#1D4ED8] hover:underline",
							children: "Verify email"
						})
					]
				})
			]
		})
	] });
}
var Select = (0, import_react.forwardRef)(function Select({ label, error, options, placeholder, className = "", id, ...rest }, ref) {
	const selectId = id || rest.name;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: selectId,
				className: "mb-1.5 block text-xs font-medium text-slate-700",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				ref,
				id: selectId,
				className: `block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${error ? "border-[#DC2626]" : "border-[#E2E8F0] focus:border-[#2563EB]"} ${className}`,
				...rest,
				children: [placeholder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					disabled: true,
					children: placeholder
				}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: o.value,
					children: o.label
				}, o.value))]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-[#DC2626]",
				children: error
			})
		]
	});
});
var LEAVE_TYPES = [
	"Annual Leave",
	"Sick Leave",
	"Maternity Leave",
	"Paternity Leave",
	"Compassionate Leave",
	"Other"
];
var DEPARTMENTS = [
	"Engineering",
	"Human Resources",
	"Finance",
	"Marketing",
	"Operations",
	"Sales",
	"Customer Support",
	"Product",
	"Legal"
];
function RegisterPage() {
	const { register: registerUser } = useAuth();
	const navigate = (0, import_dist.useNavigate)();
	const [serverError, setServerError] = (0, import_react.useState)(null);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: u(registerSchema),
		defaultValues: { department: "" }
	});
	const onSubmit = async (values) => {
		setServerError(null);
		try {
			await registerUser(values);
			y.success("Account created. Check your email for a verification code.");
			navigate("/verify-email", {
				replace: true,
				state: { email: values.email }
			});
		} catch (err) {
			setServerError(getErrorMessage(err, "Unable to register"));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Create your account"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "Employee self-registration."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit(onSubmit),
			className: "mt-6 space-y-4",
			noValidate: true,
			children: [
				serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]",
					children: serverError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "First name",
						error: errors.first_name?.message,
						...register("first_name")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Last name",
						error: errors.last_name?.message,
						...register("last_name")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					label: "Email",
					type: "email",
					placeholder: "you@company.com",
					error: errors.email?.message,
					...register("email")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Phone number",
						placeholder: "+265977777777",
						error: errors.phone_number?.message,
						...register("phone_number")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Employee ID",
						placeholder: "EMP001",
						error: errors.employee_id?.message,
						...register("employee_id")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					label: "Department",
					placeholder: "Select department",
					options: DEPARTMENTS.map((d) => ({
						value: d,
						label: d
					})),
					error: errors.department?.message,
					...register("department")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Password",
						type: "password",
						error: errors.password?.message,
						...register("password")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Confirm password",
						type: "password",
						error: errors.password_confirm?.message,
						...register("password_confirm")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					loading: isSubmitting,
					className: "w-full",
					children: "Create account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-slate-500",
					children: [
						"Already have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/login",
							className: "text-[#1D4ED8] hover:underline",
							children: "Sign in"
						})
					]
				})
			]
		})
	] });
}
var InputOTP = import_react.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lt, {
	ref,
	containerClassName: cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName),
	className: cn("disabled:cursor-not-allowed", className),
	...props
}));
InputOTP.displayName = "InputOTP";
var InputOTPGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center", className),
	...props
}));
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = import_react.forwardRef(({ index, className, ...props }, ref) => {
	const { char, hasFakeCaret, isActive } = import_react.useContext(jt).slots[index];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: cn("relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md", isActive && "z-10 ring-1 ring-ring", className),
		...props,
		children: [char, hasFakeCaret && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" })
		})]
	});
});
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = import_react.forwardRef(({ ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "separator",
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
}));
InputOTPSeparator.displayName = "InputOTPSeparator";
function VerifyEmailPage() {
	const navigate = (0, import_dist.useNavigate)();
	const location = (0, import_dist.useLocation)();
	const [email, setEmail] = (0, import_react.useState)(location.state?.email ?? "");
	const [code, setCode] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [resending, setResending] = (0, import_react.useState)(false);
	const [serverError, setServerError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (location.state?.email) setEmail(location.state.email);
	}, [location.state?.email]);
	const onVerify = async () => {
		if (code.length !== 6) {
			setServerError("Please enter the 6-digit verification code.");
			return;
		}
		if (!email.trim()) {
			setServerError("Email address is required.");
			return;
		}
		setServerError(null);
		setSubmitting(true);
		try {
			const res = await authApi.verifyEmail(email.trim(), code);
			y.success(res.message);
			navigate("/login", {
				replace: true,
				state: { email: email.trim() }
			});
		} catch (err) {
			setServerError(getErrorMessage(err, "Unable to verify email"));
		} finally {
			setSubmitting(false);
		}
	};
	const onResend = async () => {
		if (!email.trim()) {
			setServerError("Enter your email address to resend the code.");
			return;
		}
		setServerError(null);
		setResending(true);
		try {
			const res = await authApi.resendVerification(email.trim());
			y.success(res.message);
		} catch (err) {
			setServerError(getErrorMessage(err, "Unable to resend verification code"));
		} finally {
			setResending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Verify your email"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "We sent a 6-digit code to your email. Enter it below to activate your account."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4",
			children: [
				serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]",
					children: serverError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "verify-email",
					className: "mb-1.5 block text-xs font-medium text-slate-700",
					children: "Email address"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "verify-email",
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@company.com",
					className: "w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-xs font-medium text-slate-700",
					children: "Verification code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTP, {
					maxLength: 6,
					value: code,
					onChange: setCode,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputOTPGroup, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 0 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 1 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 2 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 3 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 4 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 5 })
					] })
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					loading: submitting,
					className: "w-full",
					onClick: onVerify,
					children: "Verify email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					loading: resending,
					className: "w-full",
					onClick: onResend,
					children: "Resend code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-slate-500",
					children: [
						"Already verified?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/login",
							className: "text-[#1D4ED8] hover:underline",
							children: "Sign in"
						})
					]
				})
			]
		})
	] });
}
function ForgotPasswordPage() {
	const navigate = (0, import_dist.useNavigate)();
	const [serverError, setServerError] = (0, import_react.useState)(null);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: u(forgotPasswordSchema),
		defaultValues: { email: "" }
	});
	const onSubmit = async (values) => {
		setServerError(null);
		try {
			const res = await authApi.forgotPassword(values.email);
			y.success(res.message);
			navigate("/reset-password", {
				replace: true,
				state: { email: values.email }
			});
		} catch (err) {
			setServerError(getErrorMessage(err, "Unable to send reset code"));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Forgot password"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "Enter your email and we'll send you a 6-digit code to reset your password."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit(onSubmit),
			className: "mt-6 space-y-4",
			noValidate: true,
			children: [
				serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]",
					children: serverError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					label: "Email",
					type: "email",
					autoComplete: "email",
					placeholder: "you@company.com",
					error: errors.email?.message,
					...register("email")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					loading: isSubmitting,
					className: "w-full",
					children: "Send reset code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-slate-500",
					children: [
						"Remember your password?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/login",
							className: "text-[#1D4ED8] hover:underline",
							children: "Sign in"
						})
					]
				})
			]
		})
	] });
}
function ResetPasswordPage() {
	const navigate = (0, import_dist.useNavigate)();
	const location = (0, import_dist.useLocation)();
	const [email, setEmail] = (0, import_react.useState)(location.state?.email ?? "");
	const [code, setCode] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [passwordConfirm, setPasswordConfirm] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [resending, setResending] = (0, import_react.useState)(false);
	const [serverError, setServerError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (location.state?.email) setEmail(location.state.email);
	}, [location.state?.email]);
	const onSubmit = async () => {
		if (code.length !== 6) {
			setServerError("Please enter the 6-digit reset code.");
			return;
		}
		if (!email.trim()) {
			setServerError("Email address is required.");
			return;
		}
		if (password.length < 8) {
			setServerError("Password must be at least 8 characters.");
			return;
		}
		if (password !== passwordConfirm) {
			setServerError("Passwords do not match.");
			return;
		}
		setServerError(null);
		setSubmitting(true);
		try {
			const res = await authApi.resetPassword({
				email: email.trim(),
				code,
				password,
				password_confirm: passwordConfirm
			});
			y.success(res.message);
			navigate("/login", {
				replace: true,
				state: { email: email.trim() }
			});
		} catch (err) {
			setServerError(getErrorMessage(err, "Unable to reset password"));
		} finally {
			setSubmitting(false);
		}
	};
	const onResend = async () => {
		if (!email.trim()) {
			setServerError("Enter your email address to resend the code.");
			return;
		}
		setServerError(null);
		setResending(true);
		try {
			const res = await authApi.forgotPassword(email.trim());
			y.success(res.message);
		} catch (err) {
			setServerError(getErrorMessage(err, "Unable to resend reset code"));
		} finally {
			setResending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Reset password"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "Enter the code from your email and choose a new password."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4",
			children: [
				serverError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]",
					children: serverError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "reset-email",
					className: "mb-1.5 block text-xs font-medium text-slate-700",
					children: "Email address"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "reset-email",
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@company.com",
					className: "w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-xs font-medium text-slate-700",
					children: "Reset code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTP, {
					maxLength: 6,
					value: code,
					onChange: setCode,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputOTPGroup, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 0 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 1 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 2 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 3 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 4 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputOTPSlot, { index: 5 })
					] })
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					label: "New password",
					type: "password",
					autoComplete: "new-password",
					value: password,
					onChange: (e) => setPassword(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					label: "Confirm new password",
					type: "password",
					autoComplete: "new-password",
					value: passwordConfirm,
					onChange: (e) => setPasswordConfirm(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					loading: submitting,
					className: "w-full",
					onClick: onSubmit,
					children: "Reset password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					loading: resending,
					className: "w-full",
					onClick: onResend,
					children: "Resend code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-slate-500",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/forgot-password",
							className: "text-[#1D4ED8] hover:underline",
							children: "Request a new code"
						}),
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
							to: "/login",
							className: "text-[#1D4ED8] hover:underline",
							children: "Back to sign in"
						})
					]
				})
			]
		})
	] });
}
function cleanParams$2(params) {
	const out = {};
	Object.entries(params).forEach(([k, v]) => {
		if (v !== void 0 && v !== null && v !== "") out[k] = v;
	});
	return out;
}
var leavesApi = {
	async listMine(params = {}) {
		const { data } = await api.get("/leaves/", { params: cleanParams$2(params) });
		return data;
	},
	async get(id) {
		const { data } = await api.get(`/leaves/${id}/`);
		return data;
	},
	async create(payload) {
		const { data } = await api.post("/leaves/", payload);
		return data;
	},
	async update(id, payload) {
		const { data } = await api.patch(`/leaves/${id}/`, payload);
		return data;
	},
	async remove(id) {
		await api.delete(`/leaves/${id}/`);
	},
	async listAll(params = {}) {
		const { data } = await api.get("/admin/leaves/", { params: cleanParams$2(params) });
		return data;
	},
	async getAny(id) {
		const { data } = await api.get(`/admin/leaves/${id}/`);
		return data;
	},
	async approve(id, admin_comment = "") {
		const { data } = await api.patch(`/admin/leaves/${id}/approve/`, { admin_comment });
		return data;
	},
	async reject(id, admin_comment) {
		const { data } = await api.patch(`/admin/leaves/${id}/reject/`, { admin_comment });
		return data;
	}
};
function StatCard({ label, value, hint, icon, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-[#E2E8F0] bg-white p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium uppercase tracking-wider text-slate-500",
					children: label
				}), icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `grid h-8 w-8 place-items-center rounded-md ${{
						neutral: "text-slate-600 bg-slate-100",
						info: "text-[#1D4ED8] bg-[#EFF6FF]",
						success: "text-[#16A34A] bg-[#DCFCE7]",
						warning: "text-[#D97706] bg-[#FEF3C7]",
						danger: "text-[#DC2626] bg-[#FEE2E2]"
					}[tone]}`,
					children: icon
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-2xl font-semibold text-[#0F172A]",
				children: value
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-slate-500",
				children: hint
			})
		]
	});
}
function Card({ children, className = "", title, subtitle, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-lg border border-[#E2E8F0] bg-white ${className}`,
		children: [(title || actions) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold text-[#0F172A]",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-slate-500",
				children: subtitle
			})] }), actions]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-5",
			children
		})]
	});
}
function Table({ columns, data, empty = "No records found.", loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-md border border-[#E2E8F0]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "min-w-full divide-y divide-[#E2E8F0] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-slate-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: `px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${c.className || ""}`,
					style: { width: c.width },
					children: c.header
				}, c.key)) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "divide-y divide-[#E2E8F0] bg-white",
				children: loading ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-3/4 animate-pulse rounded bg-slate-100" })
				}, c.key)) }, i)) : data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: columns.length,
					className: "px-4 py-10 text-center text-sm text-slate-500",
					children: empty
				}) }) : data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "hover:bg-slate-50/60",
					children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: `px-4 py-2.5 text-slate-700 ${c.className || ""}`,
						children: c.render ? c.render(row) : row[c.key]
					}, c.key))
				}, row.id))
			})]
		})
	});
}
var map = {
	Pending: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
	Approved: "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]",
	Rejected: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`,
		children: status
	});
}
function Badge({ children, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${{
			neutral: "bg-slate-100 text-slate-700 border-slate-200",
			info: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
			success: "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]",
			warning: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
			danger: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
		}[tone]}`,
		children
	});
}
function EmployeeDashboard() {
	const { user } = useAuth();
	const [leaves, setLeaves] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		leavesApi.listMine({ ordering: "-created_at" }).then((r) => {
			if (!active) return;
			setLeaves(r.results);
		}).catch((err) => y.error(getErrorMessage(err, "Failed to load leaves"))).finally(() => active && setLoading(false));
		return () => {
			active = false;
		};
	}, []);
	const stats = (0, import_react.useMemo)(() => {
		return {
			total: leaves.length,
			pending: leaves.filter((l) => l.status === "Pending").length,
			approved: leaves.filter((l) => l.status === "Approved").length,
			rejected: leaves.filter((l) => l.status === "Rejected").length
		};
	}, [leaves]);
	const chartData = [
		{
			name: "Approved",
			value: stats.approved,
			color: "#16A34A"
		},
		{
			name: "Pending",
			value: stats.pending,
			color: "#D97706"
		},
		{
			name: "Rejected",
			value: stats.rejected,
			color: "#DC2626"
		}
	].filter((d) => d.value > 0);
	const recent = leaves.slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-xl font-semibold tracking-tight text-[#0F172A]",
					children: ["Welcome back, ", user?.first_name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-slate-500",
					children: "Overview of your leave requests and balances."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
					to: "/employee/apply-leave",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "+ Apply for leave" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total requests",
						value: stats.total,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" }),
						tone: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending",
						value: stats.pending,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-4 w-4" }),
						tone: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Approved",
						value: stats.approved,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-4 w-4" }),
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Rejected",
						value: stats.rejected,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarX, { className: "h-4 w-4" }),
						tone: "danger"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Recent leave requests",
						subtitle: "Your last five submissions",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
							loading,
							empty: "You haven't submitted any leave requests yet.",
							data: recent,
							columns: [
								{
									key: "type",
									header: "Type",
									render: (r) => r.leave_type
								},
								{
									key: "range",
									header: "Date range",
									render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`
								},
								{
									key: "days",
									header: "Days",
									render: (r) => r.number_of_days
								},
								{
									key: "status",
									header: "Status",
									render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
								},
								{
									key: "submitted",
									header: "Submitted",
									render: (r) => formatDate(r.created_at)
								}
							]
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Status summary",
					children: chartData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-10 text-center text-xs text-slate-500",
						children: "No data to display."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: chartData,
								dataKey: "value",
								innerRadius: 50,
								outerRadius: 80,
								paddingAngle: 2,
								children: chartData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: d.color }, d.name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								iconType: "circle",
								wrapperStyle: { fontSize: 12 }
							})
						] }) })
					})
				})]
			})
		]
	});
}
var leaveSchema = objectType({
	leave_type: enumType(LEAVE_TYPES),
	start_date: stringType().min(1, "Start date is required"),
	end_date: stringType().min(1, "End date is required"),
	reason: stringType().trim().min(10, "Provide a brief reason (10+ chars)").max(500)
}).refine((v) => new Date(v.end_date) >= new Date(v.start_date), {
	path: ["end_date"],
	message: "End date must be on or after start date"
}).refine((v) => {
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	return new Date(v.start_date) >= today;
}, {
	path: ["start_date"],
	message: "Start date cannot be in the past"
});
function ApplyLeavePage() {
	const navigate = (0, import_dist.useNavigate)();
	const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
		resolver: u(leaveSchema),
		defaultValues: {
			leave_type: "Annual Leave",
			start_date: "",
			end_date: "",
			reason: ""
		}
	});
	const start = watch("start_date");
	const end = watch("end_date");
	const days = start && end ? daysBetween(start, end) : 0;
	const onSubmit = async (values) => {
		try {
			await leavesApi.create(values);
			y.success("Leave request submitted");
			reset();
			navigate("/employee/history");
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to submit leave request"));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Apply for leave"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "Submit a new leave request for HR approval."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit(onSubmit),
			className: "space-y-5",
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					label: "Leave type",
					options: LEAVE_TYPES.map((t) => ({
						value: t,
						label: t
					})),
					error: errors.leave_type?.message,
					...register("leave_type")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Start date",
						type: "date",
						error: errors.start_date?.message,
						...register("start_date")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "End date",
						type: "date",
						error: errors.end_date?.message,
						...register("end_date")
					})]
				}),
				days > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs text-[#1D4ED8]",
					children: [
						"You are requesting ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: days }),
						" day",
						days === 1 ? "" : "s",
						" of leave."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1.5 block text-xs font-medium text-slate-700",
						children: "Reason"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						...register("reason"),
						rows: 4,
						placeholder: "Briefly describe the reason for your leave",
						className: `block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${errors.reason ? "border-[#DC2626]" : "border-[#E2E8F0] focus:border-[#2563EB]"}`
					}),
					errors.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-[#DC2626]",
						children: errors.reason.message
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 border-t border-[#E2E8F0] pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => reset(),
						disabled: isSubmitting,
						children: "Reset"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						loading: isSubmitting,
						children: "Submit request"
					})]
				})
			]
		}) })]
	});
}
function Pagination({ page, pageSize, total, onPageChange }) {
	const pages = Math.max(1, Math.ceil(total / pageSize));
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3 text-xs text-slate-600",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			"Showing ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "text-[#0F172A]",
				children: from
			}),
			"–",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "text-[#0F172A]",
				children: to
			}),
			" of",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "text-[#0F172A]",
				children: total
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 disabled:opacity-50",
					onClick: () => onPageChange(page - 1),
					disabled: page <= 1,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" }), " Prev"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "px-2",
					children: [
						"Page ",
						page,
						" of ",
						pages
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 disabled:opacity-50",
					onClick: () => onPageChange(page + 1),
					disabled: page >= pages,
					children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
				})
			]
		})]
	});
}
function Modal({ open, onClose, title, children, footer, size = "md" }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-slate-900/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			className: `relative w-full ${{
				sm: "max-w-sm",
				md: "max-w-lg",
				lg: "max-w-2xl"
			}[size]} rounded-lg border border-[#E2E8F0] bg-white shadow-lg`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between border-b border-[#E2E8F0] px-5 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold text-[#0F172A]",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "rounded-md p-1 text-slate-500 hover:bg-slate-100",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 py-4 text-sm text-slate-700",
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-end gap-2 border-t border-[#E2E8F0] bg-slate-50 px-5 py-3",
					children: footer
				})
			]
		})]
	});
}
function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "primary", onConfirm, onClose, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		onClose,
		title,
		size: "sm",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			onClick: onClose,
			disabled: loading,
			children: cancelLabel
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: tone,
			onClick: onConfirm,
			loading,
			children: confirmLabel
		})] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message })
	});
}
var PAGE_SIZE$3 = 20;
function LeaveHistoryPage() {
	const [leaves, setLeaves] = (0, import_react.useState)([]);
	const [count, setCount] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const load = async () => {
		setLoading(true);
		try {
			const data = await leavesApi.listMine({
				page,
				status: status || void 0,
				search: q || void 0,
				ordering: "-created_at"
			});
			setLeaves(data.results);
			setCount(data.count);
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to load leaves"));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [page, status]);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => {
			setPage(1);
			load();
		}, 300);
		return () => clearTimeout(t);
	}, [q]);
	const confirmDelete = async () => {
		if (!deleting) return;
		setSubmitting(true);
		try {
			await leavesApi.remove(deleting.id);
			y.success("Leave request deleted");
			setDeleting(null);
			load();
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to delete"));
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight text-[#0F172A]",
				children: "Leave history"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-slate-500",
				children: "All leave requests you've submitted."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search by type or reason",
						className: "block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: status,
						onChange: (e) => {
							setStatus(e.target.value);
							setPage(1);
						},
						options: [
							{
								value: "",
								label: "All statuses"
							},
							{
								value: "Pending",
								label: "Pending"
							},
							{
								value: "Approved",
								label: "Approved"
							},
							{
								value: "Rejected",
								label: "Rejected"
							}
						]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
					loading,
					data: leaves,
					empty: "No leave requests found.",
					columns: [
						{
							key: "type",
							header: "Leave type",
							render: (r) => r.leave_type
						},
						{
							key: "range",
							header: "Date range",
							render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`
						},
						{
							key: "days",
							header: "Days",
							render: (r) => r.number_of_days
						},
						{
							key: "status",
							header: "Status",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
						},
						{
							key: "comment",
							header: "Admin comment",
							render: (r) => r.status !== "Pending" && r.admin_comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "max-w-xs text-sm text-slate-600",
								children: r.admin_comment
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-slate-400",
								children: "—"
							})
						},
						{
							key: "submitted",
							header: "Submitted",
							render: (r) => formatDate(r.created_at)
						},
						{
							key: "actions",
							header: "",
							render: (r) => r.status === "Pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setDeleting(r),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 text-[#DC2626]" })
							}) : null
						}
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize: PAGE_SIZE$3,
					total: count,
					onPageChange: setPage
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!deleting,
				title: "Delete leave request",
				message: `Delete your ${deleting?.leave_type} request from ${deleting ? formatDate(deleting.start_date) : ""}?`,
				confirmLabel: "Delete",
				tone: "danger",
				onConfirm: confirmDelete,
				onClose: () => setDeleting(null),
				loading: submitting
			})
		]
	});
}
function ProfilePage() {
	const { user, updateProfile } = useAuth();
	const { register, handleSubmit, formState: { isSubmitting, isDirty }, reset } = useForm({ defaultValues: {
		first_name: "",
		last_name: "",
		phone_number: "",
		department: ""
	} });
	(0, import_react.useEffect)(() => {
		if (!user) return;
		reset({
			first_name: user.first_name,
			last_name: user.last_name,
			phone_number: user.phone_number,
			department: user.department
		});
	}, [user, reset]);
	if (!user) return null;
	const onSubmit = async (values) => {
		try {
			await updateProfile(values);
			reset(values);
			y.success("Profile updated");
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to update profile"));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "My profile"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "View and update your account information."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "lg:col-span-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-16 w-16 place-items-center rounded-full bg-[#EFF6FF] text-lg font-semibold text-[#1D4ED8]",
							children: initialsFor(user.first_name, user.last_name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-3 text-sm font-semibold text-[#0F172A]",
							children: user.full_name || `${user.first_name} ${user.last_name}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-500",
							children: user.role === "ADMIN" ? "Administrator" : "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 w-full space-y-2 border-t border-[#E2E8F0] pt-4 text-left text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-500",
										children: "Employee ID"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#0F172A]",
										children: user.employee_id
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-500",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#0F172A]",
										children: user.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-500",
										children: "Department"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#0F172A]",
										children: user.department
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-500",
										children: "Joined"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#0F172A]",
										children: formatDate(user.date_joined)
									})]
								})
							]
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "lg:col-span-2",
				title: "Account information",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit(onSubmit),
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "First name",
								...register("first_name", { required: true })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Last name",
								...register("last_name", { required: true })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Email",
							type: "email",
							value: user.email,
							disabled: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Phone number",
								...register("phone_number")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Department",
								options: DEPARTMENTS.map((d) => ({
									value: d,
									label: d
								})),
								...register("department")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end gap-2 border-t border-[#E2E8F0] pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								loading: isSubmitting,
								disabled: !isDirty,
								children: "Save changes"
							})
						})
					]
				})
			})]
		})]
	});
}
var dashboardApi = { async stats() {
	const { data } = await api.get("/admin/dashboard/");
	return data;
} };
function AdminDashboard() {
	const [stats, setStats] = (0, import_react.useState)(null);
	const [recent, setRecent] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		Promise.all([dashboardApi.stats(), leavesApi.listAll({ ordering: "-created_at" })]).then(([s, l]) => {
			setStats(s);
			setRecent(l.results.slice(0, 6));
		}).catch((err) => y.error(getErrorMessage(err, "Failed to load dashboard"))).finally(() => setLoading(false));
	}, []);
	const byType = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		recent.forEach((l) => map.set(l.leave_type, (map.get(l.leave_type) || 0) + 1));
		return Array.from(map.entries()).map(([name, value]) => ({
			name,
			value
		}));
	}, [recent]);
	const statusChart = stats ? [
		{
			name: "Approved",
			value: stats.approved_requests,
			color: "#16A34A"
		},
		{
			name: "Pending",
			value: stats.pending_requests,
			color: "#D97706"
		},
		{
			name: "Rejected",
			value: stats.rejected_requests,
			color: "#DC2626"
		}
	].filter((d) => d.value > 0) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight text-[#0F172A]",
				children: "HR Dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-slate-500",
				children: "Organization-wide leave overview."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Employees",
						value: stats?.total_employees ?? 0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }),
						tone: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total requests",
						value: stats?.total_requests ?? 0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Pending",
						value: stats?.pending_requests ?? 0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "h-4 w-4" }),
						tone: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Approved",
						value: stats?.approved_requests ?? 0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-4 w-4" }),
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Rejected",
						value: stats?.rejected_requests ?? 0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarX, { className: "h-4 w-4" }),
						tone: "danger"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "lg:col-span-2",
					title: "Requests by leave type",
					subtitle: "From most recent activity",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: byType,
							margin: {
								top: 8,
								right: 8,
								bottom: 0,
								left: -20
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "#E2E8F0",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: {
										fontSize: 12,
										fill: "#64748B"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fontSize: 12,
										fill: "#64748B"
									},
									axisLine: false,
									tickLine: false,
									allowDecimals: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { cursor: { fill: "#F1F5F9" } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "value",
									fill: "#2563EB",
									radius: [
										4,
										4,
										0,
										0
									]
								})
							]
						}) })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					title: "Status distribution",
					children: statusChart.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-10 text-center text-xs text-slate-500",
						children: "No data yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: statusChart,
								dataKey: "value",
								innerRadius: 45,
								outerRadius: 75,
								children: statusChart.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: d.color }, d.name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
								iconType: "circle",
								wrapperStyle: { fontSize: 12 }
							})
						] }) })
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				title: "Recent leave activity",
				subtitle: "Latest requests across all employees",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
					loading,
					data: recent,
					empty: "No recent activity.",
					columns: [
						{
							key: "employee",
							header: "Employee",
							render: (r) => r.employee.full_name || `${r.employee.first_name} ${r.employee.last_name}`
						},
						{
							key: "department",
							header: "Department",
							render: (r) => r.employee.department
						},
						{
							key: "type",
							header: "Type",
							render: (r) => r.leave_type
						},
						{
							key: "range",
							header: "Date range",
							render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`
						},
						{
							key: "status",
							header: "Status",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
						}
					]
				})
			})
		]
	});
}
var PAGE_SIZE$2 = 20;
function AdminLeavesPage() {
	const [leaves, setLeaves] = (0, import_react.useState)([]);
	const [count, setCount] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const [acting, setActing] = (0, import_react.useState)({
		row: null,
		action: null
	});
	const [note, setNote] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const load = async () => {
		setLoading(true);
		try {
			const data = await leavesApi.listAll({
				page,
				status: status || void 0,
				search: q || void 0,
				ordering: "-created_at"
			});
			setLeaves(data.results);
			setCount(data.count);
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to load leaves"));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [page, status]);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => {
			setPage(1);
			load();
		}, 300);
		return () => clearTimeout(t);
	}, [q]);
	const submitDecision = async () => {
		if (!acting.row || !acting.action) return;
		if (acting.action === "reject" && !note.trim()) {
			y.error("A comment is required to reject a request.");
			return;
		}
		setSubmitting(true);
		try {
			if (acting.action === "approve") await leavesApi.approve(acting.row.id, note.trim());
			else await leavesApi.reject(acting.row.id, note.trim());
			y.success(`Leave ${acting.action === "approve" ? "approved" : "rejected"}`);
			setActing({
				row: null,
				action: null
			});
			setNote("");
			load();
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to update leave"));
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight text-[#0F172A]",
				children: "Leave requests"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-slate-500",
				children: "Review and act on team leave requests."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search by employee email or ID",
						className: "block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: status,
						onChange: (e) => {
							setStatus(e.target.value);
							setPage(1);
						},
						options: [
							{
								value: "",
								label: "All statuses"
							},
							{
								value: "Pending",
								label: "Pending"
							},
							{
								value: "Approved",
								label: "Approved"
							},
							{
								value: "Rejected",
								label: "Rejected"
							}
						]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
					loading,
					data: leaves,
					empty: "No leave requests match your filters.",
					columns: [
						{
							key: "employee",
							header: "Employee",
							render: (r) => r.employee.full_name || `${r.employee.first_name} ${r.employee.last_name}`
						},
						{
							key: "department",
							header: "Department",
							render: (r) => r.employee.department
						},
						{
							key: "type",
							header: "Type",
							render: (r) => r.leave_type
						},
						{
							key: "range",
							header: "Date range",
							render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`
						},
						{
							key: "status",
							header: "Status",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })
						},
						{
							key: "actions",
							header: "Actions",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setViewing(r),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " View"]
								}), r.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "success",
									onClick: () => setActing({
										row: r,
										action: "approve"
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), " Approve"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "danger",
									onClick: () => setActing({
										row: r,
										action: "reject"
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Reject"]
								})] })]
							})
						}
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize: PAGE_SIZE$2,
					total: count,
					onPageChange: setPage
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: !!viewing,
				onClose: () => setViewing(null),
				title: "Leave request details",
				children: viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-x-4 gap-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-medium text-[#0F172A]",
							children: viewing.employee.full_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Employee ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: viewing.employee.employee_id }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Department"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: viewing.employee.department }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: viewing.leave_type }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Date range"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
							formatDate(viewing.start_date),
							" – ",
							formatDate(viewing.end_date),
							" (",
							viewing.number_of_days,
							" days)"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: viewing.status }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-slate-500",
							children: "Submitted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatDateTime(viewing.created_at) }),
						viewing.approved_by && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-slate-500",
								children: "Decided by"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: viewing.approved_by.full_name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-slate-500",
								children: "Decided at"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: formatDateTime(viewing.approved_at) })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "col-span-2 mt-2 text-slate-500",
							children: "Reason"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "col-span-2 rounded-md border border-[#E2E8F0] bg-slate-50 p-3 text-slate-700",
							children: viewing.reason
						}),
						viewing.admin_comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "col-span-2 mt-2 text-slate-500",
							children: "Admin comment"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "col-span-2 rounded-md border border-[#E2E8F0] bg-slate-50 p-3 text-slate-700",
							children: viewing.admin_comment
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: !!acting.action,
				onClose: () => {
					setActing({
						row: null,
						action: null
					});
					setNote("");
				},
				title: acting.action === "approve" ? "Approve leave request" : "Reject leave request",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => {
						setActing({
							row: null,
							action: null
						});
						setNote("");
					},
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: acting.action === "approve" ? "success" : "danger",
					onClick: submitDecision,
					loading: submitting,
					children: acting.action === "approve" ? "Approve request" : "Reject request"
				})] }),
				children: acting.row && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"You are about to ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: acting.action === "approve" ? "approve" : "reject" }),
						" the",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: acting.row.leave_type }),
						" request for",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: acting.row.employee.full_name }),
						"."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mb-1.5 block text-xs font-medium text-slate-700",
						children: ["Admin comment ", acting.action === "reject" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#DC2626]",
							children: "(required)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						rows: 3,
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: acting.action === "reject" ? "Reason for rejection" : "Optional comment",
						className: "block w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
					})] })]
				})
			})
		]
	});
}
function cleanParams$1(params) {
	const out = {};
	Object.entries(params).forEach(([k, v]) => {
		if (v !== void 0 && v !== null && v !== "") out[k] = v;
	});
	return out;
}
var employeesApi = {
	async list(params = {}) {
		const { data } = await api.get("/admin/employees/", { params: cleanParams$1(params) });
		return data;
	},
	async get(id) {
		const { data } = await api.get(`/admin/employees/${id}/`);
		return data;
	},
	async create(payload) {
		const { data } = await api.post("/admin/employees/", payload);
		return data;
	},
	async update(id, payload) {
		const { data } = await api.patch(`/admin/employees/${id}/`, payload);
		return data;
	},
	async deactivate(id) {
		await api.delete(`/admin/employees/${id}/`);
	}
};
var employeeCreateSchema = objectType({
	first_name: stringType().trim().min(2, "First name required"),
	last_name: stringType().trim().min(2, "Last name required"),
	email: stringType().trim().email("Enter a valid email"),
	phone_number: stringType().trim().min(7, "Enter a valid phone"),
	department: stringType().trim().min(1, "Department required"),
	employee_id: stringType().trim().min(1, "Employee ID required"),
	role: enumType(["EMPLOYEE", "ADMIN"]),
	is_active: booleanType().optional(),
	password: stringType().min(8, "Password must be at least 8 characters")
});
var employeeUpdateSchema = objectType({
	first_name: stringType().trim().min(2, "First name required"),
	last_name: stringType().trim().min(2, "Last name required"),
	phone_number: stringType().trim().min(7, "Enter a valid phone"),
	department: stringType().trim().min(1, "Department required"),
	role: enumType(["EMPLOYEE", "ADMIN"]),
	is_active: booleanType().optional(),
	password: stringType().min(8, "Min 8 characters").optional().or(literalType(""))
});
var PAGE_SIZE$1 = 20;
function AdminEmployeesPage() {
	const [employees, setEmployees] = (0, import_react.useState)([]);
	const [count, setCount] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const load = async () => {
		setLoading(true);
		try {
			const data = await employeesApi.list({
				page,
				role: roleFilter || void 0,
				search: q || void 0,
				ordering: "-date_joined"
			});
			setEmployees(data.results);
			setCount(data.count);
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to load employees"));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [page, roleFilter]);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => {
			setPage(1);
			load();
		}, 300);
		return () => clearTimeout(t);
	}, [q]);
	const createForm = useForm({ resolver: u(employeeCreateSchema) });
	const editForm = useForm({ resolver: u(employeeUpdateSchema) });
	const openCreate = () => {
		setEditing(null);
		setCreating(true);
		createForm.reset({
			first_name: "",
			last_name: "",
			email: "",
			phone_number: "",
			department: DEPARTMENTS[0],
			employee_id: "",
			role: "EMPLOYEE",
			is_active: true,
			password: ""
		});
	};
	const openEdit = (emp) => {
		setEditing(emp);
		setCreating(false);
		editForm.reset({
			first_name: emp.first_name,
			last_name: emp.last_name,
			phone_number: emp.phone_number,
			department: emp.department,
			role: emp.role,
			is_active: emp.is_active ?? true,
			password: ""
		});
	};
	const onCreate = async (values) => {
		setSubmitting(true);
		try {
			await employeesApi.create(values);
			y.success("Employee created");
			setCreating(false);
			load();
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to create employee"));
		} finally {
			setSubmitting(false);
		}
	};
	const onEdit = async (values) => {
		if (!editing) return;
		setSubmitting(true);
		try {
			const payload = { ...values };
			if (!values.password) delete payload.password;
			await employeesApi.update(editing.id, payload);
			y.success("Employee updated");
			setEditing(null);
			load();
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to update employee"));
		} finally {
			setSubmitting(false);
		}
	};
	const confirmDelete = async () => {
		if (!deleting) return;
		setSubmitting(true);
		try {
			await employeesApi.deactivate(deleting.id);
			y.success("Employee deactivated");
			setDeleting(null);
			load();
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to deactivate"));
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-[#0F172A]",
					children: "Employees"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-slate-500",
					children: "Manage employee accounts and access."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: openCreate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add employee"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search by name, email, ID or department",
						className: "block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: roleFilter,
						onChange: (e) => {
							setRoleFilter(e.target.value);
							setPage(1);
						},
						options: [
							{
								value: "",
								label: "All roles"
							},
							{
								value: "EMPLOYEE",
								label: "Employee"
							},
							{
								value: "ADMIN",
								label: "Administrator"
							}
						]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
					loading,
					data: employees,
					empty: "No employees found.",
					columns: [
						{
							key: "name",
							header: "Name",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium text-[#0F172A]",
								children: r.full_name || `${r.first_name} ${r.last_name}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-slate-500",
								children: r.email
							})] })
						},
						{
							key: "employee_id",
							header: "Employee ID"
						},
						{
							key: "department",
							header: "Department"
						},
						{
							key: "phone",
							header: "Phone",
							render: (r) => r.phone_number
						},
						{
							key: "role",
							header: "Role",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: r.role === "ADMIN" ? "info" : "neutral",
								children: r.role
							})
						},
						{
							key: "is_active",
							header: "Status",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: r.is_active === false ? "danger" : "success",
								children: r.is_active === false ? "Inactive" : "Active"
							})
						},
						{
							key: "date_joined",
							header: "Joined",
							render: (r) => formatDate(r.date_joined)
						},
						{
							key: "actions",
							header: "Actions",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => openEdit(r),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setDeleting(r),
									disabled: r.is_active === false,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5 text-[#DC2626]" })
								})]
							})
						}
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
					page,
					pageSize: PAGE_SIZE$1,
					total: count,
					onPageChange: setPage
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: creating,
				onClose: () => setCreating(false),
				title: "Add employee",
				size: "lg",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setCreating(false),
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: createForm.handleSubmit(onCreate),
					loading: submitting,
					children: "Create employee"
				})] }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-4",
					onSubmit: createForm.handleSubmit(onCreate),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "First name",
								error: createForm.formState.errors.first_name?.message,
								...createForm.register("first_name")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Last name",
								error: createForm.formState.errors.last_name?.message,
								...createForm.register("last_name")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Email",
								type: "email",
								error: createForm.formState.errors.email?.message,
								...createForm.register("email")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Employee ID",
								error: createForm.formState.errors.employee_id?.message,
								...createForm.register("employee_id")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Phone number",
								error: createForm.formState.errors.phone_number?.message,
								...createForm.register("phone_number")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Department",
								options: DEPARTMENTS.map((d) => ({
									value: d,
									label: d
								})),
								error: createForm.formState.errors.department?.message,
								...createForm.register("department")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Role",
								options: [{
									value: "EMPLOYEE",
									label: "Employee"
								}, {
									value: "ADMIN",
									label: "Administrator"
								}],
								error: createForm.formState.errors.role?.message,
								...createForm.register("role")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Password",
								type: "password",
								error: createForm.formState.errors.password?.message,
								...createForm.register("password")
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: !!editing,
				onClose: () => setEditing(null),
				title: `Edit ${editing?.full_name || ""}`,
				size: "lg",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setEditing(null),
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: editForm.handleSubmit(onEdit),
					loading: submitting,
					children: "Save changes"
				})] }),
				children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-4",
					onSubmit: editForm.handleSubmit(onEdit),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "First name",
								error: editForm.formState.errors.first_name?.message,
								...editForm.register("first_name")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Last name",
								error: editForm.formState.errors.last_name?.message,
								...editForm.register("last_name")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Email",
							value: editing.email,
							disabled: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Phone number",
								error: editForm.formState.errors.phone_number?.message,
								...editForm.register("phone_number")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Department",
								options: DEPARTMENTS.map((d) => ({
									value: d,
									label: d
								})),
								error: editForm.formState.errors.department?.message,
								...editForm.register("department")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Role",
								options: [{
									value: "EMPLOYEE",
									label: "Employee"
								}, {
									value: "ADMIN",
									label: "Administrator"
								}],
								error: editForm.formState.errors.role?.message,
								...editForm.register("role")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "New password (optional)",
								type: "password",
								error: editForm.formState.errors.password?.message,
								...editForm.register("password")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex items-center gap-2 text-xs text-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "h-3.5 w-3.5 rounded border-slate-300",
								...editForm.register("is_active")
							}), "Active"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: !!deleting,
				title: "Deactivate employee",
				message: `Deactivate ${deleting?.full_name || ""}? Their account will be set inactive (soft delete).`,
				confirmLabel: "Deactivate",
				tone: "danger",
				onConfirm: confirmDelete,
				onClose: () => setDeleting(null),
				loading: submitting
			})
		]
	});
}
function cleanParams(params) {
	const out = {};
	Object.entries(params).forEach(([k, v]) => {
		if (v !== void 0 && v !== null && v !== "") out[k] = v;
	});
	return out;
}
var auditLogsApi = { async list(params = {}) {
	const { data } = await api.get("/admin/audit-logs/", { params: cleanParams(params) });
	return data;
} };
var PAGE_SIZE = 20;
var ACTION_OPTIONS = [
	"Leave approved",
	"Leave rejected",
	"Employee created",
	"Employee updated"
];
function AdminAuditLogsPage() {
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [count, setCount] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [action, setAction] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const load = async () => {
		setLoading(true);
		try {
			const data = await auditLogsApi.list({
				page,
				action: action || void 0,
				search: q || void 0,
				ordering: "-created_at"
			});
			setLogs(data.results);
			setCount(data.count);
		} catch (err) {
			y.error(getErrorMessage(err, "Failed to load audit logs"));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [page, action]);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => {
			setPage(1);
			load();
		}, 300);
		return () => clearTimeout(t);
	}, [q]);
	const toneFor = (a) => {
		if (a.toLowerCase().includes("approv") || a.toLowerCase().includes("created")) return "success";
		if (a.toLowerCase().includes("reject")) return "danger";
		if (a.toLowerCase().includes("updated")) return "info";
		return "neutral";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-semibold tracking-tight text-[#0F172A]",
			children: "Audit logs"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: "A history of administrative actions."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 min-w-[220px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search description or action",
					className: "block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					value: action,
					onChange: (e) => {
						setAction(e.target.value);
						setPage(1);
					},
					options: [{
						value: "",
						label: "All actions"
					}, ...ACTION_OPTIONS.map((a) => ({
						value: a,
						label: a
					}))]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				loading,
				data: logs,
				empty: "No audit log entries.",
				columns: [
					{
						key: "action",
						header: "Action",
						render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: toneFor(r.action),
							children: r.action
						})
					},
					{
						key: "admin",
						header: "Administrator",
						render: (r) => r.admin?.full_name || "—"
					},
					{
						key: "timestamp",
						header: "Timestamp",
						render: (r) => formatDateTime(r.created_at)
					},
					{
						key: "description",
						header: "Description"
					}
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
				page,
				pageSize: PAGE_SIZE,
				total: count,
				onPageChange: setPage
			})]
		})] })]
	});
}
function NotFoundPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-wider text-[#2563EB]",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-2xl font-semibold text-[#0F172A]",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-slate-500",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Link, {
					to: "/",
					className: "mt-6 inline-block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Go to dashboard" })
				})
			]
		})
	});
}
function RoleRedirect() {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Navigate, {
		to: "/login",
		replace: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Navigate, {
		to: user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard",
		replace: true
	});
}
function App() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.BrowserRouter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.Routes, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.Route, {
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
					path: "/login",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
					path: "/register",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegisterPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
					path: "/verify-email",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifyEmailPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
					path: "/forgot-password",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgotPasswordPage, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
					path: "/reset-password",
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordPage, {})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, {}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.Route, {
				element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.Route, {
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleRoute, { role: "EMPLOYEE" }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/employee/dashboard",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeDashboard, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/employee/apply-leave",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyLeavePage, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/employee/history",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveHistoryPage, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/employee/profile",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfilePage, {})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_dist.Route, {
					element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleRoute, { role: "ADMIN" }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/admin/dashboard",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboard, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/admin/leaves",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLeavesPage, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/admin/employees",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmployeesPage, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/admin/audit-logs",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAuditLogsPage, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
							path: "/admin/profile",
							element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfilePage, {})
						})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
			path: "/",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleRedirect, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dist.Route, {
			path: "*",
			element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFoundPage, {})
		})
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(xo, {
		position: "top-right",
		autoClose: 3e3,
		newestOnTop: true
	})] }) });
}
//#endregion
export { App as default };
