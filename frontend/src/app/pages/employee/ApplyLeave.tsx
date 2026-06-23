import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { leaveSchema, type LeaveValues } from "../../validations/leave";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { leavesApi } from "../../api/leaves";
import { LEAVE_TYPES } from "../../api/types";
import { daysBetween } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

export function ApplyLeavePage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leave_type: "Annual Leave", start_date: "", end_date: "", reason: "" },
  });

  const start = watch("start_date");
  const end = watch("end_date");
  const days = start && end ? daysBetween(start, end) : 0;

  const onSubmit = async (values: LeaveValues) => {
    try {
      await leavesApi.create(values);
      toast.success("Leave request submitted");
      reset();
      navigate("/employee/history");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit leave request"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">Apply for leave</h1>
        <p className="text-sm text-slate-500">Submit a new leave request for HR approval.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Select
            label="Leave type"
            options={LEAVE_TYPES.map((t) => ({ value: t, label: t }))}
            error={errors.leave_type?.message}
            {...register("leave_type")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Start date" type="date" error={errors.start_date?.message} {...register("start_date")} />
            <Input label="End date" type="date" error={errors.end_date?.message} {...register("end_date")} />
          </div>
          {days > 0 && (
            <div className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs text-[#1D4ED8]">
              You are requesting <strong>{days}</strong> day{days === 1 ? "" : "s"} of leave.
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Reason</label>
            <textarea
              {...register("reason")}
              rows={4}
              placeholder="Briefly describe the reason for your leave"
              className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${
                errors.reason ? "border-[#DC2626]" : "border-[#E2E8F0] focus:border-[#2563EB]"
              }`}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#E2E8F0] pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => reset()} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Submit request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
