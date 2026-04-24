"use client";

import { useSearchParams } from "next/navigation";
import VideoGrid from "@/components/feed/VideoGrid";
import { Search, Filter } from "lucide-react";
import { Suspense } from "react";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Search className="text-pink-500" size={28} />
            Search Results
          </h1>
          <p className="text-white/40 mt-1">
            Found results for <span className="text-white font-medium">&quot;{q}&quot;</span>
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm text-white/70">
          <Filter size={16} /> Filters
        </button>
      </div>

      <VideoGrid query={q} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-10">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}
