import { useEffect, useState } from "react";
import { Search, Eye, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { leavesApi } from "../../api/leaves";
import type { LeaveRequest, LeaveStatus } from "../../api/types";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Pagination } from "../../components/Pagination";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { StatusBadge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { formatDate, formatDateTime } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

const PAGE_SIZE = 20;
type DecisionAction = "approve" | "reject" | null;

export function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | LeaveStatus>("");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<LeaveRequest | null>(null);
  const [acting, setActing] = useState<{ row: LeaveRequest | null; action: DecisionAction }>({
    row: null,
    action: null,
  });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await leavesApi.listAll({
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

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const submitDecision = async () => {
    if (!acting.row || !acting.action) return;
    if (acting.action === "reject" && !note.trim()) {
      toast.error("A comment is required to reject a request.");
      return;
    }
    setSubmitting(true);
    try {
      if (acting.action === "approve") {
        await leavesApi.approve(acting.row.id, note.trim());
      } else {
        await leavesApi.reject(acting.row.id, note.trim());
      }
      toast.success(`Leave ${acting.action === "approve" ? "approved" : "rejected"}`);
      setActing({ row: null, action: null });
      setNote("");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update leave"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">Leave requests</h1>
        <p className="text-sm text-slate-500">Review and act on team leave requests.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by employee email or ID"
              className="block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>
          <div className="w-full sm:w-44">
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
            empty="No leave requests match your filters."
            columns={[
              { key: "employee", header: "Employee", render: (r) => r.employee.full_name || `${r.employee.first_name} ${r.employee.last_name}` },
              { key: "department", header: "Department", render: (r) => r.employee.department },
              { key: "type", header: "Type", render: (r) => r.leave_type },
              { key: "range", header: "Date range", render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}` },
              { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
              {
                key: "actions",
                header: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewing(r)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    {r.status === "Pending" && (
                      <>
                        <Button size="sm" variant="success" onClick={() => setActing({ row: r, action: "approve" })}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setActing({ row: r, action: "reject" })}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={count} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Leave request details">
        {viewing && (
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
            <dt className="text-slate-500">Employee</dt>
            <dd className="font-medium text-[#0F172A]">{viewing.employee.full_name}</dd>
            <dt className="text-slate-500">Employee ID</dt>
            <dd>{viewing.employee.employee_id}</dd>
            <dt className="text-slate-500">Department</dt>
            <dd>{viewing.employee.department}</dd>
            <dt className="text-slate-500">Type</dt>
            <dd>{viewing.leave_type}</dd>
            <dt className="text-slate-500">Date range</dt>
            <dd>{formatDate(viewing.start_date)} – {formatDate(viewing.end_date)} ({viewing.number_of_days} days)</dd>
            <dt className="text-slate-500">Status</dt>
            <dd><StatusBadge status={viewing.status} /></dd>
            <dt className="text-slate-500">Submitted</dt>
            <dd>{formatDateTime(viewing.created_at)}</dd>
            {viewing.approved_by && (
              <>
                <dt className="text-slate-500">Decided by</dt>
                <dd>{viewing.approved_by.full_name}</dd>
                <dt className="text-slate-500">Decided at</dt>
                <dd>{formatDateTime(viewing.approved_at)}</dd>
              </>
            )}
            <dt className="sm:col-span-2 mt-2 text-slate-500">Reason</dt>
            <dd className="sm:col-span-2 rounded-md border border-[#E2E8F0] bg-slate-50 p-3 text-slate-700">
              {viewing.reason}
            </dd>
            {viewing.admin_comment && (
              <>
                <dt className="sm:col-span-2 mt-2 text-slate-500">Admin comment</dt>
                <dd className="sm:col-span-2 rounded-md border border-[#E2E8F0] bg-slate-50 p-3 text-slate-700">
                  {viewing.admin_comment}
                </dd>
              </>
            )}
          </dl>
        )}
      </Modal>

      <Modal
        open={!!acting.action}
        onClose={() => {
          setActing({ row: null, action: null });
          setNote("");
        }}
        title={acting.action === "approve" ? "Approve leave request" : "Reject leave request"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setActing({ row: null, action: null });
                setNote("");
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant={acting.action === "approve" ? "success" : "danger"}
              onClick={submitDecision}
              loading={submitting}
            >
              {acting.action === "approve" ? "Approve request" : "Reject request"}
            </Button>
          </>
        }
      >
        {acting.row && (
          <div className="space-y-3">
            <p>
              You are about to <strong>{acting.action === "approve" ? "approve" : "reject"}</strong> the{" "}
              <strong>{acting.row.leave_type}</strong> request for{" "}
              <strong>{acting.row.employee.full_name}</strong>.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Admin comment {acting.action === "reject" && <span className="text-[#DC2626]">(required)</span>}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={acting.action === "reject" ? "Reason for rejection" : "Optional comment"}
                className="block w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
