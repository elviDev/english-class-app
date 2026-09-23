"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EMOJI_CATEGORIES } from "@/lib/emoji-data";

export function EmojiPicker({ onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJI_CATEGORIES;
    return EMOJI_CATEGORIES.map((category) => ({
      ...category,
      emojis: category.emojis.filter(([, keywords]) => keywords.includes(q)),
    })).filter((category) => category.emojis.length > 0);
  }, [query]);

  return (
    <div className="w-72 rounded-2xl border border-line bg-paper p-3 shadow-lg">
      <div className="relative mb-2">
        <Search
          size={14}
          strokeWidth={2}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emoji…"
          className="w-full rounded-lg border border-line bg-cream py-1.5 pl-8 pr-2.5 text-sm text-ink outline-none focus:border-gold"
        />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted">No emoji found.</p>}
        {filtered.map((category) => (
          <div key={category.name} className="mb-2">
            <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{category.name}</p>
            <div className="grid grid-cols-8 gap-0.5">
              {category.emojis.map(([emoji]) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-hover"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
