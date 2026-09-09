import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

interface BPlusVisualNode {
    id: string;
    text: string;
    keys: string[];
    children: BPlusVisualNode[];
    level: number;
    x: number;
    y: number;
    z: number;
    isLeaf: boolean;
}

export class BPlusTreeRenderer {
    private static readonly LEAF_SIZE = 3;
    private static readonly FANOUT = 3;

    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0
            ? ctx.data.values
            : ['10', '20', '30', '40', '50', '60', '70', '80'];

        const normalizedValues = values.slice(0, 60);
        const leaves = this.createLeaves(normalizedValues);
        const levels = this.buildLevels(leaves);

        this.assignPositions(levels);

        const allNodes = levels.flat();

        allNodes.forEach(node => {
            node.children.forEach(child => {
                const line = ThreeObjectFactory.createLine(
                    new THREE.Vector3(node.x, node.y - 0.45, node.z),
                    new THREE.Vector3(child.x, child.y + 0.45, child.z),
                    0x94a3b8
                );
                ctx.addObject(line);
            });
        });

        allNodes.forEach(node => {
            const color = node.isLeaf
                ? 0xe3efdf
                : node.level === levels.length - 1
                    ? 0xfff0be
                    : 0xc9dff1;

            const box = ThreeObjectFactory.createWideBox(node.text, color);

            box.userData = {
                nodeType: 'bplus-node',
                nodeId: node.id,
                keys: node.keys,
                isLeaf: node.isLeaf,
                level: node.level,
                originalColor: color,
            };
            box.position.set(node.x, node.y, node.z);
            ctx.addObject(box);
        });

        const leafLevel = levels[0];
        for (let i = 0; i < leafLevel.length - 1; i++) {
            const from = leafLevel[i];
            const to = leafLevel[i + 1];

            const arrow = ThreeObjectFactory.createArrow(
                new THREE.Vector3(from.x + 1.7, from.y - 0.75, from.z),
                new THREE.Vector3(to.x - 1.7, to.y - 0.75, to.z),
                0xdfeaf5
            );

            ctx.addObject(arrow);
        }
    }

    private static createLeaves(values: string[]): BPlusVisualNode[] {
        return this.chunk(values, this.LEAF_SIZE).map((group, index) => ({
            id: `leaf-${index}`,
            text: group.join(' | '),
            keys: group,
            children: [],
            level: 0,
            x: 0,
            y: 0,
            z: 0,
            isLeaf: true,
        }));
    }

    private static buildLevels(leaves: BPlusVisualNode[]): BPlusVisualNode[][] {
        const levels: BPlusVisualNode[][] = [leaves];
        let current = leaves;
        let level = 1;

        while (current.length > 1) {
            const parentGroups = this.chunk(current, this.FANOUT);
            const parents = parentGroups.map((children, index) => {
                const keys = children.map(child => child.keys[0]);
                return {
                    id: `level-${level}-${index}`,
                    text: keys.join(' | '),
                    keys,
                    children,
                    level,
                    x: 0,
                    y: 0,
                    z: 0,
                    isLeaf: false,
                };
            });

            levels.push(parents);
            current = parents;
            level++;
        }

        return levels;
    }

    private static assignPositions(levels: BPlusVisualNode[][]): void {
        const leafCount = levels[0].length;
        const leafSpacing = 4.8;
        const levelSpacing = 2.2;
        const center = (leafCount - 1) / 2;

        levels[0].forEach((leaf, index) => {
            leaf.x = (index - center) * leafSpacing;
            leaf.y = 3 - (levels.length - 1) * levelSpacing;
            leaf.z = 0;
        });

        for (let levelIndex = 1; levelIndex < levels.length; levelIndex++) {
            const level = levels[levelIndex];

            level.forEach(node => {
                const firstChild = node.children[0];
                const lastChild = node.children[node.children.length - 1];

                node.x = (firstChild.x + lastChild.x) / 2;
                node.y = 3 - (levels.length - 1 - levelIndex) * levelSpacing;
                node.z = -levelIndex * 0.35;
            });
        }
    }

    private static chunk<T>(values: T[], size: number): T[][] {
        const result: T[][] = [];

        for (let i = 0; i < values.length; i += size) {
            result.push(values.slice(i, i + size));
        }

        return result;
    }
}