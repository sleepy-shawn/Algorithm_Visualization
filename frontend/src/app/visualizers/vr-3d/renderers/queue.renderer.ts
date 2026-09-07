import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class QueueRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0 ? ctx.data.values : ['10', '20', '30', '40', '50'];
        const center = (values.length - 1) / 2;

        values.forEach((value, i) => {
            const color = i === 0 ? 0xf8d6af : i === values.length - 1 ? 0xe4d7ec : 0xdfeaf5;
            const cube = ThreeObjectFactory.createBox(
                String(value),
                color
            );
            cube.userData = {
                structureType: 'queue',
                value: String(value),
                index: i,
                isFront: i === 0,
                isRear: i === values.length - 1,
                originalColor: color,
            };
            cube.position.set((i - center) * 2, 1, 0);
            ctx.addObject(cube);
        });
    }
}
