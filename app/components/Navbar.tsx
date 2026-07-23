import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 md:px-10 sticky top-0 bg-white z-30">
      <div className="flex items-center gap-2">
        <Image src="/saveplate-logo.png" alt="SavePlate" width={32} height={32} className="object-contain" priority />
        <span className="font-bold text-lg tracking-tight">SavePlate</span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600" aria-label="Main navigation">
        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
        <a href="#benefits" className="hover:text-gray-900 transition-colors">Benefits</a>
      </nav>
      <div className="flex gap-3">
        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
        <Link href="/register" className="text-sm font-medium bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#3d8c40] transition-colors">Register</Link>
      </div>
    </header>
  );
}
