import { Container, Graphics } from 'pixi.js';

export class Joystick extends Container {
    constructor(opts = {}) {
        super();

        this.innerRadius = opts.innerRadius || 25;
        this.outerRadius = opts.outerRadius || 60;
        this.baseColor = opts.baseColor || 0x888888;
        this.stickColor = opts.stickColor || 0xcccccc;

        this.dragging = false;
        this.velocity = { x: 0, y: 0 };
        this.positionCache = { x: 0, y: 0 };
        this.pointerId = null;

        this.init();
    }

    init() {
        // Base
        this.base = new Graphics()
            .circle(0, 0, this.outerRadius)
            .fill({ color: this.baseColor, alpha: 0.5 });

        // Stick
        this.stick = new Graphics()
            .circle(0, 0, this.innerRadius)
            .fill({ color: this.stickColor, alpha: 0.8 });

        this.addChild(this.base);
        this.addChild(this.stick);

        // Interaction
        this.eventMode = 'static';
        this.cursor = 'pointer';

        // We bind to the base but handle drag globally once started
        this.on('pointerdown', this.onPointerDown, this);
        // Listen to global move/up to handle dragging outside the base
        // Pixi v8 stage events usually bubble, but better to attach to window or a global overlay
        // For simplicity, we'll listen on this component and assume user keeps finger "down"
        // Actually, to handle "drag out", best to use 'global' events on the interaction manager or stage.
        // simpler approach:
        this.checkGlobalEvents = false;
    }

    onPointerDown(e) {
        this.dragging = true;
        this.pointerId = e.pointerId;
        this.base.alpha = 0.8;

        // Convert global to local (relative to joystick center)
        const local = this.toLocal(e.global);
        this.updateStick(local.x, local.y);

        // Add global listeners for drag
        // Pixi Stage is the usual target for global moves
        const stage = this.parent.parent.parent; // Hacky way to find stage? No.
        // Better: listen on `window` or `document` for move/up if possible, or `this.eventMode = 'static'` handles it?
        // In Pixi, once an element is pointerdown'd, it captures events? Not always by default.
        // Let's use the event's target (stage) for move

        // Safest approach in v8: Add listener to window for move/up while dragging
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerMove = (e) => {
        if (!this.dragging) return;
        if (this.pointerId !== null && e.pointerId !== this.pointerId) return;

        // We need to map window client coordinates to our container's local space
        // Since we can be scaled/rotated.
        // `this.toLocal` expects a Point-like object with x/y
        const globalP = { x: e.clientX, y: e.clientY };
        const local = this.toLocal(globalP);

        this.updateStick(local.x, local.y);
    }

    onPointerUp = (e) => {
        if (this.pointerId !== null && e.pointerId !== this.pointerId) return;

        this.dragging = false;
        this.pointerId = null;
        this.base.alpha = 0.5;
        this.stick.position.set(0, 0);
        this.velocity = { x: 0, y: 0 };

        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
    }

    updateStick(x, y) {
        const dist = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        const limit = this.outerRadius - this.innerRadius; // keep stick inside base

        // Clamp distance
        const cappedDist = Math.min(dist, limit);

        this.stick.x = Math.cos(angle) * cappedDist;
        this.stick.y = Math.sin(angle) * cappedDist;

        // Normalize output (-1 to 1)
        // We want full speed at limit
        const force = Math.min(dist / limit, 1.0);

        this.velocity = {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force
        };
    }

    getVelocity() {
        return this.velocity;
    }
}
