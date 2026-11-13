import { exportRoute, restoreRoute, routeState } from "@/features/route";
import { exportBattle, restoreBattle } from "@/features/battle";
import { exportDeck, restoreDeck } from "@/features/deck";
import { exportReward, restoreReward } from "@/features/reward";
import { exportShop, restoreShop } from "@/features/shop";
import { loadLegacy } from "@/features/legacy";
import { exportSession, restoreSession, session } from "./session";
const KEY = "ember-path-v1";
function snapshot() {
  return {
    version: 1,
    route: exportRoute(),
    battle: exportBattle(),
    deck: exportDeck(),
    reward: exportReward(),
    shop: exportShop(),
    session: exportSession(),
  };
}
export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot()));
    return true;
  } catch {
    return false;
  }
}
export function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    loadLegacy(false);
    return false;
  }
  try {
    const d = JSON.parse(raw);
    if (
      d.version !== 1 ||
      !Array.isArray(d.deck?.cards) ||
      !Array.isArray(d.route?.visited) ||
      !d.battle?.piles ||
      !Array.isArray(d.reward?.history) ||
      !Array.isArray(d.shop?.stock) ||
      !d.session
    ) {
      loadLegacy(false);
      return false;
    }
    const old = snapshot();
    try {
      restoreRoute(d.route);
      restoreBattle(d.battle);
      restoreDeck(d.deck);
      restoreReward(d.reward);
      restoreShop(d.shop);
      restoreSession(d.session);
    } catch {
      restoreRoute(old.route);
      restoreBattle(old.battle);
      restoreDeck(old.deck);
      restoreReward(old.reward);
      restoreShop(old.shop);
      restoreSession(old.session);
      loadLegacy(false);
      return false;
    }
    // 传承数据独立存放；缺失时从零开始（旅途进行中则冻结），不默认解锁任何内容
    loadLegacy(!session.ended && routeState.visited.length > 0);
    return true;
  } catch {
    loadLegacy(false);
    return false;
  }
}
export function clearSave() {
  localStorage.removeItem(KEY);
}
