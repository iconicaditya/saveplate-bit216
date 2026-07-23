"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, User, Shield, Bell, Lock, Camera } from "lucide-react";

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
        </section>
      </div>
    </div>
  );
}