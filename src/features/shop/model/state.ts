import { reactive, readonly } from "vue";
import type { JourneyContext, Purchase } from "@/shared/domain";
import { makeStock, type StockItem } from "../lib/stock";
import { priceFor } from "../lib/pricing";
export interface ShopMods {
  slots: number;
  rare: boolean;
  discount: number;
  notes: string[];
}
const defaultMods = (): ShopMods => ({
  slots: 0,
  rare: false,
  discount: 0,
  notes: [],
});
const state = reactive({
  context: null as JourneyContext | null,
  stock: [] as StockItem[],
  purchases: [] as Purchase[],
  open: false,
  mods: defaultMods() as ShopMods,
});
export const shopState = readonly(state);
export function openShop(c: JourneyContext, mods?: ShopMods) {
  if (state.context?.nodeId !== c.nodeId) {
    state.context = c;
    state.mods = mods ?? defaultMods();
    state.stock = makeStock(c, state.mods);
  }
  state.open = true;
}
export function itemPrice(id: string) {
  const item = state.stock.find((s) => s.id === id);
  return item && state.context
    ? priceFor(item.basePrice, state.context.influence, state.mods.discount)
    : Infinity;
}
export function preparePurchase(id: string): Purchase | null {
  const item = state.stock.find((s) => s.id === id);
  if (!state.open || !item || item.sold) return null;
  return { id: item.id, card: item.card, price: itemPrice(id) };
}
export function completePurchase(p: Purchase) {
  const item = state.stock.find((s) => s.id === p.id);
  if (!item || item.sold) return false;
  item.sold = true;
  state.purchases.push(p);
  return true;
}
export function closeShop() {
  state.open = false;
}
export function exportShop() {
  return JSON.parse(JSON.stringify(state));
}
export function restoreShop(d: ReturnType<typeof exportShop>) {
  Object.assign(state, d);
  state.mods = { ...defaultMods(), ...(d.mods ?? {}) };
}
export function resetShop() {
  state.context = null;
  state.stock = [];
  state.purchases = [];
  state.open = false;
  state.mods = defaultMods();
}
