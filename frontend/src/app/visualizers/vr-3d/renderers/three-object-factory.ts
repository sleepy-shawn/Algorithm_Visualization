import * as THREE from 'three';

export class ThreeObjectFactory {
    static createBox(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
        const material = this.createTransparentMaterial(color);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 1;
        group.add(mesh);

        const text = this.createTextSprite(label);
        text.position.set(0, 0, 0.72);
        group.add(text);

        return group;
    }

    static createWideBox(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.BoxGeometry(3.2, 1.1, 1.1);
        const material = this.createTransparentMaterial(color);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 1;
        group.add(mesh);

        const text = this.createTextSprite(label);
        text.position.set(0, 0, 0.65);
        group.add(text);

        return group;
    }

    static createSphere(label: string, color: number): THREE.Group {
        const group = new THREE.Group();

        const geometry = new THREE.SphereGeometry(0.75, 32, 32);
        const material = this.createTransparentMaterial(color);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 1;
        group.add(mesh);

        const text = this.createTextSprite(label);
        text.position.set(0, 0, 0.85);
        group.add(text);

        return group;
    }

    // 创建文本子画面
    static createTextSprite(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 128;

        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2b2925';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Keep labels readable on both the pastel face and the dark scene while rotating.
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.8, 0.9, 1);
        sprite.renderOrder = 2;

        return sprite;
    }

    static createLine(start: THREE.Vector3, end: THREE.Vector3, color: number): THREE.Line {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        return new THREE.Line(geometry, material);
    }

    // 创建指向性箭头
    static createArrow(start: THREE.Vector3, end: THREE.Vector3, color: number): THREE.ArrowHelper {
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const length = start.distanceTo(end);
        return new THREE.ArrowHelper(direction, start, length, color, 0.35, 0.2);
    }

    private static createTransparentMaterial(
        color: number,
        opacity = 0.92,
        emissiveIntensity = 0.25
    ): THREE.MeshStandardMaterial {
        return new THREE.MeshStandardMaterial({
            color,
            transparent: true,
            opacity,
            roughness: 0.6,
            metalness: 0.02,
            emissive: color,
            emissiveIntensity,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
    }
}
