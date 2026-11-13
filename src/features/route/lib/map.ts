import type { RouteNode, Region, NodeKind, Influence } from "@/shared/domain";
interface HiddenNode {
  talent: string;
  region: Region;
  depth: number;
  kind: NodeKind;
  title: string;
  influence: Influence;
}
export const HIDDEN_NODES: HiddenNode[] = [
  {
    talent: "route-forest",
    region: "forest",
    depth: 2,
    kind: "camp",
    title: "苔光圣坛",
    influence: { heat: 0, favor: 1, scarcity: 0 },
  },
  {
    talent: "route-forge",
    region: "forge",
    depth: 5,
    kind: "shop",
    title: "黑市熔炉",
    influence: { heat: 1, favor: 1, scarcity: 1 },
  },
  {
    talent: "route-abyss",
    region: "abyss",
    depth: 7,
    kind: "elite",
    title: "深渊裂隙",
    influence: { heat: 2, favor: 0, scarcity: 1 },
  },
];
export function makeMap(unlockedTalents: string[] = []): RouteNode[] {
  const result: RouteNode[] = [];
  const regions: Region[] = ["forest", "forge", "abyss"];
  for (let depth = 0; depth < 9; depth++) {
    const region = regions[Math.floor(depth / 3)]!;
    for (let lane = 0; lane < 2; lane++) {
      const kind: NodeKind =
        depth === 8
          ? "boss"
          : depth % 3 === 1
            ? lane === 0
              ? "shop"
              : "camp"
            : lane === 0
              ? "battle"
              : "elite";
      result.push({
        id: `n${depth}-${lane}`,
        region,
        depth,
        lane,
        kind,
        title:
          kind === "boss"
            ? "裂隙守望者"
            : kind === "elite"
              ? "危险的捷径"
              : kind === "shop"
                ? "游商营地"
                : kind === "camp"
                  ? "熄风篝火"
                  : "失落哨站",
        influence:
          lane === 0
            ? { heat: 0, favor: 1, scarcity: 0 }
            : { heat: 1, favor: 0, scarcity: 1 },
        next: depth === 8 ? [] : [`n${depth + 1}-0`, `n${depth + 1}-1`],
      });
    }
  }
  for (const h of HIDDEN_NODES.filter((h) =>
    unlockedTalents.includes(h.talent),
  )) {
    const id = `n${h.depth}-2`;
    result.push({
      id,
      region: h.region,
      depth: h.depth,
      lane: 2,
      kind: h.kind,
      title: h.title,
      influence: h.influence,
      next: [`n${h.depth + 1}-0`, `n${h.depth + 1}-1`],
      talent: h.talent,
    });
    for (const n of result.filter((n) => n.depth === h.depth - 1))
      n.next.push(id);
  }
  return result;
}
