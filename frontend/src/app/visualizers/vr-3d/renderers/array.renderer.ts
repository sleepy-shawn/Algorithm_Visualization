import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class ArrayRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0 ? ctx.data.values : ['10', '20', '30', '40', '50'];
        const center = (values.length - 1) / 2;

        values.forEach((value, i) => {
            const cube = ThreeObjectFactory.createBox(String(value), 0xc9dff1);
            cube.userData = {
                structureType: 'array',
                value: String(value),
                index: i,
                originalColor: 0xc9dff1,
            };
            cube.position.set((i - center) * 2, 1, 0);
            ctx.addObject(cube);
        });
    }
}
