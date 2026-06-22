import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { leavesApi } from "../../api/leaves";
import type { LeaveRequest, LeaveStatus } from "../../api/types";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { StatusBadge } from "../../components/Badge";
import { Pagination } from "../../components/Pagination";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

const PAGE_SIZE = 20;

export function LeaveHistoryPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | LeaveStatus>("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<LeaveRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await leavesApi.listMine({
        page,
        status: status || undefined,
        search: q || undefined,
        ordering: "-created_at",
      });
      setLeaves(data.results);
      setCount(data.count);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load leaves"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await leavesApi.remove(deleting.id);
      toast.success("Leave request deleted");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">Leave history</h1>
        <p className="mt-1 text-sm text-slate-500">All leave requests you've submitted.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by type or reason"
              className="block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>
          <div className="w-44">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as "" | LeaveStatus);
                setPage(1);
              }}
              options={[
                { value: "", label: "All statuses" },
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table
            loading={loading}
            data={leaves}
            empty="No leave requests found."
            columns={[
              { key: "type", header: "Leave type", render: (r) => r.leave_type },
              { key: "range", header: "Date range", render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}` },
              { key: "days", header: "Days", render: (r) => r.number_of_days },
              { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
              { key: "submitted", header: "Submitted", render: (r) => formatDate(r.created_at) },
              {
                key: "actions",
                header: "",
                render: (r) =>
                  r.status === "Pending" ? (
                    <Button size="sm" variant="ghost" onClick={() => setDeleting(r)}>
                      <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                    </Button>
                  ) : null,
              },
            ]}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={count} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleting}
        title="Delete leave request"
        message={`Delete your ${deleting?.leave_type} request from ${deleting ? formatDate(deleting.start_date) : ""}?`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={submitting}
      />
    </div>
  );
}
