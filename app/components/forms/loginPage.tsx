"use client";
import { useState } from "react";
import Button from "../ui/button";
import Input from "../ui/input";



type formData = {
  email: string;
  password: string;
};

type Errors = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<formData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: Errors = {
      email: "",
      password: "",
    };

    if (formData.email.trim() === "") {
      newErrors.email = "Email is required";
    }

    if (formData.password.trim() === "") {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data, "Status:", response.status);

      if (!response.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Success - redirect to todayPage
      console.log("Login successful, redirecting to /todayPage...");
      window.location.href = "/todayPage";
      
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};


  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="page-card page-accent grid w-full max-w-5xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-5">
            <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-violet-100">
              Alflah Laboratory
            </span>
            <div className="space-y-4">
              <h1 className="max-w-md text-4xl font-black leading-tight">
                Faster lab work, clearer reports, smoother daily operations.
              </h1>
              <p className="max-w-md text-base leading-7 text-slate-300">
                Manage registrations, verification, records, and patient reports from one clean workspace built for busy lab teams.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <p className="text-3xl font-black">All-in-one</p>
              <p className="mt-2 text-sm text-slate-300">Registration, verification, summary, and printable reports.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <p className="text-3xl font-black">Responsive</p>
              <p className="mt-2 text-sm text-slate-300">Comfortable on desktop, tablet, and smaller mobile screens.</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-center gap-6 px-6 py-8 sm:px-8 md:px-10 lg:px-12"
        >
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-violet-700 lg:hidden">
              Alflah Laboratory
            </span>
            <h2 className="text-3xl font-black text-slate-900">Welcome back</h2>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              Sign in to continue managing patient workflows, reports, and lab records.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <Input
              value={formData.email}
              name="email"
              onChange={handleInput}
              type="email"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-sm font-medium text-rose-500">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <Input
              value={formData.password}
              name="password"
              onChange={handleInput}
              type="password"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-sm font-medium text-rose-500">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 py-3.5 text-white shadow-[0_18px_45px_rgba(79,70,229,0.24)] hover:from-violet-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Logging in...
              </>
            ) : "Login"}
          </Button>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
            Forgot your password?{" "}
            <span className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4">
              Contact the administrator
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
