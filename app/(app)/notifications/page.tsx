import { Check, Trash2, Clock, Info, HeartHandshake, AlertCircle } from "lucide-react";

const notifications = [
  { id: 1, type: "alert", title: "Items Expiring Soon", msg: "Milk and Chicken Breast are expiring tomorrow. Use them or freeze them.", time: "10 mins ago", unread: true, icon: Clock },
  { id: 2, type: "donation", title: "Donation Claimed", msg: "Alex claimed your Canned Soup. Expected pickup today 5 PM - 8 PM.", time: "2 hours ago", unread: true, icon: HeartHandshake },
  { id: 3, type: "system", title: "Weekly Report Ready", msg: "You saved 3.5kg of food this week. View your full report.", time: "5 hours ago", unread: true, icon: Info },
  { id: 4, type: "alert", title: "Low Inventory", msg: "You're running low on Eggs. Consider adding it to your grocery list.", time: "1 day ago", unread: true, icon: AlertCircle },
  { id: 5, type: "system", title: "Meal Plan Generated", msg: "Your weekly meal plan has been created based on your inventory.", time: "2 days ago", unread: false, icon: Info },
  { id: 6, type: "donation", title: "New Match", msg: "Someone nearby is looking for Bread. You have an extra loaf.", time: "3 days ago", unread: false, icon: HeartHandshake },
  { id: 7, type: "system", title: "Achievement Unlocked", msg: "You've reached the 'Waste Warrior' milestone! Great job.", time: "4 days ago", unread: false, icon: Info },
  { id: 8, type: "alert", title: "Storage Reminder", msg: "Don't forget to organize your pantry to keep older items at the front.", time: "1 week ago", unread: false, icon: Clock },
  { id: 9, type: "donation", title: "Donation Completed", msg: "Successfully donated 5 items last month. Thank you!", time: "1 week ago", unread: false, icon: HeartHandshake },
  { id: 10, type: "system", title: "Welcome to SavePlate", msg: "Thanks for joining! Start by adding your first food item.", time: "2 weeks ago", unread: false, icon: Info },
];

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Top Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          <button className="bg-gray-100 border border-gray-200 text-gray-900 font-medium text-sm px-4 py-1.5 rounded-md">All</button>
          <button className="text-gray-500 hover:text-gray-900 text-sm px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors">Unread</button>
          <button className="text-gray-500 hover:text-gray-900 text-sm px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors">Read</button>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          <Check className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-start gap-4 p-5 group relative ${n.unread ? "bg-gray-50" : "bg-white"}`}>
            {n.unread && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4CAF50]" />
            )}
            <div className="p-2 bg-gray-200 rounded-full shrink-0">
              <n.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm ${n.unread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                  {n.title}
                </h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{n.time}</span>
              </div>
              <p className="text-sm text-gray-600">{n.msg}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="py-12 flex flex-col items-center text-center opacity-50">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">You&rsquo;re all caught up!</p>
        <p className="text-sm text-gray-400 mt-1">No new notifications.</p>
      </div>
    </div>
  );
}
