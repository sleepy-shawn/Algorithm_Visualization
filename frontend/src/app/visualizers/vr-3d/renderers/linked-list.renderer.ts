import * as THREE from 'three';
import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class LinkedListRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0 ? ctx.data.values : ['10', '20', '30', '40'];
        const center = (values.length - 1) / 2;

        values.forEach((value, i) => {
            const x = (i - center) * 3;

            const node = ThreeObjectFactory.createSphere(String(value), 0xc9dff1);
            node.userData = {
                structureType: 'linked-list',
                value: String(value),
                index: i,
                originalColor: 0xc9dff1,
            };
            node.position.set(x, 1.5, 0);
            ctx.addObject(node);

            if (i < values.length - 1) {
                const nextX = (i + 1 - center) * 3;
                const arrow = ThreeObjectFactory.createArrow(
                    new THREE.Vector3(x + 0.8, 1.5, 0),
                    new THREE.Vector3(nextX - 0.8, 1.5, 0),
                    0xfff0be
                );
                ctx.addObject(arrow);
            }
        });
    }
}
