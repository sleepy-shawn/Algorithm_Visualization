export type ActivePanel = 'home' | 'catalog' | 'visualizer';

// ===================== COMMON =====================
export type AlgorithmCategory = 'sorting' | 'graph' | 'search' | 'dp' | 'backtracking' | 'divide-conquer'|'vr-3d';

export type AlgorithmId =
  | 'quick-sort' | 'merge-sort' | 'bubble-sort' | 'heap-sort' | 'insertion-sort'
  | 'binary-search'
  | 'dijkstra' | 'bfs' | 'dfs' | 'prim' | 'kruskal' | 'astar'
  | 'knapsack'
  | 'n-queens'
  | 'karatsuba'
  | 'data-structure-3d';

export interface Metrics {
  comparisons: number;
  swaps: number;
  accesses: number;
  visitedNodes: number;
  pathLength: number;
  backtracks: number;
}

// ===================== SORTING =====================
export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot: number | null;
  rangeLeft: number;
  rangeRight: number;
  description: string;
  codeLine: number;
  comparisons: number;
  swaps: number;
  accesses: number;
  mergeLeft?: number[];
  mergeRight?: number[];
  mergeTarget?: number;
  phase: string;
}

// ===================== GRAPH =====================
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

export type NodeState =
  | 'unvisited' | 'in-queue' | 'visiting' | 'visited'
  | 'current' | 'path' | 'start' | 'end' | 'mst';

export type EdgeState = 'default' | 'exploring' | 'tree' | 'path' | 'mst';

export interface GraphStep {
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  distances: Record<string, number>;
  queue: string[];
  stack: string[];
  current: string | null;
  path: string[];
  description: string;
  codeLine: number;
  visitedCount: number;
  pathLength: number;
  comparisons: number;
  mstCost?: number;
  phase: string;
}

// ===================== SEARCH =====================
export interface SearchStep {
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  found: boolean | null;
  eliminated: 'left' | 'right' | null;
  description: string;
  codeLine: number;
  comparisons: number;
  phase: string;
}

// ===================== DP =====================
export interface KnapsackItem {
  name: string;
  weight: number;
  value: number;
}

export interface DPStep {
  dp: number[][];
  currentItem: number;
  currentWeight: number;
  decision: 'init' | 'skip' | 'compare' | 'take' | null;
  description: string;
  codeLine: number;
  totalValue: number;
  selectedItems: number[];
  tracePath: number[][];
  comparisons: number;
  phase: string;
}

// ===================== BACKTRACKING =====================
export interface NQueensStep {
  board: number[];
  n: number;
  currentRow: number;
  currentCol: number;
  conflicts: number[][];
  placing: number[] | null;
  removing: number[] | null;
  description: string;
  codeLine: number;
  backtracks: number;
  solutionsFound: number;
  solutions: number[][];
  phase: string;
}

// ===================== DIVIDE & CONQUER =====================
export interface DivideConquerTreeNode {
  id: string;
  parentId: string | null;
  label: string;
  x: string;
  y: string;
  result: string | null;
  depth: number;
  state: 'pending' | 'current' | 'done';
}

export interface DivideConquerStep {
  tree: DivideConquerTreeNode[];
  currentNodeId: string | null;
  phase: 'divide' | 'split' | 'base' | 'z2' | 'z0' | 'z1' | 'combine' | 'finish';
  x: string;
  y: string;
  a: string;
  b: string;
  c: string;
  d: string;
  split: number;
  z2: string;
  z1: string;
  z0: string;
  result: string;
  formula: string;
  description: string;
  codeLine: number;
  depth: number;
  multiplications: number;
  additions: number;
}

export type AnyStep = SortStep | GraphStep | SearchStep | DPStep | NQueensStep | DivideConquerStep;

// ===================== API RESPONSE =====================
export interface AlgorithmResponse<T> {
  steps: T[];
  stepCount: number;
  comparisons: number;
  extra: number;
  executionTimeMs: number;
}

// ===================== APP STATE =====================
export interface AppState {
  category: AlgorithmCategory;
  selectedAlgorithm: AlgorithmId;
  steps: AnyStep[];
  currentStep: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;

  sortArray: number[];
  searchArray: number[];
  searchTarget: number;
  graphData: GraphData;
  graphStart: string;
  graphEnd: string;
  knapsackItems: KnapsackItem[];
  knapsackCapacity: number;
  queensN: number;
  divideX: string;
  divideY: string;

  activePanel: ActivePanel;
}
