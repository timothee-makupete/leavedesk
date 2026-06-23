import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { registerSchema, type RegisterValues } from "../../validations/auth";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { DEPARTMENTS } from "../../api/types";
import { getErrorMessage } from "../../api/client";

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { department: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      toast.success("Account created. Check your email for a verification code.");
      navigate("/verify-email", { replace: true, state: { email: values.email } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to register"));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-[#0F172A]">Create your account</h2>
      <p className="mt-1 text-sm text-slate-500">
        Employee self-registration.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
            {serverError}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" error={errors.first_name?.message} {...register("first_name")} />
          <Input label="Last name" error={errors.last_name?.message} {...register("last_name")} />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Phone number"
            placeholder="+265977777777"
            error={errors.phone_number?.message}
            {...register("phone_number")}
          />
          <Input
            label="Employee ID"
            placeholder="EMP001"
            error={errors.employee_id?.message}
            {...register("employee_id")}
          />
        </div>
        <Select
          label="Department"
          placeholder="Select department"
          options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          error={errors.department?.message}
          {...register("department")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <Input
            label="Confirm password"
            type="password"
            error={errors.password_confirm?.message}
            {...register("password_confirm")}
          />
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1D4ED8] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
