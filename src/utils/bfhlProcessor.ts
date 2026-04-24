export interface ProcessRequest {
  data: string[];
}

export interface Hierarchy {
  root: string;
  tree: any;
  depth?: number;
  has_cycle?: true;
}

export interface ProcessResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: {
    total_trees: number;
    total_cycles: number;
    largest_tree_root: string;
  };
}

export function processBfhlData(data: string[]): ProcessResponse {
  const invalid_entries: string[] = [];
  const duplicate_edges: string[] = [];
  const seenEdges = new Set<string>();
  const duplicatesAdded = new Set<string>();
  const acceptedEdges: { u: string; v: string }[] = [];

  // Parse and validate
  for (const entry of data) {
    const trimmed = entry.trim();
    if (!/^[A-Z]->[A-Z]$/.test(trimmed)) {
      invalid_entries.push(trimmed);
      continue;
    }
    const u = trimmed[0];
    const v = trimmed[3];

    if (u === v) {
      invalid_entries.push(trimmed);
      continue;
    }

    if (seenEdges.has(trimmed)) {
      if (!duplicatesAdded.has(trimmed)) {
        duplicate_edges.push(trimmed);
        duplicatesAdded.add(trimmed);
      }
    } else {
      seenEdges.add(trimmed);
      acceptedEdges.push({ u, v });
    }
  }

  // Build Graph
  const parentMap = new Map<string, string>();
  const childrenMap = new Map<string, string[]>();
  const nodes = new Set<string>();

  for (const { u, v } of acceptedEdges) {
    // If diamond/multi-parent, first encountered wins, subsequent discarded silently
    if (parentMap.has(v)) continue;

    parentMap.set(v, u);
    nodes.add(u);
    nodes.add(v);

    if (!childrenMap.has(u)) childrenMap.set(u, []);
    childrenMap.get(u)!.push(v);

    if (!childrenMap.has(v)) childrenMap.set(v, []);
  }

  // Helper Union-Find
  const parentUF = new Map<string, string>();
  for (const node of nodes) {
    parentUF.set(node, node);
  }
  function find(i: string): string {
    if (parentUF.get(i) !== i) {
      parentUF.set(i, find(parentUF.get(i)!));
    }
    return parentUF.get(i)!;
  }
  function union(i: string, j: string) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parentUF.set(rootI, rootJ);
    }
  }

  for (const [child, parent] of parentMap.entries()) {
    union(child, parent);
  }

  // Groups
  const components = new Map<string, string[]>();
  for (const node of nodes) {
    const leader = find(node);
    if (!components.has(leader)) {
      components.set(leader, []);
    }
    components.get(leader)!.push(node);
  }

  const hierarchies: Hierarchy[] = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = "";
  let max_depth = -1;

  for (const groupNodes of components.values()) {
    // Find roots in this group (nodes without a parent)
    const roots = groupNodes.filter((node) => !parentMap.has(node));

    if (roots.length === 0) {
      // Cyclic Group
      const sortedNodes = [...groupNodes].sort();
      const root = sortedNodes[0]; // Lexicographically smallest
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      total_cycles++;
    } else {
      // For groups connected by max-1 in-degree, they must have exactly 1 root if ANY roots exist
      const root = roots[0];
      const { tree, depth } = buildNestedTree(root, childrenMap);
      hierarchies.push({
        root,
        tree,
        depth,
      });
      total_trees++;

      if (depth > max_depth) {
        max_depth = depth;
        largest_tree_root = root;
      } else if (depth === max_depth) {
        if (root < largest_tree_root) {
          largest_tree_root = root;
        }
      }
    }
  }

  return {
    user_id: "pvarnika_17091999", // generic or matching standard
    email_id: "pvarnika05@gmail.com",
    college_roll_number: "SRM12345", 
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root: largest_tree_root || "N/A"
    }
  };
}

function buildNestedTree(root: string, childrenMap: Map<string, string[]>): { tree: any, depth: number } {
  let depth = 1;
  const tree: any = {};
  
  let maxPathSub = 0;
  tree[root] = {};
  
  const children = childrenMap.get(root) || [];
  for (const child of children) {
    const childResult = buildNestedForSubtree(child, childrenMap);
    tree[root][child] = childResult.node;
    if (childResult.depth > maxPathSub) {
      maxPathSub = childResult.depth;
    }
  }
  
  return { tree, depth: depth + maxPathSub };
}

function buildNestedForSubtree(node: string, childrenMap: Map<string, string[]>): { node: any, depth: number } {
  let depth = 1;
  const treeObj: any = {};
  let maxPathSub = 0;
  
  const children = childrenMap.get(node) || [];
  for (const child of children) {
    const childResult = buildNestedForSubtree(child, childrenMap);
    treeObj[child] = childResult.node;
    if (childResult.depth > maxPathSub) {
      maxPathSub = childResult.depth;
    }
  }
  
  return { node: treeObj, depth: depth + maxPathSub };
}
