export class InputHandler {
    constructor() {
        this.keys = {};
        this.velocity = { x: 0, y: 0 };
        this.joystick = null;

        this.init();
    }

    init() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    setJoystick(joystick) {
        this.joystick = joystick;
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
        this.updateVelocity();
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
        this.updateVelocity();
    }

    updateVelocity() {
        let x = 0;
        let y = 0;

        if (this.keys['ArrowUp'] || this.keys['KeyW']) y -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) y += 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;

        // Normalize vector
        if (x !== 0 || y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }

        this.velocity = { x, y };
    }

    getMovement() {
        // Priority: Joystick > Keyboard (or combine?)
        // If joystick is active (non-zero), use it
        if (this.joystick) {
            const joyVel = this.joystick.getVelocity();
            if (joyVel.x !== 0 || joyVel.y !== 0) {
                return joyVel;
            }
        }

        return this.velocity;
    }
}
