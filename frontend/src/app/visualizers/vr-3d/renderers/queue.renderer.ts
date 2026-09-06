import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class QueueRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0 ? ctx.data.values : ['10', '20', '30', '40', '50'];
        const center = (values.length - 1) / 2;

        values.forEach((value, i) => {
            const color = i === 0 ? 0xfad4b4 : i === values.length - 1 ? 0xf7c8dc : 0xcfe1f5;
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
