import { StructureRendererContext } from './structure-renderer.types';
import { ThreeObjectFactory } from './three-object-factory';

export class StackRenderer {
    static render(ctx: StructureRendererContext): void {
        const values = ctx.data.values.length > 0 ? ctx.data.values : ['10', '20', '30', '40', '50'];

        values.forEach((value, i) => {
            const color = i === values.length - 1 ? 0xfff0be : 0xe3efdf;
            const cube = ThreeObjectFactory.createBox(
                String(value),
                color
            );
            cube.userData = {
                structureType: 'stack',
                value: String(value),
                index: i,
                isTop: i === values.length - 1,
                originalColor: color,
            };
            cube.position.set(0, i + 0.6, 0);
            ctx.addObject(cube);
        });
    }
}
