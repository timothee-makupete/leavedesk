import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { auditLogsApi } from "../../api/auditLogs";
import type { AuditLog } from "../../api/types";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Pagination } from "../../components/Pagination";
import { Select } from "../../components/Select";
import { Badge } from "../../components/Badge";
import { formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

const PAGE_SIZE = 20;
const ACTION_OPTIONS = [
  "Leave approved",
  "Leave rejected",
  "Employee created",
  "Employee updated",
];

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const data = await auditLogsApi.list({
        page,
        action: action || undefined,
        search: q || undefined,
        ordering: "-created_at",
      });
      setLogs(data.results);
      setCount(data.count);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load audit logs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, action]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const toneFor = (a: string) => {
    if (a.toLowerCase().includes("approv") || a.toLowerCase().includes("created")) return "success" as const;
    if (a.toLowerCase().includes("reject")) return "danger" as const;
    if (a.toLowerCase().includes("updated")) return "info" as const;
    return "neutral" as const;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">Audit logs</h1>
        <p className="text-sm text-slate-500">A history of administrative actions.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search description or action"
              className="block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All actions" },
                ...ACTION_OPTIONS.map((a) => ({ value: a, label: a })),
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table
            loading={loading}
            data={logs}
            empty="No audit log entries."
            columns={[
              { key: "action", header: "Action", render: (r) => <Badge tone={toneFor(r.action)}>{r.action}</Badge> },
              { key: "admin", header: "Administrator", render: (r) => r.admin?.full_name || "—" },
              { key: "timestamp", header: "Timestamp", render: (r) => formatDateTime(r.created_at) },
              { key: "description", header: "Description", className: "break-words max-w-md" },
            ]}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={count} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
