import { useEffect, useMemo, useState } from "react";
import { Users, ClipboardList, CalendarCheck, CalendarClock, CalendarX } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { leavesApi } from "../../api/leaves";
import { dashboardApi } from "../../api/dashboard";
import type { DashboardStats, LeaveRequest } from "../../api/types";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { StatusBadge } from "../../components/Badge";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../api/client";
import { toast } from "react-toastify";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.stats(), leavesApi.listAll({ ordering: "-created_at" })])
      .then(([s, l]) => {
        setStats(s);
        setRecent(l.results.slice(0, 6));
      })
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load dashboard")))
      .finally(() => setLoading(false));
  }, []);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    recent.forEach((l) => map.set(l.leave_type, (map.get(l.leave_type) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [recent]);

  const statusChart = stats
    ? [
        { name: "Approved", value: stats.approved_requests, color: "#16A34A" },
        { name: "Pending", value: stats.pending_requests, color: "#D97706" },
        { name: "Rejected", value: stats.rejected_requests, color: "#DC2626" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">HR Dashboard</h1>
      
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Employees" value={stats?.total_employees ?? 0} icon={<Users className="h-4 w-4" />} tone="info" />
        <StatCard label="Total requests" value={stats?.total_requests ?? 0} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Pending" value={stats?.pending_requests ?? 0} icon={<CalendarClock className="h-4 w-4" />} tone="warning" />
        <StatCard label="Approved" value={stats?.approved_requests ?? 0} icon={<CalendarCheck className="h-4 w-4" />} tone="success" />
        <StatCard label="Rejected" value={stats?.rejected_requests ?? 0} icon={<CalendarX className="h-4 w-4" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Requests by leave type" subtitle="From most recent activity">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byType} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#F1F5F9" }} />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Status distribution">
          {statusChart.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">No data yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" innerRadius={45} outerRadius={75}>
                    {statusChart.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent leave activity" subtitle="Latest requests across all employees">
        <Table
          loading={loading}
          data={recent}
          empty="No recent activity."
          columns={[
            { key: "employee", header: "Employee", render: (r) => r.employee.full_name || `${r.employee.first_name} ${r.employee.last_name}` },
            { key: "department", header: "Department", render: (r) => r.employee.department },
            { key: "type", header: "Type", render: (r) => r.leave_type },
            { key: "range", header: "Date range", render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}` },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </Card>
    </div>
  );
}
