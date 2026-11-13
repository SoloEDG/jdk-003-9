import type { JourneyContext } from "@/shared/domain";
import { cards } from "@/shared/cards";
import { shuffle, hash } from "@/shared/random";
export interface StockItem {
  id: string;
  card: string;
  basePrice: number;
  sold: boolean;
}
export interface StockMods {
  slots: number;
  rare: boolean;
}
export function makeStock(c: JourneyContext, mods?: StockMods): StockItem[] {
  const pool = shuffle(
    ["venom", "focus", "fury", "burst", "shelter", "guard"],
    hash(c.nodeId),
  );
  const picked = pool.slice(0, 3 + Math.max(0, mods?.slots ?? 0));
  if (mods?.rare && !picked.some((k) => cards[k]?.rarity === "rare")) {
    const rare = pool.find((k) => cards[k]?.rarity === "rare");
    if (rare) picked[picked.length - 1] = rare;
  }
  return picked.map((card, i) => ({
    id: `${c.nodeId}-stock-${i}`,
    card,
    basePrice: ["fury", "burst", "focus"].includes(card) ? 48 : 32,
    sold: false,
  }));
}
