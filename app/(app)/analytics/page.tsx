"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Calendar, HeartHandshake, Leaf, ListPlus, Target, TrendingDown, TrendingUp, UtensilsCrossed, Download } from "lucide-react";
import { getAnalytics } from "@/lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Metric = { value: number; change?: number | null; label: string };
type AnalyticsData = {
  metrics: { foodAdded: Metric; donationsMade: Metric; mealsPlanned: Metric; foodRedirected: Metric };
  activity: { label: string; added: number; donated: number; total: number }[];
  categoryBreakdown: { name: string; count: number; percentage: number }[];
  milestones: { title: string; description: string; current: number; target: number; progress: number }[];
};

const ranges = [{ value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" }, { value: "90d", label: "Last 90 days" }, { value: "12m", label: "Last 12 months" }];
const colors = ["bg-[#4CAF50]", "bg-emerald-400", "bg-lime-500", "bg-amber-400", "bg-slate-400"];

function Change({ value }: { value?: number | null }) {
  if (value === null || value === undefined) return null;
  const positive = value >= 0;
  return <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-[#2E7D32]" : "text-gray-500"}`}><>{positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}</>{positive ? "+" : ""}{value}%</span>;
}

export default function AnalyticsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState("30d");
  const [category, setCategory] = useState("All");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await getAnalytics({ range, category })); }
    catch (err: any) { setError(err.message || "Unable to load your analytics."); }
    finally { setLoading(false); }
  }, [range, category]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  const categories = useMemo(() => ["All", ...(data?.categoryBreakdown.map(({ name }) => name) || [])], [data]);

  const exportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Food Added,${data.metrics.foodAdded.value}\n`;
    csvContent += `Donations Made,${data.metrics.donationsMade.value}\n`;
    csvContent += `Meals Planned,${data.metrics.mealsPlanned.value}\n`;
    csvContent += `Community Exchanges,${data.metrics.foodRedirected.value}\n\n`;

    csvContent += "Category,Count,Percentage\n";
    data.categoryBreakdown.forEach(c => {
      csvContent += `${c.name},${c.count},${c.percentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `saveplate-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`saveplate-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const maxActivity = Math.max(...(data?.activity.map(({ total }) => total) || [1]), 1);
  const stats = data ? [
    { title: "Food Added", metric: data.metrics.foodAdded, icon: ListPlus, style: "bg-white" },
    { title: "Donations Made", metric: data.metrics.donationsMade, icon: HeartHandshake, style: "bg-white" },
    { title: "Meals Planned", metric: data.metrics.mealsPlanned, icon: UtensilsCrossed, style: "bg-white" },
    { title: "Community Exchanges", metric: data.metrics.foodRedirected, icon: Leaf, style: "bg-[#E8F5E9] border-[#4CAF50]/30" },
  ] : [];

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-xl font-semibold text-gray-900">Impact analytics</h1><p className="mt-1 text-sm text-gray-500">Your private inventory, donation, and meal-planning activity.</p></div>
      <div className="flex flex-wrap gap-2">
        {data && (
           <div className="flex gap-2 mr-4">
             <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
               <Download className="h-4 w-4 text-gray-500" /> CSV
             </button>
             <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
               <Download className="h-4 w-4 text-gray-500" /> PDF
             </button>
           </div>
        )}
        <label className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"><Calendar className="h-4 w-4 text-gray-500" /><select aria-label="Reporting range" value={range} onChange={(event) => setRange(event.target.value)} className="bg-transparent outline-none">{ranges.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"><span className="sr-only">Category</span><select aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent outline-none">{categories.map((item) => <option key={item} value={item}>{item === "All" ? "All categories" : item}</option>)}</select></label>
      </div>
    </div>

    {error && <div role="alert" className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={loadAnalytics} className="font-medium underline">Try again</button></div>}
    {loading ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />)}</div> : data && <div ref={contentRef} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(({ title, metric, icon: Icon, style }) => <div key={title} className={`rounded-xl border border-gray-200 p-5 shadow-sm ${style}`}><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-gray-500">{title}</p><div className="mt-1 flex items-end gap-2"><p className="text-3xl font-bold text-gray-900">{metric.value}</p><Change value={metric.change} /></div><p className="mt-1 text-xs text-gray-500">{metric.label}</p></div><Icon className="h-5 w-5 text-[#4CAF50]" /></div></div>)}</div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-3"><header className="border-b border-gray-100 px-5 py-4"><h2 className="font-semibold text-gray-900">Activity over time</h2><p className="mt-0.5 text-xs text-gray-500">Items added and completed donations.</p></header><div className="h-64 p-5"><div className="flex h-full items-end gap-1 border-b border-l border-gray-200 pb-5 pl-2">{data.activity.map((item) => <div key={item.label} title={`${item.label}: ${item.added} added, ${item.donated} donated`} className="group flex h-full flex-1 flex-col justify-end"><div className="min-h-1 rounded-t-sm bg-[#4CAF50] transition-opacity group-hover:opacity-80" style={{ height: `${Math.max((item.added / maxActivity) * 100, item.added ? 4 : 0)}%` }} /><div className="min-h-0.5 bg-emerald-200" style={{ height: `${Math.max((item.donated / maxActivity) * 100, item.donated ? 3 : 0)}%` }} /></div>)}</div><div className="mt-2 flex justify-between gap-1 overflow-hidden text-[10px] text-gray-400">{data.activity.map((item) => <span key={item.label} className="min-w-0 truncate">{item.label}</span>)}</div></div></section>
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2"><header className="border-b border-gray-100 px-5 py-4"><h2 className="font-semibold text-gray-900">Category breakdown</h2><p className="mt-0.5 text-xs text-gray-500">Items added in this period.</p></header><div className="space-y-3 p-5">{data.categoryBreakdown.length ? data.categoryBreakdown.map((item, index) => <div key={item.name}><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-gray-700">{item.name}</span><span className="text-gray-500">{item.count} · {item.percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${colors[index % colors.length]}`} style={{ width: `${item.percentage}%` }} /></div></div>) : <p className="py-10 text-center text-sm text-gray-500">Add inventory items to see category trends.</p>}</div></section>
      </div>
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm"><header className="border-b border-gray-100 px-5 py-4"><h2 className="font-semibold text-gray-900">Sustainability milestones</h2><p className="mt-0.5 text-xs text-gray-500">Progress is based on activity in the selected period.</p></header><div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-3">{data.milestones.map((milestone) => <div key={milestone.title} className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5E9]"><Target className="h-6 w-6 text-[#2E7D32]" /></div><h3 className="text-sm font-semibold text-gray-900">{milestone.title}</h3><p className="mt-1 text-xs text-gray-500">{milestone.description}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${milestone.progress}%` }} /></div><p className="mt-1 text-xs text-gray-500">{milestone.current} / {milestone.target} · {milestone.progress}% complete</p></div>)}</div></section>
    </div>}
  </div>;
}
