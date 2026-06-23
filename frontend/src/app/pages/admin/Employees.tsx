import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { employeesApi } from "../../api/employees";
import type { User, UserRole } from "../../api/types";
import { DEPARTMENTS } from "../../api/types";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Pagination } from "../../components/Pagination";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Modal } from "../../components/Modal";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Badge } from "../../components/Badge";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateValues,
  type EmployeeUpdateValues,
} from "../../validations/employee";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

const PAGE_SIZE = 20;

export function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await employeesApi.list({
        page,
        role: roleFilter || undefined,
        search: q || undefined,
        ordering: "-date_joined",
      });
      setEmployees(data.results);
      setCount(data.count);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load employees"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const createForm = useForm<EmployeeCreateValues>({
    resolver: zodResolver(employeeCreateSchema),
  });
  const editForm = useForm<EmployeeUpdateValues>({
    resolver: zodResolver(employeeUpdateSchema),
  });

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
      password: "",
    });
  };

  const openEdit = (emp: User) => {
    setEditing(emp);
    setCreating(false);
    editForm.reset({
      first_name: emp.first_name,
      last_name: emp.last_name,
      phone_number: emp.phone_number,
      department: emp.department,
      role: emp.role,
      is_active: emp.is_active ?? true,
      password: "",
    });
  };

  const onCreate = async (values: EmployeeCreateValues) => {
    setSubmitting(true);
    try {
      await employeesApi.create(values);
      toast.success("Employee created");
      setCreating(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create employee"));
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = async (values: EmployeeUpdateValues) => {
    if (!editing) return;
    setSubmitting(true);
    try {
      const payload: EmployeeUpdateValues = { ...values };
      if (!values.password) delete (payload as Partial<EmployeeUpdateValues>).password;
      await employeesApi.update(editing.id, payload);
      toast.success("Employee updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update employee"));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await employeesApi.deactivate(deleting.id);
      toast.success("Employee deactivated");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to deactivate"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">Manage employee accounts and access.</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add employee
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, ID or department"
              className="block w-full rounded-md border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as "" | UserRole);
                setPage(1);
              }}
              options={[
                { value: "", label: "All roles" },
                { value: "EMPLOYEE", label: "Employee" },
                { value: "ADMIN", label: "Administrator" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table
            loading={loading}
            data={employees}
            empty="No employees found."
            columns={[
              {
                key: "name",
                header: "Name",
                render: (r) => (
                  <div>
                    <div className="font-medium text-[#0F172A]">{r.full_name || `${r.first_name} ${r.last_name}`}</div>
                    <div className="text-xs text-slate-500">{r.email}</div>
                  </div>
                ),
              },
              { key: "employee_id", header: "Employee ID" },
              { key: "department", header: "Department" },
              { key: "phone", header: "Phone", render: (r) => r.phone_number },
              { key: "role", header: "Role", render: (r) => <Badge tone={r.role === "ADMIN" ? "info" : "neutral"}>{r.role}</Badge> },
              {
                key: "is_active",
                header: "Status",
                render: (r) => (
                  <Badge tone={r.is_active === false ? "danger" : "success"}>
                    {r.is_active === false ? "Inactive" : "Active"}
                  </Badge>
                ),
              },
              { key: "date_joined", header: "Joined", render: (r) => formatDate(r.date_joined) },
              {
                key: "actions",
                header: "Actions",
                render: (r) => (
                  <div className="flex flex-wrap items-center gap-1">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleting(r)} disabled={r.is_active === false}>
                      <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={count} onPageChange={setPage} />
        </div>
      </Card>

      {/* Create modal */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Add employee"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={createForm.handleSubmit(onCreate)} loading={submitting}>Create employee</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={createForm.handleSubmit(onCreate)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" error={createForm.formState.errors.first_name?.message} {...createForm.register("first_name")} />
            <Input label="Last name" error={createForm.formState.errors.last_name?.message} {...createForm.register("last_name")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" error={createForm.formState.errors.email?.message} {...createForm.register("email")} />
            <Input label="Employee ID" error={createForm.formState.errors.employee_id?.message} {...createForm.register("employee_id")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Phone number" error={createForm.formState.errors.phone_number?.message} {...createForm.register("phone_number")} />
            <Select
              label="Department"
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              error={createForm.formState.errors.department?.message}
              {...createForm.register("department")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              options={[
                { value: "EMPLOYEE", label: "Employee" },
                { value: "ADMIN", label: "Administrator" },
              ]}
              error={createForm.formState.errors.role?.message}
              {...createForm.register("role")}
            />
            <Input label="Password" type="password" error={createForm.formState.errors.password?.message} {...createForm.register("password")} />
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.full_name || ""}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={submitting}>Cancel</Button>
            <Button onClick={editForm.handleSubmit(onEdit)} loading={submitting}>Save changes</Button>
          </>
        }
      >
        {editing && (
          <form className="space-y-4" onSubmit={editForm.handleSubmit(onEdit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" error={editForm.formState.errors.first_name?.message} {...editForm.register("first_name")} />
              <Input label="Last name" error={editForm.formState.errors.last_name?.message} {...editForm.register("last_name")} />
            </div>
            <Input label="Email" value={editing.email} disabled />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone number" error={editForm.formState.errors.phone_number?.message} {...editForm.register("phone_number")} />
              <Select
                label="Department"
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                error={editForm.formState.errors.department?.message}
                {...editForm.register("department")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Role"
                options={[
                  { value: "EMPLOYEE", label: "Employee" },
                  { value: "ADMIN", label: "Administrator" },
                ]}
                error={editForm.formState.errors.role?.message}
                {...editForm.register("role")}
              />
              <Input
                label="New password (optional)"
                type="password"
                error={editForm.formState.errors.password?.message}
                {...editForm.register("password")}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" {...editForm.register("is_active")} />
              Active
            </label>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Deactivate employee"
        message={`Deactivate ${deleting?.full_name || ""}? Their account will be set inactive (soft delete).`}
        confirmLabel="Deactivate"
        tone="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={submitting}
      />
    </div>
  );
}
