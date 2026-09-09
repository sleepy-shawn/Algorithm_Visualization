import { TranslatePipe } from '../../i18n/translate.pipe';
import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlgorithmStore } from '../../store/algorithm.store';
import { GraphData, KnapsackItem } from '../../models/algorithm.models';
import { StructureType } from '../../visualizers/vr-3d/renderers/structure-renderer.types';

@Component({
  selector: 'app-input-config',
  standalone: true,
  imports: [TranslatePipe, UiIconComponent, CommonModule, FormsModule],
  templateUrl: './input-config.component.html',
})
export class InputConfigComponent implements OnInit {
  // ---- Sorting ----
  sortArrayInput = '';
  sortSize = 10;

  // ---- Search ----
  searchArrayInput = '';
  searchTargetInput = 7;

  // ---- Graph ----
  nodesInput = '';
  edgesInput = '';
  isDirected = false;
  isWeighted = true;
  graphStartInput = 'A';
  graphEndInput = 'F';
  private graphAutoRefreshEnabled = false;

  // ---- DP ----
  itemsInput = '';
  capacity = 8;

  // ---- N-Queens ----
  queensN = 6;

  constructor(public store: AlgorithmStore) {
    effect(() => {
      this.syncGraphInputs(this.store.graphData());
      this.graphStartInput = this.store.graphStart();
      this.graphEndInput = this.store.graphEnd();
    });
  }
  // ---- Divide & Conquer ----
  divideX = '12345678';
  divideY = '87654321';

  // ---- VR/3D ----
  vr3dInput = '';

  vr3dTypes = [
    { id: 'array' as const, label: '数组' },
    { id: 'stack' as const, label: '栈' },
    { id: 'queue' as const, label: '队列' },
    { id: 'linked-list' as const, label: '链表' },
    { id: 'binary-tree' as const, label: '二叉树' },
    { id: 'b-plus-tree' as const, label: 'B+ 树' },
  ];


  ngOnInit(): void {
    this.sortArrayInput = this.store.sortArray().join(', ');
    this.searchArrayInput = this.store.searchArray().join(', ');
    this.searchTargetInput = this.store.searchTarget();
    this.capacity = this.store.knapsackCap();
    this.queensN = this.store.queensN();
    this.syncGraphInputs(this.store.graphData());
    this.divideX = this.store.divideX();
    this.divideY = this.store.divideY();
    this.vr3dInput = this.store.vr3dData().values.join(', ');
    this.graphStartInput = this.store.graphStart();
    this.graphEndInput = this.store.graphEnd();

    this.itemsInput = this.store.knapsackItems()
      .map(i => `${i.name}:${i.weight}:${i.value}`).join(', ');
  }

  // ---- Sorting ----
  applySortArray(): void {
    const arr = this.sortArrayInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (arr.length > 0) this.store.setSortArray(arr);
  }

  randomSortArray(): void {
    const size = Math.min(Math.max(this.sortSize, 3), 30);
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
    this.store.setSortArray(arr);
    this.sortArrayInput = arr.join(', ');
  }

  // ---- Search ----
  applySearch(): void {
    let arr = this.searchArrayInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    arr = [...new Set(arr)].sort((a, b) => a - b);
    if (arr.length > 0) {
      this.store.setSearchData(arr, this.searchTargetInput);
      this.searchArrayInput = arr.join(', ');
    }
  }

  randomSearch(): void {
    const arr = Array.from({ length: 10 }, (_, i) => i * 2 + 1);
    const target = arr[Math.floor(Math.random() * arr.length)];
    this.store.setSearchData(arr, target);
    this.searchArrayInput = arr.join(', ');
    this.searchTargetInput = target;
  }

  // ---- Graph ----
  private syncGraphInputs(g: GraphData): void {
    this.nodesInput = g.nodes.map(n => n.id).join(', ');
    this.edgesInput = g.edges.map(e => `${e.from}-${e.to}:${e.weight}`).join(', ');
    this.isDirected = g.directed;
    this.isWeighted = g.weighted;
  }

  applyGraph(autoRefresh = false): void {
    const graphData = this.parseGraphInputs();
    if (!graphData) return;

    const shouldRefreshSteps = autoRefresh
      && this.store.category() === 'graph'
      && (this.store.totalSteps() > 0 || this.graphAutoRefreshEnabled);
    if (shouldRefreshSteps) {
      this.graphAutoRefreshEnabled = true;
    }
    this.store.setGraphStart(this.graphStartInput.trim());
    this.store.setGraphEnd(this.graphEndInput.trim());
    this.store.setGraphData(graphData);

    if (shouldRefreshSteps && this.canRunGraph(graphData)) {
      this.store.runAlgorithm();
    }
  }

  private parseGraphInputs(): GraphData | null {
    const nodeIds = this.nodesInput
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (nodeIds.length === 0) return null;

    const uniqueNodeIds = [...new Set(nodeIds)];
    const existingNodes = new Map(this.store.graphData().nodes.map(n => [n.id, n]));
    const nodes = uniqueNodeIds.reduce<GraphData['nodes']>((acc, id) => {
      const existing = existingNodes.get(id);
      if (existing) {
        acc.push(existing);
        return acc;
      }
      const position = this.findAvailableNodePosition(acc);
      acc.push({ id, label: id, x: position.x, y: position.y });
      return acc;
    }, []);

    const edges = this.edgesInput
      .split(/,\s*/)
      .map(s => {
        const m = s.trim().match(/^(\w+)-(\w+)(?::(\d+(?:\.\d+)?))?$/);
        if (!m) return null;
        return { from: m[1], to: m[2], weight: parseFloat(m[3] ?? '1') };
      })
      .filter((e): e is { from: string; to: string; weight: number } =>
        e !== null && uniqueNodeIds.includes(e.from) && uniqueNodeIds.includes(e.to)
      );

    return {
      nodes, edges,
      directed: this.isDirected,
      weighted: this.isWeighted,
    };
  }

  private canRunGraph(graph: GraphData): boolean {
    const ids = new Set(graph.nodes.map(n => n.id));
    return graph.nodes.length > 0
      && ids.has(this.store.graphStart())
      && ids.has(this.store.graphEnd());
  }

  private findAvailableNodePosition(nodes: GraphData['nodes']): { x: number; y: number } {
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

  private isFarEnough(pos: { x: number; y: number }, nodes: GraphData['nodes'], minDistance: number): boolean {
    return nodes.every(node => {
      const dx = node.x - pos.x;
      const dy = node.y - pos.y;
      return Math.hypot(dx, dy) >= minDistance;
    });
  }

  randomGraph(): void {
    const ids = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nodes = ids.map((id, i) => {
      const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2;
      return {
        id, label: id,
        x: Math.round(300 + 200 * Math.cos(angle)),
        y: Math.round(160 + 120 * Math.sin(angle)),
      };
    });
    const edges: { from: string; to: string; weight: number }[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        if (Math.random() < 0.45) {
          edges.push({ from: ids[i], to: ids[j], weight: Math.floor(Math.random() * 9) + 1 });
        }
      }
    }
    // Ensure basic connectivity
    for (let i = 0; i < ids.length - 1; i++) {
      const connected = edges.some(
        e => (e.from === ids[i] && e.to === ids[i + 1]) ||
             (!this.isDirected && e.from === ids[i + 1] && e.to === ids[i])
      );
      if (!connected) {
        edges.push({ from: ids[i], to: ids[i + 1], weight: Math.floor(Math.random() * 9) + 1 });
      }
    }
    const gd: GraphData = { nodes, edges, directed: this.isDirected, weighted: this.isWeighted };
    this.store.setGraphData(gd);
    this.store.setGraphStart('A');
    this.store.setGraphEnd('F');
    this.graphStartInput = 'A';
    this.graphEndInput = 'F';
    this.nodesInput = ids.join(', ');
    this.edgesInput = edges.map(e => `${e.from}-${e.to}:${e.weight}`).join(', ');
  }

  // ---- DP ----
  applyDP(): void {
    const items: KnapsackItem[] = this.itemsInput
      .split(/,\s*/)
      .map(s => {
        const parts = s.trim().split(':');
        if (parts.length < 3) return null;
        const w = parseInt(parts[1], 10);
        const v = parseInt(parts[2], 10);
        if (isNaN(w) || isNaN(v)) return null;
        return { name: parts[0].trim(), weight: w, value: v };
      })
      .filter((i): i is KnapsackItem => i !== null);
    if (items.length > 0) {
      this.store.setKnapsackItems(items, this.capacity);
    }
  }

  randomDP(): void {
    const pool = ['电脑', '手机', '平板', '相机', '书', '耳机', '键盘', '手表'];
    const n = 4 + Math.floor(Math.random() * 3);
    const items: KnapsackItem[] = Array.from({ length: n }, (_, i) => ({
      name: pool[i % pool.length],
      weight: Math.floor(Math.random() * 5) + 1,
      value: Math.floor(Math.random() * 8) + 2,
    }));
    this.capacity = 10 + Math.floor(Math.random() * 6);
    this.store.setKnapsackItems(items, this.capacity);
    this.itemsInput = items.map(i => `${i.name}:${i.weight}:${i.value}`).join(', ');
  }

  // ---- N-Queens ----
  applyQueens(): void {
    this.store.setQueensN(this.queensN);
  }

  // ---- Divide & Conquer ----
  applyDivideConquer(): void {
    const x = this.divideX.replace(/\D/g, '');
    const y = this.divideY.replace(/\D/g, '');
    if (x.length > 0 && y.length > 0) {
      this.divideX = x;
      this.divideY = y;
      this.store.setDivideNumbers(x, y);
    }
  }

  randomDivideConquer(): void {
    const makeNumber = () => {
      const len = 6 + Math.floor(Math.random() * 5);
      let value = String(Math.floor(Math.random() * 9) + 1);
      for (let i = 1; i < len; i++) {
        value += String(Math.floor(Math.random() * 10));
      }
      return value;
    };

    this.divideX = makeNumber();
    this.divideY = makeNumber();
    this.store.setDivideNumbers(this.divideX, this.divideY);
  }

  // ---- VR/3D ----
  selectVr3dStructure(type: StructureType): void {
    this.store.setVr3dStructure(type);
    this.vr3dInput = this.store.vr3dData().values.join(', ');
  }

  applyVr3dData(): void {
    const values = this.vr3dInput
      .split(/[,\s]+/)
      .map(v => v.trim())
      .filter(Boolean)
      .slice(0, 63);

    if (values.length > 0) {
      this.store.setVr3dData(values);
      this.vr3dInput = values.join(', ');
    }
  }

  randomVr3dData(): void {
    this.store.randomVr3dData();
    this.vr3dInput = this.store.vr3dData().values.join(', ');
  }

  get vr3dInputHint(): string {
    switch (this.store.vr3dStructure()) {
      case 'array':
        return '数组：输入元素序列，如 10, 20, 30, 40';
      case 'stack':
        return '栈：从栈底到栈顶输入，如 A, B, C, D';
      case 'queue':
        return '队列：从队头到队尾输入，如 A, B, C, D';
      case 'linked-list':
        return '链表：按 next 指针顺序输入，如 A, B, C, D';
      case 'binary-tree':
        return '二叉树：按层序输入，如 8, 4, 12, 2, 6, 10, 14，最多 63 个节点';
      case 'b-plus-tree':
        return 'B+ 树：输入关键字，系统每 3 个关键字生成一个叶子节点';
    }
  }

  get category() { return this.store.category(); }
}
