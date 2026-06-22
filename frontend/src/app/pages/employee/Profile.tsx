import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { DEPARTMENTS } from "../../api/types";
import { formatDate, initialsFor } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

type FormValues = {
  first_name: string;
  last_name: string;
  phone_number: string;
  department: string;
};

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      department: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      department: user.department,
    });
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile(values);
      reset(values);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">View and update your account information.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#EFF6FF] text-lg font-semibold text-[#1D4ED8]">
              {initialsFor(user.first_name, user.last_name)}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#0F172A]">
              {user.full_name || `${user.first_name} ${user.last_name}`}
            </h3>
            <p className="text-xs text-slate-500">{user.role === "ADMIN" ? "Administrator" : "Employee"}</p>
            <div className="mt-4 w-full space-y-2 border-t border-[#E2E8F0] pt-4 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-medium text-[#0F172A]">{user.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-[#0F172A]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department</span>
                <span className="font-medium text-[#0F172A]">{user.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joined</span>
                <span className="font-medium text-[#0F172A]">{formatDate(user.date_joined)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Account information">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First name" {...register("first_name", { required: true })} />
              <Input label="Last name" {...register("last_name", { required: true })} />
            </div>
            <Input label="Email" type="email" value={user.email} disabled />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Phone number" {...register("phone_number")} />
              <Select
                label="Department"
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                {...register("department")}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
