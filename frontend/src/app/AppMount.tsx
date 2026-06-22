import { lazy, Suspense, useEffect, useState } from "react";

const App = lazy(() => import("./App"));

export function AppMount() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-slate-500">
        Loading…
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <App />
    </Suspense>
  );
}
