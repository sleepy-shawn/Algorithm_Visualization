import * as THREE from 'three';
import { StructureAnimator, AnimationContext } from './structure-animator.interface';

interface BPlusSceneNode {
    group: THREE.Group;
    id: string;
    keys: string[];
    isLeaf: boolean;
    level: number;
    position: THREE.Vector3;
}

export class BPlusTreeAnimator implements StructureAnimator {
    private readonly leafCapacity = 3;
    private readonly normalDelay = 650;
    private readonly shortDelay = 350;

    async performOperation(operationName: string, ctx: AnimationContext): Promise<void> {
        switch (operationName) {
            case '查找':
                await this.animateSearch(ctx);
                break;
            case '插入': {
                const insertValue = prompt('请输入要插入的值（数字或字符串）', '25');
                if (insertValue?.trim()) {
                    await this.animateInsert(ctx, insertValue.trim());
                }
                break;
            }
            case '删除': {
                const deleteValue = prompt('请输入要删除的值', '30');
                if (deleteValue?.trim()) {
                    await this.animateDelete(ctx, deleteValue.trim());
                }
                break;
            }
            case '范围查找': {
                const start = prompt('起始值', '20');
                const end = prompt('结束值', '60');
                if (start?.trim() && end?.trim()) {
                    await this.animateRangeQuery(ctx, start.trim(), end.trim());
                }
                break;
            }
            default:
                console.warn('Unknown operation', operationName);
        }
    }

    private async animateSearch(ctx: AnimationContext): Promise<void> {
        const target = prompt('请输入要查找的值', '50');
        if (!target?.trim()) {
            return;
        }

        const value = target.trim();
        const nodes = this.collectSceneNodes(ctx.scene);
        const path = this.findSearchPath(nodes, value);

        if (path.length === 0) {
            alert('当前场景中没有可演示的 B+ 树节点');
            return;
        }

        await this.showFloatingLabel(ctx, `查找 ${value}：从根节点开始`, 0xc9dff1);

        for (const node of path) {
            this.highlightNode(node.group, 0xfff0be, 1.1);
            await this.showNodeMessage(ctx, node, node.isLeaf ? '到达叶子节点' : '比较索引，选择子树');
            await this.delay(this.normalDelay);
            this.clearHighlight(node.group);
        }

        const leaf = path[path.length - 1];
        const found = leaf.keys.some(key => this.compareValues(key, value) === 0);

        this.highlightNode(leaf.group, found ? 0xe3efdf : 0xf6d5cf, 1.2);
        await this.showNodeMessage(
            ctx,
            leaf,
            found ? `找到关键字 ${value}` : `叶子节点中不存在 ${value}`
        );
        await this.delay(900);
        this.clearHighlight(leaf.group);

        alert(found ? `查找完成：找到 ${value}` : `查找完成：未找到 ${value}`);
    }

    private async animateInsert(ctx: AnimationContext, value: string): Promise<void> {
        const nodes = this.collectSceneNodes(ctx.scene);
        const path = this.findSearchPath(nodes, value);

        if (path.length === 0) {
            ctx.updateData({ values: this.sortedUnique([...ctx.data.values, value]) });
            return;
        }

        const token = this.createKeyToken(value, 0xe3efdf);
        ctx.addTemporaryObject(token);

        await this.showFloatingLabel(ctx, `插入 ${value}：先查找目标叶子节点`, 0xe3efdf);

        for (const node of path) {
            await this.moveObject(token, node.position.clone().add(new THREE.Vector3(0, 1.15, 0)), 420);
            this.highlightNode(node.group, 0xe3efdf, 1.0);
            await this.delay(this.shortDelay);
            this.clearHighlight(node.group);
        }

        const targetLeaf = path[path.length - 1];
        const currentLeafKeys = targetLeaf.keys;
        const insertedLeafKeys = this.sortedUnique([...currentLeafKeys, value]);
        const willSplit = insertedLeafKeys.length > this.leafCapacity;

        this.highlightNode(targetLeaf.group, willSplit ? 0xf8d6af : 0xe3efdf, 1.2);
        await this.showNodeMessage(
            ctx,
            targetLeaf,
            willSplit
                ? `叶子容量超过 ${this.leafCapacity}，准备分裂`
                : `插入到叶子节点，保持有序`
        );
        await this.delay(900);

        if (willSplit) {
            await this.animateLeafSplit(ctx, targetLeaf, insertedLeafKeys);
        }

        this.clearHighlight(targetLeaf.group);

        const newValues = this.sortedUnique([...ctx.data.values, value]);
        ctx.updateData({ values: newValues });

        await this.showFloatingLabel(ctx, `插入完成：${value} 已加入 B+ 树`, 0xe3efdf);
        alert(`${value}已插入`);
        await this.delay(700);
    }

    private async animateDelete(ctx: AnimationContext, value: string): Promise<void> {
        const nodes = this.collectSceneNodes(ctx.scene);
        const path = this.findSearchPath(nodes, value);

        if (path.length === 0) {
            return;
        }

        await this.showFloatingLabel(ctx, `删除 ${value}：先定位所在叶子节点`, 0xf6d5cf);

        for (const node of path) {
            this.highlightNode(node.group, 0xfff0be, 1.0);
            await this.showNodeMessage(ctx, node, node.isLeaf ? '检查叶子节点' : '沿索引向下查找');
            await this.delay(this.normalDelay);
            this.clearHighlight(node.group);
        }

        const leaf = path[path.length - 1];
        const exists = leaf.keys.some(key => this.compareValues(key, value) === 0);

        if (!exists) {
            this.highlightNode(leaf.group, 0xf6d5cf, 1.1);
            await this.showNodeMessage(ctx, leaf, `未找到 ${value}，无需删除`);
            await this.delay(900);
            this.clearHighlight(leaf.group);
            alert(`删除失败：${value} 不存在`);
            return;
        }

        const remainingLeafKeys = leaf.keys.filter(key => this.compareValues(key, value) !== 0);
        const mayNeedRebalance = remainingLeafKeys.length > 0 && remainingLeafKeys.length < Math.ceil(this.leafCapacity / 2);

        this.highlightNode(leaf.group, 0xf6d5cf, 1.2);
        await this.showNodeMessage(ctx, leaf, `删除关键字 ${value}`);
        await this.delay(800);

        if (mayNeedRebalance) {
            await this.showNodeMessage(ctx, leaf, '叶子节点关键字偏少，演示借位 / 合并调整');
            await this.pulseNode(leaf.group, 0xf8d6af, 3);
        }

        this.clearHighlight(leaf.group);

        const newValues = ctx.data.values.filter(item => this.compareValues(item, value) !== 0);
        ctx.updateData({ values: this.sortValues(newValues) });

        await this.showFloatingLabel(ctx, `删除完成：${value} 已移除`, 0xf6d5cf);
        alert(`已删除${value}`);
        await this.delay(700);
    }

    private async animateRangeQuery(ctx: AnimationContext, start: string, end: string): Promise<void> {
        const normalizedStart = this.compareValues(start, end) <= 0 ? start : end;
        const normalizedEnd = this.compareValues(start, end) <= 0 ? end : start;

        const nodes = this.collectSceneNodes(ctx.scene);
        const path = this.findSearchPath(nodes, normalizedStart);
        const leaves = nodes
            .filter(node => node.isLeaf)
            .sort((a, b) => a.position.x - b.position.x);

        if (path.length === 0 || leaves.length === 0) {
            return;
        }

        await this.showFloatingLabel(
            ctx,
            `范围查询 [${normalizedStart}, ${normalizedEnd}]：先定位起始叶子`,
            0xc9dff1
        );

        for (const node of path) {
            this.highlightNode(node.group, 0xfff0be, 1.0);
            await this.delay(this.normalDelay);
            this.clearHighlight(node.group);
        }

        const matchedLeaves = leaves.filter(leaf =>
            leaf.keys.some(key =>
                this.compareValues(key, normalizedStart) >= 0 &&
                this.compareValues(key, normalizedEnd) <= 0
            )
        );

        if (matchedLeaves.length === 0) {
            const leaf = path[path.length - 1];
            this.highlightNode(leaf.group, 0xf6d5cf, 1.1);
            await this.showNodeMessage(ctx, leaf, '范围内没有匹配关键字');
            await this.delay(900);
            this.clearHighlight(leaf.group);
            alert(`范围查询完成：没有找到 ${normalizedStart} ~ ${normalizedEnd} 的数据`);
            return;
        }

        await this.showFloatingLabel(ctx, '沿叶子链表向右顺序扫描', 0xdfeaf5);

        for (let i = 0; i < matchedLeaves.length; i++) {
            const leaf = matchedLeaves[i];

            this.highlightNode(leaf.group, 0xdfeaf5, 1.1);
            await this.showNodeMessage(ctx, leaf, `命中：${leaf.keys.join(', ')}`);

            if (i < matchedLeaves.length - 1) {
                await this.animateLeafLink(ctx, leaf, matchedLeaves[i + 1]);
            }

            await this.delay(this.normalDelay);
            this.clearHighlight(leaf.group);
        }

        const result = matchedLeaves
            .flatMap(leaf => leaf.keys)
            .filter(key =>
                this.compareValues(key, normalizedStart) >= 0 &&
                this.compareValues(key, normalizedEnd) <= 0
            );

        alert(`范围查询完成：${result.join(', ') || '无结果'}`);
    }

    private async animateLeafSplit(
        ctx: AnimationContext,
        leaf: BPlusSceneNode,
        insertedLeafKeys: string[]
    ): Promise<void> {
        const mid = Math.ceil(insertedLeafKeys.length / 2);
        const leftKeys = insertedLeafKeys.slice(0, mid);
        const rightKeys = insertedLeafKeys.slice(mid);
        const promotedKey = rightKeys[0];

        await this.showNodeMessage(ctx, leaf, `分裂为 [${leftKeys.join(', ')}] 和 [${rightKeys.join(', ')}]`);
        await this.pulseNode(leaf.group, 0xf8d6af, 3);

        const leftGhost = this.createGhostBox(leftKeys.join(' | '), 0xe3efdf);
        const rightGhost = this.createGhostBox(rightKeys.join(' | '), 0xe3efdf);

        leftGhost.position.copy(leaf.position);
        rightGhost.position.copy(leaf.position);

        ctx.addTemporaryObject(leftGhost);
        ctx.addTemporaryObject(rightGhost);

        await Promise.all([
            this.moveObject(leftGhost, leaf.position.clone().add(new THREE.Vector3(-2.1, -1.2, 0.5)), 550),
            this.moveObject(rightGhost, leaf.position.clone().add(new THREE.Vector3(2.1, -1.2, 0.5)), 550),
        ]);

        const promoteToken = this.createKeyToken(`上提 ${promotedKey}`, 0xfff0be);
        promoteToken.position.copy(rightGhost.position).add(new THREE.Vector3(0, 1.1, 0));
        ctx.addTemporaryObject(promoteToken);

        await this.moveObject(promoteToken, leaf.position.clone().add(new THREE.Vector3(0, 2.1, 0)), 600);
        await this.showFloatingLabel(ctx, `将 ${promotedKey} 复制到父索引节点`, 0xfff0be);
        await this.delay(700);
    }

    private async animateLeafLink(
        ctx: AnimationContext,
        from: BPlusSceneNode,
        to: BPlusSceneNode
    ): Promise<void> {
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3().subVectors(to.position, from.position).normalize(),
            from.position.clone().add(new THREE.Vector3(1.8, -0.85, 0)),
            Math.max(0.8, from.position.distanceTo(to.position) - 3.2),
            0xdfeaf5,
            0.35,
            0.2
        );

        ctx.addTemporaryObject(arrow);
        await this.delay(450);
    }

    private collectSceneNodes(scene: THREE.Scene): BPlusSceneNode[] {
        const nodes: BPlusSceneNode[] = [];

        scene.traverse(obj => {
            if (obj.userData?.['nodeType'] !== 'bplus-node') {
                return;
            }

            const group = obj as THREE.Group;

            nodes.push({
                group,
                id: String(group.userData['nodeId'] ?? ''),
                keys: Array.isArray(group.userData['keys'])
                    ? group.userData['keys'].map(String)
                    : [],
                isLeaf: group.userData['isLeaf'] === true,
                level: Number(group.userData['level'] ?? 0),
                position: group.position.clone(),
            });
        });

        return nodes.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            return a.position.x - b.position.x;
        });
    }

    private findSearchPath(nodes: BPlusSceneNode[], target: string): BPlusSceneNode[] {
        if (nodes.length === 0) {
            return [];
        }

        const levels = [...new Set(nodes.map(node => node.level))].sort((a, b) => b - a);
        const path: BPlusSceneNode[] = [];
        let minX = -Infinity;
        let maxX = Infinity;

        for (const level of levels) {
            const candidates = nodes
                .filter(node => node.level === level)
                .filter(node => node.position.x >= minX && node.position.x <= maxX)
                .sort((a, b) => a.position.x - b.position.x);

            if (candidates.length === 0) {
                continue;
            }

            const chosen = this.chooseNodeForTarget(candidates, target);
            path.push(chosen);

            const nextLevelNodes = nodes
                .filter(node => node.level === level - 1)
                .sort((a, b) => a.position.x - b.position.x);

            if (nextLevelNodes.length > 0) {
                const childSpan = this.estimateChildSpan(chosen, nextLevelNodes);
                minX = childSpan.minX;
                maxX = childSpan.maxX;
            }
        }

        return path;
    }

    private chooseNodeForTarget(nodes: BPlusSceneNode[], target: string): BPlusSceneNode {
        if (nodes.length === 1) {
            return nodes[0];
        }

        for (const node of nodes) {
            const firstKey = node.keys[0];
            const lastKey = node.keys[node.keys.length - 1];

            if (
                firstKey !== undefined &&
                lastKey !== undefined &&
                this.compareValues(target, firstKey) >= 0 &&
                this.compareValues(target, lastKey) <= 0
            ) {
                return node;
            }
        }

        const lessOrEqual = nodes
            .filter(node => node.keys[0] !== undefined && this.compareValues(node.keys[0], target) <= 0)
            .at(-1);

        return lessOrEqual ?? nodes[0];
    }

    private estimateChildSpan(
        parent: BPlusSceneNode,
        nextLevelNodes: BPlusSceneNode[]
    ): { minX: number; maxX: number } {
        const sorted = [...nextLevelNodes].sort((a, b) => a.position.x - b.position.x);
        const nearest = sorted
            .map(node => ({
                node,
                distance: Math.abs(node.position.x - parent.position.x),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3)
            .map(item => item.node);

        if (nearest.length === 0) {
            return { minX: -Infinity, maxX: Infinity };
        }

        const xs = nearest.map(node => node.position.x);
        return {
            minX: Math.min(...xs) - 0.1,
            maxX: Math.max(...xs) + 0.1,
        };
    }

    private highlightNode(node: THREE.Group, color: number, intensity = 0.9): void {
        const mesh = node.children.find(child => (child as THREE.Mesh).isMesh) as THREE.Mesh | undefined;

        if (!mesh?.material) {
            return;
        }

        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(color);
        mat.emissive.setHex(color);
        mat.emissiveIntensity = intensity;

        node.scale.set(1.08, 1.08, 1.08);
    }

    private clearHighlight(node: THREE.Group): void {
        const mesh = node.children.find(child => (child as THREE.Mesh).isMesh) as THREE.Mesh | undefined;

        if (!mesh?.material) {
            return;
        }

        const mat = mesh.material as THREE.MeshStandardMaterial;
        const originalColor = node.userData?.['originalColor'];

        if (typeof originalColor === 'number') {
            mat.color.setHex(originalColor);
            mat.emissive.setHex(originalColor);
        }

        mat.emissiveIntensity = 0.12;
        node.scale.set(1, 1, 1);
    }

    private async pulseNode(node: THREE.Group, color: number, times: number): Promise<void> {
        for (let i = 0; i < times; i++) {
            this.highlightNode(node, color, 1.25);
            await this.delay(220);
            this.clearHighlight(node);
            await this.delay(160);
        }
    }

    private createKeyToken(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.SphereGeometry(0.42, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.55,
            roughness: 0.25,
            metalness: 0.1,
        });

        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);

        const sprite = this.createTextSprite(label);
        sprite.position.set(0, 0.72, 0);
        sprite.scale.set(1.4, 0.55, 1);
        group.add(sprite);

        return group;
    }

    private createGhostBox(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(2.7, 0.9, 0.9);
        const material = new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity: 0.42,
            emissive: color,
            emissiveIntensity: 0.45,
            roughness: 0.25,
            metalness: 0.1,
            depthWrite: false,
        });

        const box = new THREE.Mesh(geometry, material);
        group.add(box);

        const sprite = this.createTextSprite(label);
        sprite.position.set(0, 0, 0.55);
        sprite.scale.set(2.2, 0.75, 1);
        group.add(sprite);

        return group;
    }

    private async showFloatingLabel(
        ctx: AnimationContext,
        message: string,
        color: number
    ): Promise<void> {
        const label = this.createTextSprite(message, color);
        label.position.set(0, 6.2, 1.5);
        label.scale.set(6.2, 1.1, 1);

        ctx.addTemporaryObject(label);
        await this.delay(650);
    }

    private async showNodeMessage(
        ctx: AnimationContext,
        node: BPlusSceneNode,
        message: string
    ): Promise<void> {
        const label = this.createTextSprite(message, 0xffffff);
        label.position.copy(node.position).add(new THREE.Vector3(0, 1.2, 0.2));
        label.scale.set(3.3, 0.75, 1);

        ctx.addTemporaryObject(label);
        await this.delay(420);
    }

    private createTextSprite(text: string, color = 0xffffff): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 768;
        canvas.height = 160;

        const context = canvas.getContext('2d')!;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(15, 23, 42, 0.82)';
        this.roundRect(context, 12, 24, canvas.width - 24, canvas.height - 48, 20);
        context.fill();

        context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.lineWidth = 4;
        this.roundRect(context, 12, 24, canvas.width - 24, canvas.height - 48, 20);
        context.stroke();

        context.fillStyle = '#ffffff';
        context.font = 'bold 42px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        const sprite = new THREE.Sprite(material);
        sprite.renderOrder = 999;

        return sprite;
    }

    private roundRect(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
    }

    private moveObject(
        object: THREE.Object3D,
        target: THREE.Vector3,
        durationMs: number
    ): Promise<void> {
        const start = object.position.clone();
        const startedAt = performance.now();

        return new Promise(resolve => {
            const tick = () => {
                const elapsed = performance.now() - startedAt;
                const t = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(1, elapsed / durationMs);
                const eased = 1 - Math.pow(1 - t, 3);

                object.position.lerpVectors(start, target, eased);

                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    resolve();
                }
            };

            tick();
        });
    }

    private sortedUnique(values: string[]): string[] {
        return this.sortValues([...new Set(values.map(value => value.trim()).filter(Boolean))]);
    }

    private sortValues(values: string[]): string[] {
        return [...values].sort((a, b) => this.compareValues(a, b));
    }

    private compareValues(a: string, b: string): number {
        const an = Number(a);
        const bn = Number(b);

        if (!Number.isNaN(an) && !Number.isNaN(bn)) {
            return an - bn;
        }

        return a.localeCompare(b, 'zh-Hans-CN', { numeric: true });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}