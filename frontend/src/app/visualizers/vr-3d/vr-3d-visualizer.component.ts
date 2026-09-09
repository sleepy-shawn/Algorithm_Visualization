import { PreferencesService } from '../../i18n/preferences.service';
import { inject } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    computed,
    effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StructureType } from './renderers/structure-renderer.types';
import { STRUCTURE_INFO } from './data/structure-info';
import { ArrayRenderer } from './renderers/array.renderer';
import { StackRenderer } from './renderers/stack.renderer';
import { QueueRenderer } from './renderers/queue.renderer';
import { LinkedListRenderer } from './renderers/linked-list.renderer';
import { BinaryTreeRenderer } from './renderers/binary-tree.renderer';
import { BPlusTreeRenderer } from './renderers/b-plus-tree.renderer';
import { AlgorithmStore } from '../../store/algorithm.store';
import { BPlusTreeAnimator } from './animators/b-plus-tree.animator';
import { StructureAnimator, AnimationContext } from './animators/structure-animator.interface';
import { BasicStructureAnimator } from './animators/basic-structure.animator';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

interface StructureOption {
    type: StructureType;
    label: string;
}

@Component({
    selector: 'app-vr-3d-visualizer',
    standalone: true,
    imports: [TranslatePipe, CommonModule, UiIconComponent],
    templateUrl: './vr-3d-visualizer.component.html',
})
export class Vr3dVisualizerComponent implements AfterViewInit, OnDestroy {
    private readonly preferences = inject(PreferencesService);
    @ViewChild('canvasContainer', { static: true })
    canvasContainer!: ElementRef<HTMLDivElement>;

    selected = computed(() => this.store.vr3dStructure());
    operationStatus = '选择操作开始演示';
    readonly structureOptions: StructureOption[] = [
        { type: 'array', label: '数组' },
        { type: 'stack', label: '栈' },
        { type: 'queue', label: '队列' },
        { type: 'linked-list', label: '链表' },
        { type: 'binary-tree', label: '二叉树' },
        { type: 'b-plus-tree', label: 'B+ 树' },
    ];

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private animationId: number | null = null;
    private objects: THREE.Object3D[] = [];
    private threeReady = false;
    //private currentAnimator: StructureAnimator | null = null;
    private isAnimating = false;
    private tempObjects: THREE.Object3D[] = [];

    constructor(public store: AlgorithmStore) {
        effect(() => {
            this.store.vr3dStructure();
            this.store.vr3dData();

            if (this.threeReady) {
                this.renderStructure();
            }
        });
    }

    get currentInfo() {
        return STRUCTURE_INFO[this.selected()];
    }

    ngAfterViewInit(): void {
        this.initThree();
        this.threeReady = true;
        this.renderStructure();
        this.animate();
        this.initAnimators();
        window.addEventListener('resize', this.handleResize);
    }

    ngOnDestroy(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this.handleResize);

        this.controls?.dispose();
        this.renderer?.dispose();

        for (const obj of this.objects) {
            this.disposeObject(obj);
        }
    }

    selectStructure(type: StructureType): void {
        this.store.setVr3dStructure(type);
        this.operationStatus = '选择操作开始演示';
    }

    randomData(): void {
        this.store.randomVr3dData();
        this.operationStatus = '已生成一组新的数据。';
    }

    resetView(): void {
        this.resetCameraView();
        this.operationStatus = '视角已重置。';
    }

    private initThree(): void {
        const container = this.canvasContainer.nativeElement;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x302e2a);

        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.resetCameraView();

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(8, 10, 8);
        this.scene.add(directional);
    }

    private renderStructure(): void {
        this.clearObjects();

        const ctx = {
            addObject: (obj: THREE.Object3D) => this.addObject(obj),
            data: this.store.vr3dData(),
        };

        switch (this.selected()) {
            case 'array':
                ArrayRenderer.render(ctx);
                break;
            case 'stack':
                StackRenderer.render(ctx);
                break;
            case 'queue':
                QueueRenderer.render(ctx);
                break;
            case 'linked-list':
                LinkedListRenderer.render(ctx);
                break;
            case 'binary-tree':
                BinaryTreeRenderer.render(ctx);
                break;
            case 'b-plus-tree':
                BPlusTreeRenderer.render(ctx);
                break;
        }

        this.resetCameraView();
    }

    private resetCameraView(): void {
        if (this.selected() === 'b-plus-tree') {
            this.camera.position.set(0, 5.5, 24);
            this.controls.target.set(0, 1.2, 0);
        } else if (this.selected() === 'binary-tree') {
            this.camera.position.set(0, 5.5, 20);
            this.controls.target.set(0, 1.4, 0);
        } else {
            this.camera.position.set(0, 4.5, 14);
            this.controls.target.set(0, 2.4, 0);
        }

        this.camera.zoom = Math.min(1, this.camera.aspect * 1.5);
        this.camera.updateProjectionMatrix();
        this.controls.update();
    }

    private addObject(obj: THREE.Object3D): void {
        this.objects.push(obj);
        this.scene.add(obj);
    }

    private clearObjects(): void {
        for (const obj of this.objects) {
            this.scene.remove(obj);
            this.disposeObject(obj);
        }
        this.objects = [];
    }

    private disposeObject(obj: THREE.Object3D): void {
        obj.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }

            const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(material)) {
                material.forEach(m => m.dispose());
            } else if (material) {
                material.dispose();
            }

            if (child instanceof THREE.Sprite) {
                const material = child.material as THREE.SpriteMaterial;
                if (material.map) material.map.dispose();
                material.dispose();
            }
        });
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };

    private handleResize = (): void => {
        const container = this.canvasContainer.nativeElement;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.zoom = Math.min(1, this.camera.aspect * 1.5);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    };

    private animatorsMap = new Map<StructureType, StructureAnimator>();

    private initAnimators(): void {
        const basicAnimator = new BasicStructureAnimator(value => this.preferences.t(value));
        this.animatorsMap.set('array', basicAnimator);
        this.animatorsMap.set('stack', basicAnimator);
        this.animatorsMap.set('queue', basicAnimator);
        this.animatorsMap.set('linked-list', basicAnimator);
        this.animatorsMap.set('binary-tree', basicAnimator);
        this.animatorsMap.set('b-plus-tree', new BPlusTreeAnimator(value => this.preferences.t(value)));
    }

    async onOperate(operationName: string): Promise<void> {
        if (this.isAnimating) {
            alert(this.preferences.t('动画进行中，请稍后再试'));
            return;
        }
        const animator = this.animatorsMap.get(this.selected());
        if (!animator) {
            alert(this.preferences.t(`${this.selected()} 的操作动画尚未实现`));
            return;
        }

        this.isAnimating = true;
        this.operationStatus = `正在演示：${operationName}`;
        // 不再禁用轨道控制，允许用户在动画时拖拽/缩放
        // this.controls.enabled = false;

        try {
            const ctx: AnimationContext = {
                scene: this.scene,
                camera: this.camera,
                controls: this.controls,
                structureType: this.selected(),
                addTemporaryObject: (obj) => {
                    this.tempObjects.push(obj);
                    this.scene.add(obj);
                },
                clearTemporaryObjects: () => {
                    this.tempObjects.forEach(obj => this.scene.remove(obj));
                    this.tempObjects = [];
                },
                data: this.store.vr3dData(),
                updateData: (newData) => {
                    this.store.setVr3dData(newData.values);
                    // 等待下一个渲染周期重新绘制结构
                    setTimeout(() => this.renderStructure(), 100);
                },
                announce: (message) => {
                    this.operationStatus = message;
                },
            };
            await animator.performOperation(operationName, ctx);
        } catch (err) {
            console.error(err);
            this.operationStatus = '操作演示失败，请查看控制台错误。';
        } finally {
            this.isAnimating = false;
            // 不再在结束时恢复（因为未禁用）
            // this.controls.enabled = true;
            this.clearTemporaryObjects();
        }
    }

    private clearTemporaryObjects(): void {
        this.tempObjects.forEach(obj => this.scene.remove(obj));
        this.tempObjects = [];
    }

    // 添加公共方法供模板调用
    performOperation(opName: string): void {
        this.onOperate(opName).then(r => {});
    }
}
