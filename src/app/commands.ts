import { enterRoute, resolveRoute, resetRoute, routeState } from "@/features/route";
import {
  battleState,
  beginBattle,
  playCard,
  endTurn,
  resetBattle,
} from "@/features/battle";
import {
  deckState,
  deckCards,
  addCard,
  earnGold,
  spendGold,
  setHp,
  heal,
  upgradeCard,
  removeCard,
  openCamp,
  useCamp,
  resetDeck,
  starterWith,
} from "@/features/deck";
import { openReward, claimReward, resetReward } from "@/features/reward";
import {
  openShop,
  preparePurchase,
  completePurchase,
  closeShop,
  resetShop,
  shopState,
} from "@/features/shop";
import {
  committedMods,
  committedNotes,
  allocatedCount,
  freezeLegacy,
  unfreezeLegacy,
  grantForRun,
} from "@/features/legacy";
import {
  session,
  switchTab,
  setContext,
  notify,
  finishRun,
  resetSession,
} from "./session";
import { save, clearSave } from "./persistence";
function persist() {
  if (!save()) notify("本地保存失败，请保留当前页面。");
}
export function navigate(id: string) {
  if (session.ended) return;
  const c = enterRoute(id);
  if (!c) return;
  setContext(c);
  if (c.kind === "shop") {
    openShop(c, { ...committedMods().shop, notes: committedNotes("shop") });
    switchTab("shop");
  } else if (c.kind === "camp") {
    openCamp();
    switchTab("deck");
  } else {
    beginBattle(c, deckCards(), deckState.hero.hp, deckState.hero.maxHp, {
      ...committedMods().battle,
      notes: committedNotes("passive"),
    });
    switchTab("battle");
  }
  notify(
    `进入 ${c.nodeId} · 威胁 ${c.influence.heat} / 好感 ${c.influence.favor}`,
  );
  persist();
}
export function play(id: string) {
  playCard(id);
  persist();
}
export function turn() {
  endTurn();
  persist();
}
export function settle() {
  const r = battleState.result;
  if (!r) return;
  if (!r.won) {
    setHp(r.hp);
    unfreezeLegacy();
    finishRun();
    notify("这次旅途已经结束。传承天赋已解冻，可整备后重新启程。");
    persist();
    return;
  }
  if (
    openReward(JSON.parse(JSON.stringify(r)), {
      ...committedMods().reward,
      notes: committedNotes("reward"),
    })
  ) {
    setHp(r.hp);
    switchTab("reward");
    notify("胜利！选择一张牌或跳过卡牌，金币都会结算。");
  }
  persist();
}
export function claim(skip: boolean) {
  const grant = claimReward(skip);
  if (!grant) return;
  if (grant.card) addCard(grant.card);
  earnGold(grant.gold);
  heal(grant.heal);
  resolveRoute();
  if (session.context?.kind === "boss") {
    const legacy = grantForRun(session.runId, {
      visited: routeState.visited.length,
      elites: routeState.visited.filter(
        (id) => routeState.nodes.find((n) => n.id === id)?.kind === "elite",
      ).length,
      heat: routeState.influence.heat,
      favor: routeState.influence.favor,
      hp: deckState.hero.hp,
      maxHp: deckState.hero.maxHp,
      purchases: shopState.purchases.length,
    });
    unfreezeLegacy();
    finishRun();
    notify(
      legacy
        ? `裂隙已被封存。${legacy.milestones.length} 项里程碑化为 ${legacy.points} 传承点，可在「传承」中分配。`
        : "裂隙已被封存。你把余烬带回了黎明。",
    );
    switchTab("legacy");
  } else {
    notify("奖励已结算，新的路线开放。");
    switchTab("route");
  }
  persist();
}
export function buy(id: string) {
  const p = preparePurchase(id);
  if (!p || !spendGold(p.price)) {
    notify("无法购买：库存或金币不足。");
    return;
  }
  if (!completePurchase(p)) {
    earnGold(p.price);
    return;
  }
  addCard(p.card);
  notify("交易完成，卡牌已收入牌组。");
  persist();
}
export function leaveShop() {
  closeShop();
  resolveRoute();
  switchTab("route");
  persist();
}
export function camp(action: "rest" | "upgrade") {
  if (
    !session.context ||
    session.context.kind !== "camp" ||
    !useCamp(action, session.context.influence.heat)
  )
    return;
  resolveRoute();
  notify("篝火逐渐熄灭，你准备好继续上路。");
  persist();
}
export function upgrade(id: string) {
  if (battleState.phase === "playing") return;
  notify(upgradeCard(id) ? "卡牌强化完成。" : "无法强化：金币不足或已经强化。");
  persist();
}
export function remove(id: string) {
  if (battleState.phase === "playing") return;
  notify(
    removeCard(id)
      ? "已移除卡牌。"
      : "无法移除：至少保留五张牌，且需要足够金币。",
  );
  persist();
}
export function restart() {
  const mods = committedMods();
  const notes = committedNotes("deck");
  resetRoute(mods.routeTalents);
  resetBattle();
  resetDeck(starterWith(mods.deck), notes);
  resetReward();
  resetShop();
  resetSession();
  freezeLegacy();
  const count = allocatedCount();
  notify(
    count
      ? `新的火种已点燃，${count} 项传承天赋随你同行。`
      : "新的火种已点燃。",
  );
  clearSave();
  persist();
}
