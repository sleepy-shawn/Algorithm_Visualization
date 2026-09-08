import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlgorithmStore } from '../../store/algorithm.store';
import { GraphStep, GraphNode, GraphEdge } from '../../models/algorithm.models';
import { CodePanelComponent } from '../../components/code-panel/code-panel.component';

interface RenderEdge extends GraphEdge {
  x1: number; y1: number; x2: number; y2: number;
  midX: number; midY: number; state: string; index: number;
}
interface RenderNode extends GraphNode { state: string; }

@Component({
  selector: 'app-graph-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePanelComponent],
  templateUrl: './graph-visualizer.component.html',
})
export class GraphVisualizerComponent {
  @Input() source: 'primary' | 'compare' = 'primary';

  /** 与 GraphService.dijkstra() 的 codeLine 1-5 对应。 */
  readonly dijkstraPseudoCode = [
    '初始化：dist[start] = 0，其余节点距离为 ∞',
    '选择距离最小的未访问节点 u',
    '遍历 u 的每一条相邻边 (u, v)',
    '若经过 u 更短：更新 dist[v] 与前驱节点',
    '从终点沿前驱节点回溯最短路径',
  ];
  newNodeId = '';
  newEdgeFrom = '';
  newEdgeTo = '';
  newEdgeWeight = 1;

  selectedNodeId: string | null = null;
  selectedEdgeIndex: number | null = null;
  editNodeId = '';
  editNodeLabel = '';
  editEdgeFrom = '';
  editEdgeTo = '';
  editEdgeWeight = 1;
  editorMessage = '';

  step = computed(() => {
    const data = this.source === 'primary'
      ? this.store.currentStepData()
      : this.store.compareCurrentStepData();
    return data as GraphStep | null;
  });

  algorithmId = computed(() =>
    this.source === 'primary' ? this.store.selectedAlgo() : this.store.compareAlgo()
  );

  isDijkstra = computed(() => this.algorithmId() === 'dijkstra');

  nodes = computed<RenderNode[]>(() => {
    const s = this.step();
    return this.store.graphData().nodes.map(n => ({
      ...n,
      state: s?.nodeStates[n.id] ?? 'unvisited',
    }));
  });

  edges = computed<RenderEdge[]>(() => {
    const s = this.step();
    const g = this.store.graphData();
    return g.edges.map((e, index) => {
      const from = g.nodes.find(n => n.id === e.from)!;
      const to   = g.nodes.find(n => n.id === e.to)!;
      return {
        ...e,
        x1: from.x, y1: from.y, x2: to.x, y2: to.y,
        midX: (from.x + to.x) / 2,
        midY: (from.y + to.y) / 2,
        index,
        state: s?.edgeStates[`${e.from}-${e.to}`] ?? 'default',
      };
    });
  });

  constructor(public store: AlgorithmStore) {}

  nodeColor(state: string): string {
    const map: Record<string, string> = {
      start: '#3b82f6', end: '#f59e0b', current: '#a855f7',
      visiting: '#a855f7', 'in-queue': '#f59e0b', visited: '#10b981',
      path: '#22c55e', mst: '#10b981',
    };
    return map[state] ?? '#1e293b';
  }

  edgeColor(state: string): string {
    const map: Record<string, string> = { exploring: '#f59e0b', tree: '#3b82f6', path: '#22c55e', mst: '#10b981' };
    return map[state] ?? '#334155';
  }

  edgeWidth(state: string): number {
    return ['path', 'mst', 'tree'].includes(state) ? 3 : 1.5;
  }

  visitedRatio = computed(() => {
    const s = this.step();
    const total = this.store.graphData().nodes.length;
    if (!s || total === 0) return 0;
    return Math.round((s.visitedCount / total) * 100);
  });

  trackById(i: number, n: { id: string }) { return n.id; }
  trackByEdge(i: number) { return i; }

  selectNode(node: RenderNode, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedNodeId = node.id;
    this.selectedEdgeIndex = null;
    this.editNodeId = node.id;
    this.editNodeLabel = node.label;
    this.editorMessage = '';
  }

  selectEdge(edge: RenderEdge, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedEdgeIndex = edge.index;
    this.selectedNodeId = null;
    this.editEdgeFrom = edge.from;
    this.editEdgeTo = edge.to;
    this.editEdgeWeight = edge.weight;
    this.editorMessage = '';
  }

  clearSelection(): void {
    this.selectedNodeId = null;
    this.selectedEdgeIndex = null;
    this.editorMessage = '';
  }

  addNode(): void {
    const id = this.normalizeId(this.newNodeId);
    const graph = this.store.graphData();
    if (!id) {
      this.editorMessage = '请输入节点名称。';
      return;
    }
    if (graph.nodes.some(n => n.id === id)) {
      this.editorMessage = `节点 ${id} 已存在。`;
      return;
    }

    const position = this.findAvailableNodePosition(graph.nodes);
    const node: GraphNode = {
      id,
      label: id,
      x: position.x,
      y: position.y,
    };

    this.setGraphDataAndRefresh({
      ...graph,
      nodes: [...graph.nodes, node],
    });
    if (!this.store.graphStart()) this.store.setGraphStart(id);
    if (!this.store.graphEnd()) this.store.setGraphEnd(id);
    this.newNodeId = '';
    this.editorMessage = `已添加节点 ${id}。`;
  }

  addEdge(): void {
    const graph = this.store.graphData();
    const from = this.newEdgeFrom || graph.nodes[0]?.id;
    const to = this.newEdgeTo || graph.nodes[1]?.id;
    const weight = this.validWeight(this.newEdgeWeight);

    if (!from || !to || from === to) {
      this.editorMessage = '请选择两个不同的节点。';
      return;
    }
    if (weight === null) {
      this.editorMessage = '请输入有效权重。';
      return;
    }
    if (this.edgeExists(from, to)) {
      this.editorMessage = `边 ${from}-${to} 已存在。`;
      return;
    }

    this.setGraphDataAndRefresh({
      ...graph,
      edges: [...graph.edges, { from, to, weight }],
    });
    this.newEdgeWeight = 1;
    this.editorMessage = `已添加边 ${from}-${to}。`;
  }

  updateNode(): void {
    if (!this.selectedNodeId) return;
    const oldId = this.selectedNodeId;
    const nextId = this.normalizeId(this.editNodeId);
    const label = this.editNodeLabel.trim() || nextId;
    const graph = this.store.graphData();

    if (!nextId) {
      this.editorMessage = '节点名称不能为空。';
      return;
    }
    if (nextId !== oldId && graph.nodes.some(n => n.id === nextId)) {
      this.editorMessage = `节点 ${nextId} 已存在。`;
      return;
    }

    if (this.store.graphStart() === oldId) this.store.setGraphStart(nextId);
    if (this.store.graphEnd() === oldId) this.store.setGraphEnd(nextId);
    this.setGraphDataAndRefresh({
      ...graph,
      nodes: graph.nodes.map(n => n.id === oldId ? { ...n, id: nextId, label } : n),
      edges: graph.edges.map(e => ({
        ...e,
        from: e.from === oldId ? nextId : e.from,
        to: e.to === oldId ? nextId : e.to,
      })),
    });
    this.selectedNodeId = nextId;
    this.editorMessage = `已更新节点 ${nextId}。`;
  }

  deleteNode(): void {
    if (!this.selectedNodeId) return;
    const id = this.selectedNodeId;
    const graph = this.store.graphData();
    const remainingNodes = graph.nodes.filter(n => n.id !== id);

    if (this.store.graphStart() === id) this.store.setGraphStart(remainingNodes[0]?.id ?? '');
    if (this.store.graphEnd() === id) this.store.setGraphEnd(remainingNodes.at(-1)?.id ?? '');
    this.setGraphDataAndRefresh({
      ...graph,
      nodes: remainingNodes,
      edges: graph.edges.filter(e => e.from !== id && e.to !== id),
    });
    this.selectedNodeId = null;
    this.editorMessage = `已删除节点 ${id}。`;
  }

  updateEdge(): void {
    if (this.selectedEdgeIndex === null) return;
    const graph = this.store.graphData();
    const weight = this.validWeight(this.editEdgeWeight);
    const from = this.editEdgeFrom;
    const to = this.editEdgeTo;

    if (!from || !to || from === to) {
      this.editorMessage = '请选择两个不同的节点。';
      return;
    }
    if (weight === null) {
      this.editorMessage = '请输入有效权重。';
      return;
    }
    if (graph.edges.some((e, i) => i !== this.selectedEdgeIndex && this.isSameEdge(e.from, e.to, from, to))) {
      this.editorMessage = `边 ${from}-${to} 已存在。`;
      return;
    }

    this.setGraphDataAndRefresh({
      ...graph,
      edges: graph.edges.map((e, i) => i === this.selectedEdgeIndex ? { ...e, from, to, weight } : e),
    });
    this.editorMessage = `已更新边 ${from}-${to}。`;
  }

  deleteEdge(): void {
    if (this.selectedEdgeIndex === null) return;
    const graph = this.store.graphData();
    const edge = graph.edges[this.selectedEdgeIndex];

    this.setGraphDataAndRefresh({
      ...graph,
      edges: graph.edges.filter((_, i) => i !== this.selectedEdgeIndex),
    });
    this.selectedEdgeIndex = null;
    this.editorMessage = edge ? `已删除边 ${edge.from}-${edge.to}。` : '已删除边。';
  }

  isNodeSelected(id: string): boolean {
    return this.selectedNodeId === id;
  }

  isEdgeSelected(index: number): boolean {
    return this.selectedEdgeIndex === index;
  }

  private normalizeId(id: string): string {
    return id.trim().replace(/\s+/g, '_');
  }

  private validWeight(weight: number): number | null {
    const value = Number(weight);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private setGraphDataAndRefresh(graph: { nodes: GraphNode[]; edges: GraphEdge[]; directed: boolean; weighted: boolean }): void {
    const shouldRefreshSteps = this.store.category() === 'graph' && this.store.totalSteps() > 0;
    this.store.setGraphData(graph);
    if (shouldRefreshSteps && this.canRunGraph(graph)) {
      this.store.runAlgorithm();
    }
  }

  private canRunGraph(graph: { nodes: GraphNode[]; edges: GraphEdge[] }): boolean {
    const ids = new Set(graph.nodes.map(n => n.id));
    return graph.nodes.length > 0
      && ids.has(this.store.graphStart())
      && ids.has(this.store.graphEnd());
  }

  private findAvailableNodePosition(nodes: GraphNode[]): { x: number; y: number } {
    const minDistance = 58;
    if (nodes.length === 0) {
      return { x: 300, y: 160 };
    }

    const margin = 64;
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const candidates: { x: number; y: number }[] = [];

    const clampX = (x: number) => Math.max(40, Math.min(560, Math.round(x)));
    const clampY = (y: number) => Math.max(40, Math.min(280, Math.round(y)));
    const add = (x: number, y: number) => candidates.push({ x: clampX(x), y: clampY(y) });

    const top = minY - margin;
    const right = maxX + margin;
    const bottom = maxY + margin;
    const left = minX - margin;
    const xSlots = [centerX, minX, maxX, (minX + centerX) / 2, (centerX + maxX) / 2];
    const ySlots = [centerY, minY, maxY, (minY + centerY) / 2, (centerY + maxY) / 2];

    for (const x of xSlots) {
      add(x, top);
      add(x, bottom);
    }
    for (const y of ySlots) {
      add(right, y);
      add(left, y);
    }

    for (let offset = margin + 40; offset <= 220; offset += 45) {
      for (const x of xSlots) {
        add(x, minY - offset);
        add(x, maxY + offset);
      }
      for (const y of ySlots) {
        add(maxX + offset, y);
        add(minX - offset, y);
      }
    }

    return candidates.find(pos => this.isOutsideGraphBounds(pos, minX, maxX, minY, maxY) && this.isFarEnough(pos, nodes, minDistance))
      ?? { x: 300, y: 160 };
  }

  private isOutsideGraphBounds(
    pos: { x: number; y: number },
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): boolean {
    return pos.x < minX || pos.x > maxX || pos.y < minY || pos.y > maxY;
  }

  private isFarEnough(pos: { x: number; y: number }, nodes: GraphNode[], minDistance: number): boolean {
    return nodes.every(node => {
      const dx = node.x - pos.x;
      const dy = node.y - pos.y;
      return Math.hypot(dx, dy) >= minDistance;
    });
  }

  private edgeExists(from: string, to: string): boolean {
    return this.store.graphData().edges.some(e => this.isSameEdge(e.from, e.to, from, to));
  }

  private isSameEdge(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
    if (this.store.graphData().directed) {
      return aFrom === bFrom && aTo === bTo;
    }
    return (aFrom === bFrom && aTo === bTo) || (aFrom === bTo && aTo === bFrom);
  }
}
