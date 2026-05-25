import clsx from "clsx";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "default" | "blue" | "red" | "yellow" | "green" | "purple";
  description?: string;
  href?: string;
}

const COLOR_MAP = {
  default: { icon: "text-slate-500 bg-slate-100", value: "text-slate-900" },
  blue:    { icon: "text-blue-600 bg-blue-50",   value: "text-blue-700" },
  red:     { icon: "text-red-600 bg-red-50",     value: "text-red-700" },
  yellow:  { icon: "text-yellow-600 bg-yellow-50", value: "text-yellow-700" },
  green:   { icon: "text-green-600 bg-green-50", value: "text-green-700" },
  purple:  { icon: "text-purple-600 bg-purple-50", value: "text-purple-700" },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = "default",
  description,
  href,
}: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className="card px-5 py-4 flex items-start gap-4">
      <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colors.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>

        {href ? (
          <Link
            href={href}
            className={clsx(
              "text-2xl font-bold mt-0.5 inline-block underline underline-offset-2 decoration-dotted hover:decoration-solid transition-all",
              colors.value
            )}
          >
            {value}
          </Link>
        ) : (
          <p className={clsx("text-2xl font-bold mt-0.5", colors.value)}>{value}</p>
        )}

        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
