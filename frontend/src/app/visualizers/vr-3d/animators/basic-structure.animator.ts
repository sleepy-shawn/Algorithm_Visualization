import * as THREE from 'three';
import { AnimationContext, StructureAnimator } from './structure-animator.interface';

type TraversalMode = 'preorder' | 'inorder' | 'postorder' | 'levelorder';

export class BasicStructureAnimator implements StructureAnimator {
  constructor(private readonly translate: (value: string) => string = value => value) {}
  private ask(message: string, initial = ''): string | null { return window.prompt(this.translate(message), initial); }
  private notify(message: string): void { window.alert(this.translate(message)); }

  private readonly delayMs = 520;

  async performOperation(operationName: string, ctx: AnimationContext): Promise<void> {
    switch (ctx.structureType) {
      case 'array':
        await this.animateArray(operationName, ctx);
        break;
      case 'stack':
        await this.animateStack(operationName, ctx);
        break;
      case 'queue':
        await this.animateQueue(operationName, ctx);
        break;
      case 'linked-list':
        await this.animateLinkedList(operationName, ctx);
        break;
      case 'binary-tree':
        await this.animateBinaryTree(operationName, ctx);
        break;
      default:
        ctx.announce?.('该结构的动画仍在完善中。');
    }
  }

  private async animateArray(operationName: string, ctx: AnimationContext): Promise<void> {
    const values = [...ctx.data.values];

    if (operationName === '访问') {
      const index = this.askIndex('请输入要访问的下标', values.length);
      if (index === null) return;
      await this.highlightByIndex(ctx, index, 0xfff0be, `访问下标 ${index}，时间复杂度 O(1)`);
      return;
    }

    if (operationName === '查找') {
      const target = this.ask('请输入要查找的值', values[0] ?? '10')?.trim();
      if (!target) return;

      ctx.announce?.(`顺序查找 ${target}`);
      for (let i = 0; i < values.length; i++) {
        await this.highlightByIndex(ctx, i, values[i] === target ? 0xe3efdf : 0xfff0be);
        if (values[i] === target) {
          ctx.announce?.(`找到 ${target}，位置为 ${i}`);
          return;
        }
      }
      ctx.announce?.(`未找到 ${target}`);
      return;
    }

    if (operationName === '插入') {
      const value = this.ask('请输入要插入的值', '25')?.trim();
      const index = this.askIndex('请输入插入下标', values.length + 1, values.length);
      if (!value || index === null) return;

      ctx.announce?.(`在下标 ${index} 插入 ${value}，后续元素右移`);
      await this.pulseFromIndex(ctx, index, 0xc9dff1);
      values.splice(index, 0, value);
      ctx.updateData({ values });
      return;
    }

    if (operationName === '删除') {
      const index = this.askIndex('请输入要删除的下标', values.length);
      if (index === null) return;

      await this.highlightByIndex(ctx, index, 0xf6d5cf, `删除下标 ${index}，后续元素左移`);
      values.splice(index, 1);
      ctx.updateData({ values });
      return;
    }

    if (operationName === '交换') {
      const first = this.askIndex('请输入第一个下标', values.length);
      const second = this.askIndex('请输入第二个下标', values.length);
      if (first === null || second === null) return;

      await this.highlightByIndex(ctx, first, 0xf8d6af);
      await this.highlightByIndex(ctx, second, 0xf8d6af, `交换 ${first} 与 ${second}`);
      [values[first], values[second]] = [values[second], values[first]];
      ctx.updateData({ values });
    }
  }

  private async animateStack(operationName: string, ctx: AnimationContext): Promise<void> {
    const values = [...ctx.data.values];

    if (operationName === '入栈') {
      const value = this.ask('请输入入栈元素', '60')?.trim();
      if (!value) return;
      ctx.announce?.(`${value} 压入栈顶`);
      values.push(value);
      ctx.updateData({ values });
      return;
    }

    if (operationName === '出栈') {
      if (values.length === 0) return;
      await this.highlightByIndex(ctx, values.length - 1, 0xf6d5cf, `弹出栈顶元素 ${values.at(-1)}`);
      values.pop();
      ctx.updateData({ values });
      return;
    }

    if (operationName === '查看栈顶') {
      await this.highlightByIndex(ctx, values.length - 1, 0xfff0be, `栈顶元素是 ${values.at(-1)}`);
    }
  }

  private async animateQueue(operationName: string, ctx: AnimationContext): Promise<void> {
    const values = [...ctx.data.values];

    if (operationName === '入队') {
      const value = this.ask('请输入入队元素', '60')?.trim();
      if (!value) return;
      ctx.announce?.(`${value} 从队尾入队`);
      values.push(value);
      ctx.updateData({ values });
      return;
    }

    if (operationName === '出队') {
      if (values.length === 0) return;
      await this.highlightByIndex(ctx, 0, 0xf6d5cf, `队头元素 ${values[0]} 出队`);
      values.shift();
      ctx.updateData({ values });
      return;
    }

    if (operationName === '查看队头') {
      await this.highlightByIndex(ctx, 0, 0xfff0be, `队头元素是 ${values[0]}`);
    }
  }

  private async animateLinkedList(operationName: string, ctx: AnimationContext): Promise<void> {
    const values = [...ctx.data.values];

    if (operationName === '查找') {
      const target = this.ask('请输入要查找的值', values[0] ?? 'A')?.trim();
      if (!target) return;

      for (let i = 0; i < values.length; i++) {
        await this.highlightByIndex(ctx, i, values[i] === target ? 0xe3efdf : 0xfff0be, `访问节点 ${values[i]}`);
        if (values[i] === target) return;
      }
      ctx.announce?.(`链表中不存在 ${target}`);
      return;
    }

    if (operationName === '头插') {
      const value = this.ask('请输入新头节点的值', 'X')?.trim();
      if (!value) return;
      ctx.announce?.(`新节点 ${value} 指向原头节点`);
      values.unshift(value);
      ctx.updateData({ values });
      return;
    }

    if (operationName === '删除') {
      const target = this.ask('请输入要删除的值', values[0] ?? 'A')?.trim();
      if (!target) return;

      const index = values.indexOf(target);
      if (index < 0) {
        ctx.announce?.(`未找到 ${target}`);
        return;
      }

      await this.highlightByIndex(ctx, index, 0xf6d5cf, `删除节点 ${target} 并重连指针`);
      values.splice(index, 1);
      ctx.updateData({ values });
    }
  }

  private async animateBinaryTree(operationName: string, ctx: AnimationContext): Promise<void> {
    const values = [...ctx.data.values];

    if (operationName === '遍历') {
      const mode = this.askTraversalMode();
      if (!mode) return;

      const order = this.binaryTraversalOrder(values, mode);
      const label = this.traversalLabel(mode);
      const result = order.map(index => values[index]).join(' -> ');

      ctx.announce?.(`${label}遍历：${result}`);
      for (const index of order) {
        await this.highlightByIndex(ctx, index, 0xfff0be, `${label}访问节点 ${values[index]}`);
      }
      ctx.announce?.(`${label}遍历完成：${result}`);
      return;
    }

    const target = this.ask(
      `请输入要${operationName}的值`,
      operationName === '插入' ? '9' : values[0] ?? '8'
    )?.trim();
    if (!target) return;

    const path = this.binarySearchPath(values, target);
    for (const index of path) {
      if (!values[index]) continue;

      await this.highlightByIndex(ctx, index, values[index] === target ? 0xe3efdf : 0xfff0be, `比较节点 ${values[index]}`);
      if (values[index] === target && operationName === '查找') {
        ctx.announce?.(`找到节点 ${target}`);
        return;
      }
    }

    if (operationName === '插入') {
      const insertIndex = this.binaryInsertIndex(values, target);
      if (insertIndex === null) {
        ctx.announce?.(`节点 ${target} 已存在，无需重复插入`);
        return;
      }

      ctx.announce?.(`按搜索树规则插入 ${target}`);
      while (values.length <= insertIndex) {
        values.push('');
      }
      values[insertIndex] = target;
      ctx.updateData({ values });
    } else {
      ctx.announce?.(`未找到节点 ${target}`);
    }
  }

  private askTraversalMode(): TraversalMode | null {
    const input = this.ask(
      '请选择遍历方式：\n1. 前序遍历（根-左-右）\n2. 中序遍历（左-根-右）\n3. 后序遍历（左-右-根）\n4. 层序遍历',
      '1'
    )?.trim();

    const map: Record<string, TraversalMode> = {
      '1': 'preorder',
      前序: 'preorder',
      前序遍历: 'preorder',
      preorder: 'preorder',
      '2': 'inorder',
      中序: 'inorder',
      中序遍历: 'inorder',
      inorder: 'inorder',
      '3': 'postorder',
      后序: 'postorder',
      后序遍历: 'postorder',
      postorder: 'postorder',
      '4': 'levelorder',
      层序: 'levelorder',
      层序遍历: 'levelorder',
      levelorder: 'levelorder',
    };

    if (!input) return null;
    const mode = map[input.toLowerCase()] ?? map[input];
    if (!mode) {
      this.notify('请输入 1、2、3、4，或输入前序/中序/后序/层序。');
      return null;
    }
    return mode;
  }

  private traversalLabel(mode: TraversalMode): string {
    const labels: Record<TraversalMode, string> = {
      preorder: '前序',
      inorder: '中序',
      postorder: '后序',
      levelorder: '层序',
    };
    return labels[mode];
  }

  private binaryTraversalOrder(values: string[], mode: TraversalMode): number[] {
    if (mode === 'levelorder') {
      return values.map((_, index) => index);
    }

    const order: number[] = [];
    const visit = (index: number): void => {
      if (index >= values.length) return;
      if (!values[index]) return;

      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (mode === 'preorder') order.push(index);
      visit(left);
      if (mode === 'inorder') order.push(index);
      visit(right);
      if (mode === 'postorder') order.push(index);
    };

    visit(0);
    return order;
  }

  private binarySearchPath(values: string[], target: string): number[] {
    const path: number[] = [];
    let index = 0;

    while (index < values.length && values[index]) {
      path.push(index);
      const cmp = this.compare(target, values[index]);
      if (cmp === 0) break;
      index = cmp < 0 ? index * 2 + 1 : index * 2 + 2;
    }

    return path;
  }

  private binaryInsertIndex(values: string[], target: string): number | null {
    let index = 0;

    while (index < 63) {
      const current = values[index];
      if (!current) return index;

      const cmp = this.compare(target, current);
      if (cmp === 0) return null;

      index = cmp < 0 ? index * 2 + 1 : index * 2 + 2;
    }

    this.notify('当前演示最多显示 63 个节点，无法继续插入。');
    return null;
  }

  private async pulseFromIndex(ctx: AnimationContext, startIndex: number, color: number): Promise<void> {
    const nodes = this.sceneNodes(ctx).filter(node => Number(node.userData['index']) >= startIndex);
    for (const node of nodes) {
      this.setNodeColor(node, color);
    }
    await this.delay(this.delayMs);
    nodes.forEach(node => this.restoreNodeColor(node));
  }

  private async highlightByIndex(
    ctx: AnimationContext,
    index: number,
    color: number,
    message?: string
  ): Promise<void> {
    const node = this.sceneNodes(ctx).find(item => Number(item.userData['index']) === index);
    if (!node) return;

    if (message) ctx.announce?.(message);
    this.setNodeColor(node, color);
    node.scale.set(1.12, 1.12, 1.12);
    await this.delay(this.delayMs);
    this.restoreNodeColor(node);
  }

  private sceneNodes(ctx: AnimationContext): THREE.Group[] {
    const nodes: THREE.Group[] = [];
    ctx.scene.traverse(obj => {
      if (obj.userData?.['structureType'] === ctx.structureType) {
        nodes.push(obj as THREE.Group);
      }
    });
    return nodes.sort((a, b) => Number(a.userData['index'] ?? 0) - Number(b.userData['index'] ?? 0));
  }

  private setNodeColor(node: THREE.Group, color: number): void {
    const mesh = node.children.find(child => (child as THREE.Mesh).isMesh) as THREE.Mesh | undefined;
    const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
    if (!material) return;

    material.color.setHex(color);
    material.emissive.setHex(color);
    material.emissiveIntensity = 0.75;
  }

  private restoreNodeColor(node: THREE.Group): void {
    const originalColor = Number(node.userData?.['originalColor'] ?? 0xc9dff1);
    this.setNodeColor(node, originalColor);

    const mesh = node.children.find(child => (child as THREE.Mesh).isMesh) as THREE.Mesh | undefined;
    const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
    if (material) material.emissiveIntensity = 0.12;
    node.scale.set(1, 1, 1);
  }

  private askIndex(message: string, length: number, fallback = 0): number | null {
    const value = Number(this.ask(message, String(fallback)));
    if (!Number.isInteger(value) || value < 0 || value >= length) {
      this.notify(`请输入 0 到 ${length - 1} 之间的整数`);
      return null;
    }
    return value;
  }

  private compare(a: string, b: string): number {
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.localeCompare(b, 'zh-Hans-CN', { numeric: true });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
