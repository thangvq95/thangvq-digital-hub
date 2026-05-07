"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { SyncLog } from "@/lib/api/types";

const StatsBar: React.FC = () => {
  const [sync, setSync] = useState<SyncLog | null>(null);

  useEffect(() => {
    api.sync.latest().then(setSync).catch(console.error);
  }, []);

  const formatTime = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleString();
  };

  return (
    <div
      id="stats-bar"
      className="flex flex-wrap items-center gap-4 text-xs px-4 py-2 rounded-lg"
      style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
    >
      <span>Last sync: {sync ? formatTime(sync.completed_at ?? sync.started_at) : "Loading..."}</span>
      {sync && <span>Status: {sync.status}</span>}
      {sync && sync.repos_scraped > 0 && <span>{sync.repos_scraped} repos scraped</span>}
      {sync && sync.repos_new > 0 && <span>{sync.repos_new} new</span>}
    </div>
  );
};

export default StatsBar;
