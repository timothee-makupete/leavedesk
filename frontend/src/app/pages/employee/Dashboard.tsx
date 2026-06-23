import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarClock, CalendarX, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { leavesApi } from "../../api/leaves";
import type { LeaveRequest } from "../../api/types";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { StatusBadge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../api/client";
import { toast } from "react-toastify";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    leavesApi
      .listMine({ ordering: "-created_at" })
      .then((r) => {
        if (!active) return;
        setLeaves(r.results);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load leaves")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length,
    };
  }, [leaves]);

  const chartData = [
    { name: "Approved", value: stats.approved, color: "#16A34A" },
    { name: "Pending", value: stats.pending, color: "#D97706" },
    { name: "Rejected", value: stats.rejected, color: "#DC2626" },
  ].filter((d) => d.value > 0);

  const recent = leaves.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">
            Welcome back, {user?.first_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your leave requests and balances.
          </p>
        </div>
        <Link to="/employee/apply-leave" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">+ Apply for leave</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={stats.total} icon={<Calendar className="h-4 w-4" />} tone="info" />
        <StatCard label="Pending" value={stats.pending} icon={<CalendarClock className="h-4 w-4" />} tone="warning" />
        <StatCard label="Approved" value={stats.approved} icon={<CalendarCheck className="h-4 w-4" />} tone="success" />
        <StatCard label="Rejected" value={stats.rejected} icon={<CalendarX className="h-4 w-4" />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Recent leave requests" subtitle="Your last five submissions">
            <Table
              loading={loading}
              empty="You haven't submitted any leave requests yet."
              data={recent}
              columns={[
                { key: "type", header: "Type", render: (r) => r.leave_type },
                {
                  key: "range",
                  header: "Date range",
                  render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`,
                },
                { key: "days", header: "Days", render: (r) => r.number_of_days },
                { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                { key: "submitted", header: "Submitted", render: (r) => formatDate(r.created_at) },
              ]}
            />
          </Card>
        </div>
        <Card title="Status summary">
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">No data to display.</p>
          ) : (
            <div className="h-56 sm:h-60">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
