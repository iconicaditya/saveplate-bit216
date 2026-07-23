import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-10 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/saveplate-logo.png" alt="SavePlate" width={24} height={24} className="object-contain" />
          <span className="font-bold text-gray-900">SavePlate</span>
        </div>
        <nav className="flex gap-6 text-sm text-gray-500" aria-label="Footer navigation">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </nav>
        <p className="text-sm text-gray-400">© 2025 SavePlate. All rights reserved.</p>
      </div>
    </footer>
  );
}
