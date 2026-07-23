"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    householdSize: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.password) {
      next.password = "Password is required.";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (!form.householdSize) next.householdSize = "Please select your household size.";
    if (!agreed) next.agreed = "You must agree to the terms.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="Go to homepage">
            <Image src="/saveplate-logo.png" alt="" width={36} height={36} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SavePlate</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-500 mt-1">Start reducing food waste today</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {apiError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg" role="alert">
              {apiError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-firstname" className="text-sm font-semibold text-gray-700">First Name</label>
                <input
                  id="reg-firstname"
                  type="text"
                  placeholder="Aaditya"
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                    errors.firstName ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "reg-firstname-error" : undefined}
                  autoComplete="given-name"
                />
                {errors.firstName && <p id="reg-firstname-error" className="text-xs text-red-600 mt-1" role="alert">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-lastname" className="text-sm font-semibold text-gray-700">Last Name</label>
                <input
                  id="reg-lastname"
                  type="text"
                  placeholder="Chaudhary"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                    errors.lastName ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "reg-lastname-error" : undefined}
                  autoComplete="family-name"
                />
                {errors.lastName && <p id="reg-lastname-error" className="text-xs text-red-600 mt-1" role="alert">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-semibold text-gray-700">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "reg-email-error" : undefined}
                autoComplete="email"
              />
              {errors.email && <p id="reg-email-error" className="text-xs text-red-600 mt-1" role="alert">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold text-gray-700">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="8+ characters"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                  errors.password ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "reg-password-error" : undefined}
                autoComplete="new-password"
              />
              {errors.password && <p id="reg-password-error" className="text-xs text-red-600 mt-1" role="alert">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-household" className="text-sm font-semibold text-gray-700">Household Size</label>
              <select
                id="reg-household"
                value={form.householdSize}
                onChange={(e) => setField("householdSize", e.target.value)}
                className={`w-full h-11 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                  errors.householdSize ? "border-red-400 bg-red-50" : "border-gray-200"
                } ${form.householdSize ? "text-gray-900" : "text-gray-400"}`}
                aria-invalid={!!errors.householdSize}
                aria-describedby={errors.householdSize ? "reg-household-error" : undefined}
              >
                <option value="" disabled>Select...</option>
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="3-4">3–4 people</option>
                <option value="5+">5+ people</option>
              </select>
              {errors.householdSize && <p id="reg-household-error" className="text-xs text-red-600 mt-1" role="alert">{errors.householdSize}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((p) => ({ ...p, agreed: "" })); }}
                className={`mt-0.5 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50] ${errors.agreed ? "ring-2 ring-red-400" : ""}`}
                aria-invalid={!!errors.agreed}
                aria-describedby={errors.agreed ? "reg-terms-error" : undefined}
              />
              <label htmlFor="terms" className="text-sm text-gray-600 select-none">
                I agree to the{" "}
                <a href="#" className="text-[#4CAF50] hover:text-[#3d8c40]">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-[#4CAF50] hover:text-[#3d8c40]">Privacy Policy</a>
              </label>
            </div>
            {errors.agreed && <p id="reg-terms-error" className="text-xs text-red-600 -mt-3" role="alert">{errors.agreed}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4CAF50] text-white font-semibold py-3 rounded-xl text-center hover:bg-[#3d8c40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4CAF50] font-medium hover:text-[#3d8c40]">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}