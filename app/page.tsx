import Link from "next/link";
import { ArrowRight, Box, HeartHandshake, Calendar, BarChart2, CheckCircle2 } from "lucide-react";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: Box, title: "Smart Inventory", desc: "Track expiry dates and get alerts before food goes bad." },
  { icon: HeartHandshake, title: "Donate Food", desc: "Share surplus food with neighbours and local charities." },
  { icon: Calendar, title: "Meal Planner", desc: "AI-powered weekly plans built from what you already have." },
  { icon: BarChart2, title: "Impact Analytics", desc: "See how much food, money, and CO₂ you've saved." },
];

const benefits = [
  "Reduce household food waste by up to 40%",
  "Save £50+ per month on grocery bills",
  "Earn sustainability badges and community recognition",
  "Help local food banks and neighbours in need",
];

const steps = [
  { step: "01", title: "Add Your Food", desc: "Scan barcodes or manually add items from your fridge, pantry, and freezer with expiry dates." },
  { step: "02", title: "Get Smart Alerts", desc: "Receive timely notifications when items are nearing expiry so nothing gets forgotten." },
  { step: "03", title: "Act & Impact", desc: "Cook from your inventory, donate surplus food, and track your sustainability score." },
];

const stats = [
  { value: "40%", label: "Less food wasted" },
  { value: "£50+", label: "Saved per month" },
  { value: "10k+", label: "Active households" },
  { value: "2.8t", label: "CO₂ saved this year" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />
      <Hero />

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Reduce Food Waste</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A complete toolkit for managing your food sustainably and efficiently.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center mb-4" aria-hidden="true">
                  <f.icon className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6" aria-labelledby="how-heading">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="how-heading" className="text-3xl font-bold text-gray-900 mb-4">How SavePlate Works</h2>
            <p className="text-gray-500">Three simple steps to a more sustainable kitchen.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-[#4CAF50] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4" aria-hidden="true">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-6 bg-[#4CAF50]/5 border-y border-[#4CAF50]/10" aria-labelledby="benefits-heading">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 id="benefits-heading" className="text-3xl font-bold text-gray-900 mb-6">Why 10,000+ Households Choose SavePlate</h2>
            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4CAF50] mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/register" className="inline-flex items-center gap-2 bg-[#4CAF50] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3d8c40] transition-colors">
                Join for Free <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#4CAF50] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}