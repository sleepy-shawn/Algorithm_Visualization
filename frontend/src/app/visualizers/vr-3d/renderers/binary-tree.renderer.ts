import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class BinaryTreeRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0
            ? ctx.data.values
            : ['8', '4', '12', '2', '6', '10', '14'];

        const maxVisibleNodes = values.slice(0, 63);
        const maxLevel = Math.floor(Math.log2(maxVisibleNodes.length));
        const baseWidth = Math.max(12, Math.pow(2, Math.min(maxLevel, 5)) * 1.4);
        const levelGap = 1.75;

        const nodes = maxVisibleNodes.map((value, index) => {
            const level = Math.floor(Math.log2(index + 1));
            const firstIndexOfLevel = Math.pow(2, level) - 1;
            const indexInLevel = index - firstIndexOfLevel;
            const nodesInLevel = Math.pow(2, level);

            const xGap = baseWidth / nodesInLevel;
            const x = (indexInLevel - (nodesInLevel - 1) / 2) * xGap;
            const y = 5 - level * levelGap;
            const z = -level * 0.25;

            return {
                v: value,
                x,
                y,
                z,
                index,
            };
        }).filter(node => node.v != null && node.v !== '');

        nodes.forEach(node => {
            if (node.index === 0) {
                return;
            }

            const parentIndex = Math.floor((node.index - 1) / 2);
            const parent = nodes.find(item => item.index === parentIndex);

            if (!parent) {
                return;
            }

            const line = ThreeObjectFactory.createLine(
                new THREE.Vector3(parent.x, parent.y, parent.z),
                new THREE.Vector3(node.x, node.y, node.z),
                0x94a3b8
            );

            ctx.addObject(line);
        });

        nodes.forEach(node => {
            const sphere = ThreeObjectFactory.createSphere(node.v, 0xe4d7ec);
            sphere.userData = {
                structureType: 'binary-tree',
                value: String(node.v),
                index: node.index,
                originalColor: 0xe4d7ec,
            };
            sphere.position.set(node.x, node.y, node.z);
            ctx.addObject(sphere);
        });
    }
}
