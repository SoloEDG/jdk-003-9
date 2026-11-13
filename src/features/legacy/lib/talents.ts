export type TalentCategory = "deck" | "passive" | "route" | "shop" | "reward";
export interface TalentDef {
  id: string;
  category: TalentCategory;
  name: string;
  maxRank: number;
  cost: number;
  effect: (rank: number) => string;
}
export const CATEGORY_LABELS: Record<TalentCategory, string> = {
  deck: "开局牌组",
  passive: "战斗被动",
  route: "路线解锁",
  shop: "商店权限",
  reward: "奖励池",
};
export const TALENTS: TalentDef[] = [
  {
    id: "deck-twin-strike",
    category: "deck",
    name: "双生余烬",
    maxRank: 2,
    cost: 1,
    effect: (r) => `开局牌组额外加入 ${r} 张「余烬斩」`,
  },
  {
    id: "deck-spore",
    category: "deck",
    name: "孢子行囊",
    maxRank: 1,
    cost: 1,
    effect: () => "开局牌组额外加入 1 张「孢子飞刃」",
  },
  {
    id: "deck-tempered",
    category: "deck",
    name: "淬火开刃",
    maxRank: 1,
    cost: 2,
    effect: () => "开局时所有「余烬斩」已强化",
  },
  {
    id: "passive-ward",
    category: "passive",
    name: "余烬护幕",
    maxRank: 2,
    cost: 1,
    effect: (r) => `每场战斗开始获得 ${r * 5} 格挡`,
  },
  {
    id: "passive-surge",
    category: "passive",
    name: "燃志",
    maxRank: 2,
    cost: 2,
    effect: (r) => `每场战斗开始力量 +${r}`,
  },
  {
    id: "passive-flow",
    category: "passive",
    name: "余能回流",
    maxRank: 1,
    cost: 2,
    effect: () => "每场战斗首回合能量 +1",
  },
  {
    id: "route-forest",
    category: "route",
    name: "林地秘径",
    maxRank: 1,
    cost: 1,
    effect: () => "苔光林地出现隐藏篝火「苔光圣坛」",
  },
  {
    id: "route-forge",
    category: "route",
    name: "黑市信物",
    maxRank: 1,
    cost: 1,
    effect: () => "熔铁边境出现黑市商店「黑市熔炉」",
  },
  {
    id: "route-abyss",
    category: "route",
    name: "深渊裂标",
    maxRank: 1,
    cost: 2,
    effect: () => "无声深渊出现高威胁精英「深渊裂隙」",
  },
  {
    id: "shop-catalog",
    category: "shop",
    name: "游商密约",
    maxRank: 1,
    cost: 1,
    effect: () => "商店库存 +1 件",
  },
  {
    id: "shop-rare",
    category: "shop",
    name: "珍品预订",
    maxRank: 1,
    cost: 1,
    effect: () => "商店必含至少 1 张稀有牌",
  },
  {
    id: "shop-bargain",
    category: "shop",
    name: "旧日人情",
    maxRank: 2,
    cost: 1,
    effect: (r) => `商店价格 −${r * 6} 金`,
  },
  {
    id: "reward-rare",
    category: "reward",
    name: "猎宝直觉",
    maxRank: 1,
    cost: 2,
    effect: () => "战斗奖励始终使用稀有奖励池",
  },
  {
    id: "reward-tithe",
    category: "reward",
    name: "余烬税赋",
    maxRank: 2,
    cost: 1,
    effect: (r) => `战斗结算金币 +${r * 8}`,
  },
  {
    id: "reward-mend",
    category: "reward",
    name: "缝补行囊",
    maxRank: 1,
    cost: 1,
    effect: () => "战斗胜利额外回复 3 生命",
  },
];
export function talentById(id: string) {
  return TALENTS.find((t) => t.id === id);
}
export function talentName(id: string) {
  return talentById(id)?.name ?? id;
}
export function spentOn(alloc: Record<string, number>) {
  return TALENTS.reduce((sum, t) => sum + (alloc[t.id] ?? 0) * t.cost, 0);
}
export interface LegacyMods {
  deck: { add: string[]; upgradeKeys: string[] };
  battle: { block: number; strength: number; energy: number };
  routeTalents: string[];
  shop: { slots: number; rare: boolean; discount: number };
  reward: { alwaysRare: boolean; gold: number; heal: number };
}
export function modsFor(alloc: Record<string, number>): LegacyMods {
  const r = (id: string) => alloc[id] ?? 0;
  return {
    deck: {
      add: [
        ...Array.from({ length: r("deck-twin-strike") }, () => "strike"),
        ...Array.from({ length: r("deck-spore") }, () => "venom"),
      ],
      upgradeKeys: r("deck-tempered") ? ["strike"] : [],
    },
    battle: {
      block: r("passive-ward") * 5,
      strength: r("passive-surge"),
      energy: r("passive-flow") ? 1 : 0,
    },
    routeTalents: ["route-forest", "route-forge", "route-abyss"].filter(
      (id) => r(id) > 0,
    ),
    shop: {
      slots: r("shop-catalog"),
      rare: r("shop-rare") > 0,
      discount: r("shop-bargain") * 6,
    },
    reward: {
      alwaysRare: r("reward-rare") > 0,
      gold: r("reward-tithe") * 8,
      heal: r("reward-mend") * 3,
    },
  };
}
export function notesFor(
  alloc: Record<string, number>,
  category: TalentCategory,
): string[] {
  return TALENTS.filter(
    (t) => t.category === category && (alloc[t.id] ?? 0) > 0,
  ).map((t) => `${t.name} · ${t.effect(alloc[t.id]!)}`);
}
