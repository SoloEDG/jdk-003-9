export interface RunStats {
  visited: number;
  elites: number;
  heat: number;
  favor: number;
  hp: number;
  maxHp: number;
  purchases: number;
}
export interface Milestone {
  id: string;
  label: string;
  points: number;
}
interface MilestoneDef extends Milestone {
  test: (s: RunStats) => boolean;
}
export const MILESTONES: MilestoneDef[] = [
  {
    id: "ms-boss",
    label: "封存裂隙 · 击败终点守望者",
    points: 1,
    test: () => true,
  },
  {
    id: "ms-journey",
    label: "完整旅途 · 走完九段路线",
    points: 1,
    test: (s) => s.visited >= 9,
  },
  {
    id: "ms-heat",
    label: "烈焰之路 · 威胁达到 4",
    points: 1,
    test: (s) => s.heat >= 4,
  },
  {
    id: "ms-favor",
    label: "商路人情 · 好感达到 3",
    points: 1,
    test: (s) => s.favor >= 3,
  },
  {
    id: "ms-elite",
    label: "精英猎手 · 击败 2 名精英",
    points: 1,
    test: (s) => s.elites >= 2,
  },
  {
    id: "ms-survivor",
    label: "余烬未熄 · 通关时生命过半",
    points: 1,
    test: (s) => s.hp * 2 >= s.maxHp,
  },
  {
    id: "ms-trade",
    label: "首笔交易 · 完成 1 次购买",
    points: 1,
    test: (s) => s.purchases >= 1,
  },
  {
    id: "ms-merchant",
    label: "老主顾 · 累计 3 次购买",
    points: 1,
    test: (s) => s.purchases >= 3,
  },
];
export function evaluateMilestones(s: RunStats): Milestone[] {
  return MILESTONES.filter((m) => m.test(s)).map(
    ({ id, label, points }) => ({ id, label, points }),
  );
}
