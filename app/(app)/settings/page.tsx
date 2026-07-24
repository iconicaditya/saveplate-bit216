"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, User, Shield, Bell, Lock, Camera, Copy, Check, Smartphone, ShieldOff } from "lucide-react";

type Tab = "profile" | "privacy" | "notifications" | "security";

const tabs: { id: Tab; icon: typeof User; label: string }[] = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "privacy", icon: Shield, label: "Privacy" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "security", icon: Lock, label: "Security" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState("/aaditya-profile.jpg");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previousAvatarUrlRef = useRef<string | null>(null);
  const sectionRefs = useRef<Record<Tab, HTMLDivElement | null>>({
    profile: null,
    privacy: null,
    notifications: null,
    security: null,
  });

  // IntersectionObserver to highlight the active section on scroll
  useEffect(() => {
    const entries = Object.entries(sectionRefs.current) as [Tab, HTMLDivElement | null][];
    const visible = new Map<Tab, number>();

    const observer = new IntersectionObserver(
      (changes) => {
        changes.forEach((change) => {
          const tab = entries.find(([, el]) => el === change.target)?.[0];
          if (!tab) return;
          if (change.isIntersecting) {
            visible.set(tab, change.boundingClientRect.top);
          } else {
            visible.delete(tab);
          }
        });

        if (visible.size > 0) {
          // Pick the section closest to the top of the viewport
          let best: Tab = "profile";
          let bestTop = Infinity;
          visible.forEach((top, tab) => {
            if (top < bestTop) {
              bestTop = top;
              best = tab;
            }
          });
          setActiveTab(best);
        }
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 },
    );

    const els: HTMLDivElement[] = [];
    entries.forEach(([, el]) => {
      if (el) {
        observer.observe(el);
        els.push(el);
      }
    });

    return () => {
      els.forEach((el) => observer.unobserve(el));
    };
  }, []);

  function scrollTo(tab: Tab) {
    setActiveTab(tab);
    sectionRefs.current[tab]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSave() {
    // Simulated save — in production this would call an API
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  function openAvatarPicker() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (previousAvatarUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previousAvatarUrlRef.current);
    }

    previousAvatarUrlRef.current = url;
    setAvatarSrc(url);
  }

  useEffect(() => {
    return () => {
      if (previousAvatarUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previousAvatarUrlRef.current);
      }
    };
  }, []);

  // ─── 2FA State & Handlers ─────────────────────────────────
  const MOCK_2FA_SECRET = "JBSWY3DPEHPK3PXP";

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFAOTP, setTwoFAOTP] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFAOTPLoading, setTwoFAOTPLoading] = useState(false);
  const [twoFASuccessMessage, setTwoFASuccessMessage] = useState("");
  const [copied2FA, setCopied2FA] = useState(false);
  const [settingsQrDataUrl, setSettingsQrDataUrl] = useState<string | null>(null);

  // Generate real QR code when 2FA setup panel opens
  useEffect(() => {
    if (show2FASetup) {
      const otpauth = `otpauth://totp/SavePlate:aaditya@example.com?secret=${MOCK_2FA_SECRET}&issuer=SavePlate&algorithm=SHA1&digits=6&period=30`;
      import("qrcode").then((QRCode) => {
        QRCode.toDataURL(otpauth, {
          width: 160,
          margin: 2,
          color: { dark: "#1f2937", light: "#ffffff" },
        }).then(setSettingsQrDataUrl);
      });
    }
  }, [show2FASetup]);

  function handleCopy2FA() {
    navigator.clipboard.writeText(MOCK_2FA_SECRET).catch(() => {});
    setCopied2FA(true);
    setTimeout(() => setCopied2FA(false), 2000);
  }

  async function handleConfirm2FA() {
    setTwoFAError("");
    setTwoFASuccessMessage("");
    if (twoFAOTP.length !== 6) {
      setTwoFAError("Please enter a 6-digit code.");
      return;
    }
    setTwoFAOTPLoading(true);
    // Mock verification
    await new Promise((r) => setTimeout(r, 800));
    setTwoFAOTPLoading(false);

    // Accept any 6-digit code
    setTwoFAEnabled(true);
    setShow2FASetup(false);
    setTwoFASuccessMessage("");
    setTwoFAOTP("");
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  function handleDisable2FA() {
    setTwoFAEnabled(false);
    setTwoFASuccessMessage("");
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl">
      {/* Left Sub-nav — horizontal row on mobile (all visible), sticky sidebar on desktop */}
      <nav
        className="w-full md:w-64 shrink-0 flex md:flex-col gap-1 pb-1 md:pb-0 md:sticky md:top-0 md:self-start md:space-y-1"
        aria-label="Settings sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className={`flex-1 md:flex-none md:w-full items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Success Banner */}
        {settingsSaved && (
          <div
            className="p-3 bg-[#E8F5E9] border border-[#4CAF50]/30 rounded-lg flex items-center gap-2 text-[#2E7D32] text-sm"
            role="alert"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="font-medium">Settings saved successfully.</p>
          </div>
        )}

        {/* Profile Card */}
        <section
          id="section-profile"
          ref={(el: HTMLDivElement | null) => { sectionRefs.current.profile = el; }}
          aria-label="Profile Information"
          className="bg-white border border-gray-200 rounded-xl shadow-sm scroll-mt-20"
        >
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update your personal details here.</p>
          </div>
          <div className="px-6 pb-6 space-y-6">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={openAvatarPicker}
                className="w-20 h-20 rounded-full border border-gray-200 overflow-hidden relative group cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2"
                aria-label="Upload profile avatar"
              >
                <img src={avatarSrc} alt="Profile avatar" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Change Avatar
                </button>
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label="Upload profile avatar file"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="settings-fullname" className="text-sm font-medium text-gray-700">Full Name</label>
                <input id="settings-fullname" defaultValue="Aaditya Chaudhary" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
              <div className="space-y-2">
                <label htmlFor="settings-email" className="text-sm font-medium text-gray-700">Email</label>
                <input id="settings-email" defaultValue="aaditya@example.com" type="email" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
              <div className="space-y-2">
                <label htmlFor="settings-household" className="text-sm font-medium text-gray-700">Household Size</label>
                <input id="settings-household" type="number" defaultValue={3} className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                className="bg-[#4CAF50] text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-[#3d8c40] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section
          id="section-privacy"
          ref={(el: HTMLDivElement | null) => { sectionRefs.current.privacy = el; }}
          aria-label="Privacy Preferences"
          className="bg-white border border-gray-200 rounded-xl shadow-sm scroll-mt-20"
        >
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-base font-semibold text-gray-900">Privacy Preferences</h2>
            <p className="text-sm text-gray-500 mt-0.5">Control what others can see.</p>
          </div>
          <div className="px-6 pb-6 space-y-4">
            {[
              { label: "Public Listings", desc: "Allow anyone to see your public donations.", checked: true },
              { label: "Private Listings", desc: "Only allow approved members to see your donations.", checked: false },
              { label: "Email Notifications", desc: "Receive updates via email.", checked: true },
              { label: "Push Notifications", desc: "Receive mobile push notifications.", checked: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                {/* Toggle */}
                <div
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ${item.checked ? "bg-[#4CAF50]" : "bg-gray-200"}`}
                  role="switch"
                  aria-checked={item.checked}
                  tabIndex={0}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${item.checked ? "right-1" : "left-1"}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section
          id="section-security"
          ref={(el: HTMLDivElement | null) => { sectionRefs.current.security = el; }}
          aria-label="Security"
          className="bg-white border border-gray-200 rounded-xl shadow-sm scroll-mt-20"
        >
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-base font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update your password.</p>
          </div>
          <div className="px-6 pb-6 space-y-4 max-w-md">
            <div className="space-y-2">
              <label htmlFor="settings-current-pw" className="text-sm font-medium text-gray-700">Current Password</label>
              <input id="settings-current-pw" type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
            <div className="space-y-2">
              <label htmlFor="settings-new-pw" className="text-sm font-medium text-gray-700">New Password</label>
              <input id="settings-new-pw" type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
            <div className="space-y-2">
              <label htmlFor="settings-confirm-pw" className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <input id="settings-confirm-pw" type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="border-t border-gray-100 mt-2 pt-6 px-6 pb-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h3>
              <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
            </div>

            {!twoFAEnabled ? (
              /* 2FA Disabled State */
              <div>
                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <ShieldOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Two-factor authentication is currently disabled.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShow2FASetup(true)}
                  className="bg-[#4CAF50] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#3d8c40] transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
            ) : (
              /* 2FA Enabled State */
              <div>
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#E8F5E9] rounded-lg border border-[#4CAF50]/30">
                  <Smartphone className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm text-[#2E7D32] font-medium">Two-factor authentication is active.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisable2FA}
                  className="border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
                >
                  Disable 2FA
                </button>
              </div>
            )}

            {/* Inline 2FA Setup Flow */}
            {show2FASetup && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Step 1: Scan this QR code</p>
                {/* Real QR Code */}
                <div className="flex justify-center">
                  {settingsQrDataUrl ? (
                    <img
                      src={settingsQrDataUrl}
                      alt="Scan this QR code with your authenticator app"
                      className="w-36 h-36 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                  <code className="text-xs font-mono font-bold text-gray-900 tracking-wider select-all">
                    {MOCK_2FA_SECRET.match(/.{1,4}/g)?.join(" ") ?? MOCK_2FA_SECRET}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy2FA}
                    className="shrink-0 p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label={copied2FA ? "Copied" : "Copy secret key"}
                  >
                    {copied2FA ? <Check className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Step 2: Confirm the code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      value={twoFAOTP}
                      onChange={(e) => { setTwoFAOTP(e.target.value.replace(/\D/g, "").slice(0, 6)); setTwoFAError(""); }}
                      className={`flex-1 h-10 px-3 rounded-md border bg-white text-sm text-center tracking-[0.3em] font-semibold focus:outline-none focus:ring-1 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${
                        twoFAError ? "border-red-400 bg-red-50" : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleConfirm2FA}
                      disabled={twoFAOTPLoading}
                      className="bg-[#4CAF50] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#3d8c40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {twoFAOTPLoading ? "Verifying…" : "Confirm"}
                    </button>
                  </div>
                  {twoFAError && <p className="text-xs text-red-600 mt-1">{twoFAError}</p>}
                  {twoFASuccessMessage && (
                    <p className="text-xs text-[#2E7D32] mt-1 font-medium">{twoFASuccessMessage}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShow2FASetup(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none p-0 cursor-pointer"
                >
                  Cancel setup
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}