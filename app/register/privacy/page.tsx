"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { savePrivacySettings } from "@/lib/api";

interface ToggleItem {
  key: string;
  label: string;
  desc: string;
  defaultChecked: boolean;
}

const toggles: ToggleItem[] = [
  { key: "publicProfile", label: "Public Profile", desc: "Allow other users to see your profile and activity.", defaultChecked: true },
  { key: "showDonations", label: "Show Donation History", desc: "Display your past donations on your public profile.", defaultChecked: true },
  { key: "marketingEmails", label: "Marketing Emails", desc: "Receive tips, recipes, and updates about food waste.", defaultChecked: false },
  { key: "shareImpact", label: "Share Impact Stats", desc: "Let others see your sustainability and savings statistics.", defaultChecked: true },
];

export default function PrivacyOnboardingPage() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map((t) => [t.key, t.defaultChecked]))
  );
  const [isLoading, setIsLoading] = useState(false);

  function toggle(key: string) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await savePrivacySettings(preferences);
      window.location.href = "/dashboard";
    } catch {
      // Error handled silently - user can retry
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="Go to homepage">
            <Image src="/saveplate-logo.png" alt="" width={36} height={36} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-gray-900">SavePlate</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Preferences</h1>
          <p className="text-gray-500 mt-1">Control your visibility on SavePlate</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-1">
              {toggles.map((item) => {
                const checked = preferences[item.key] ?? false;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="pr-4">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    {/* Toggle switch — matches Settings page design */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={() => toggle(item.key)}
                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 ${
                        checked ? "bg-[#4CAF50]" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                          checked ? "right-1" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4CAF50] text-white font-semibold py-3 rounded-xl text-center hover:bg-[#3d8c40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  "Save & Continue"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
