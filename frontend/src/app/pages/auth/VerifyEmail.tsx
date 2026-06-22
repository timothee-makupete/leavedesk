import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "../../api/auth";
import { getErrorMessage } from "../../api/client";
import { Button } from "../../components/Button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { email?: string } };
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const onVerify = async () => {
    if (code.length !== 6) {
      setServerError("Please enter the 6-digit verification code.");
      return;
    }
    if (!email.trim()) {
      setServerError("Email address is required.");
      return;
    }

    setServerError(null);
    setSubmitting(true);
    try {
      const res = await authApi.verifyEmail(email.trim(), code);
      toast.success(res.message);
      navigate("/login", { replace: true, state: { email: email.trim() } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to verify email"));
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email.trim()) {
      setServerError("Enter your email address to resend the code.");
      return;
    }
    setServerError(null);
    setResending(true);
    try {
      const res = await authApi.resendVerification(email.trim());
      toast.success(res.message);
    } catch (err) {
      setServerError(getErrorMessage(err, "Unable to resend verification code"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-[#0F172A]">Verify your email</h2>
      <p className="mt-1 text-sm text-slate-500">
        We sent a 6-digit code to your email. Enter it below to activate your account.
      </p>

      <div className="mt-6 space-y-4">
        {serverError && (
          <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="verify-email" className="mb-1.5 block text-xs font-medium text-slate-700">
            Email address
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-700">Verification code</label>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button type="button" loading={submitting} className="w-full" onClick={onVerify}>
          Verify email
        </Button>

        <Button type="button" variant="secondary" loading={resending} className="w-full" onClick={onResend}>
          Resend code
        </Button>

        <p className="text-center text-xs text-slate-500">
          Already verified?{" "}
          <Link to="/login" className="text-[#1D4ED8] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
