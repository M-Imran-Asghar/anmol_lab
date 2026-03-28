"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FlaskConical, LogOut, Menu, Shield, X } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { label: "Today", path: "/todayPage" },
    { label: "Patient Registration", path: "/patientRegistration" },
    { label: "Patient Record", path: "/patientRecord" },
    { label: "Patient Summary", path: "/patientSummary" },
    { label: "Patient Verification", path: "/patientVerification" },
  ];

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 md:px-4">
      <div className="page-card page-accent overflow-hidden rounded-[1.75rem]">
        <div className="relative flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => router.push("/todayPage")}
            className="group flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-left text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          >
            <div className="rounded-2xl bg-white/10 p-2.5 transition-transform duration-200 group-hover:scale-105">
              <FlaskConical className="h-5 w-5 text-violet-200" />
            </div>
            <div>
              <p className="text-lg font-black tracking-wide md:text-xl">Alflah Lab</p>
              <p className="text-xs text-slate-300 md:text-sm">Diagnostic workspace</p>
            </div>
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 p-3 text-slate-700 shadow-sm md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-col gap-4 md:flex md:w-auto md:flex-row md:items-center md:gap-3`}>
            <nav className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:flex-wrap md:items-center">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 md:text-[15px] ${
                      isActive
                        ? "bg-violet-600 text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)]"
                        : "bg-white/70 text-slate-700 hover:bg-white hover:text-violet-700"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex flex-col gap-2 md:flex-row">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => router.push("/admin/users")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 py-2.5 font-semibold text-amber-900 transition-colors hover:bg-amber-200"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 font-semibold text-white shadow-[0_12px_30px_rgba(225,29,72,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 disabled:translate-y-0"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
