import type { UiIconName } from '../components/ui-icon/ui-icon.component';
import { AlgorithmId } from '../models/algorithm.models';

export interface AlgorithmCatalogEntry {
  id: AlgorithmId;
  label: string;
  complexity: string;
}

export interface AlgorithmCatalogGroup {
  category: string;
  icon: UiIconName;
  items: AlgorithmCatalogEntry[];
}

export const ALGORITHM_GROUPS: AlgorithmCatalogGroup[] = [
  {
    category: '排序算法',
    icon: 'sort',
    items: [
      { id: 'quick-sort', label: '快速排序', complexity: 'O(n log n)' },
      { id: 'merge-sort', label: '归并排序', complexity: 'O(n log n)' },
      { id: 'bubble-sort', label: '冒泡排序', complexity: 'O(n^2)' },
      { id: 'heap-sort', label: '堆排序', complexity: 'O(n log n)' },
      { id: 'insertion-sort', label: '插入排序', complexity: 'O(n^2)' },
    ],
  },
  {
    category: '搜索算法',
    icon: 'search',
    items: [
      { id: 'binary-search', label: '二分查找', complexity: 'O(log n)' },
      { id: 'bfs', label: 'BFS 广度优先', complexity: 'O(V+E)' },
      { id: 'dfs', label: 'DFS 深度优先', complexity: 'O(V+E)' },
    ],
  },
  {
    category: '贪心算法',
    icon: 'target',
    items: [{ id: 'astar', label: 'A* 启发式搜索', complexity: 'O(E log V)' }],
  },
  {
    category: '图算法',
    icon: 'graph',
    items: [
      { id: 'dijkstra', label: 'Dijkstra 最短路', complexity: 'O((V+E)logV)' },
      { id: 'prim', label: 'Prim 最小生成树', complexity: 'O(E log V)' },
      { id: 'kruskal', label: 'Kruskal 最小生成树', complexity: 'O(E log E)' },
    ],
  },
  {
    category: '动态规划',
    icon: 'grid',
    items: [{ id: 'knapsack', label: '0/1 背包', complexity: 'O(nW)' }],
  },
  {
    category: '回溯算法',
    icon: 'backtrack',
    items: [{ id: 'n-queens', label: 'N 皇后', complexity: 'O(n!)' }],
  },
  {
    category: '分治算法',
    icon: 'branch',
    items: [{ id: 'karatsuba', label: '大整数乘法 Karatsuba', complexity: 'O(n^1.585)' }],
  },
  {
    category: 'Web3D',
    icon: 'cube',
    items: [{ id: 'data-structure-3d', label: '3D 数据结构学习', complexity: 'Three.js' }],
  },
];
