import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-1.5 text-sm transition-colors",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export function MainNav() {
  return (
    <nav className="flex flex-wrap gap-1">
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/features" className={linkClass}>
        Features
      </NavLink>
      <NavLink to="/how-it-works" className={linkClass}>
        How it works
      </NavLink>
      <NavLink to="/pricing" className={linkClass}>
        Pricing
      </NavLink>
    </nav>
  );
}
