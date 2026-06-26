export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8 text-sm" : "h-9 w-9";
  const label = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid ${box} place-items-center rounded-md bg-[#2563EB] font-semibold text-white`}
      >
        LD
      </div>
      <span className={`${label} font-semibold text-[#0F172A]`}>LeaveDesk</span>
    </div>
  );
}
