import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

type AuthInputProps = {
  id: string;
  label: string;
  icon: LucideIcon;
} & React.InputHTMLAttributes<HTMLInputElement>;

/** Label + icon-prefixed input used on the login/signup pages. */
export function AuthInput({
  id,
  label,
  icon: Icon,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </Label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          id={id}
          className={cn(
            "h-11 border-slate-200 bg-slate-50 pl-10 text-sm placeholder:text-slate-400 focus-visible:border-[#00A8E8]",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  );
}
