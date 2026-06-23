import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { authApi } from "../../api/auth";
import { getErrorMessage } from "../../api/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../../validations/auth";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setServerError(null);
    try {
      const res = await authApi.forgotPassword(values.email);
      toast.success(res.message);
      navigate("/reset-password", { replace: true, state: { email: values.email } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to send reset code"));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-[#0F172A]">Forgot password</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter your email and we&apos;ll send you a 6-digit code to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
            {serverError}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" loading={isSubmitting} className="w-full">
          Send reset code
        </Button>

        <p className="text-center text-xs text-slate-500">
          Remember your password?{" "}
          <Link to="/login" className="text-[#1D4ED8] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
