"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Trash2, Clock, Info, HeartHandshake, X } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/lib/api";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  alert: Clock,
  donation: HeartHandshake,
  system: Info,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getNotifications(filter);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || "Failed to mark as read.");
    }
  }

  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || "Failed to mark all as read.");
    } finally {
      setIsMarkingAll(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || "Failed to delete notification.");
    }
  }

  function formatTime(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Top Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-md transition-colors ${
                filter === f
                  ? "bg-gray-100 border border-gray-200 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || unreadCount === 0}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMarkingAll ? (
            <svg className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" viewBox="0 0 24 24" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Mark All Read
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-gray-400">
          <svg className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-600 rounded-full mb-3" viewBox="0 0 24 24" />
          <p className="text-sm">Loading notifications...</p>
        </div>
      ) : (
        <>
          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">You&rsquo;re all caught up!</p>
              <p className="text-sm text-gray-400 mt-1">No new notifications.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {filteredNotifications.map((n) => {
                const Icon = typeIcons[n.type] || Info;
                return (
                  <div key={n.id} className={`flex items-start gap-4 p-5 group relative ${!n.read ? "bg-gray-50" : "bg-white"}`}>
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4CAF50]" />
                    )}
                    <div className="p-2 bg-gray-200 rounded-full shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {n.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4 shrink-0">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{n.message}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}