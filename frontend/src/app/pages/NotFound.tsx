import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
