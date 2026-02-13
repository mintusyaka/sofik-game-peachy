export class MathUtils {
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    static distance(x1, y1, x2, y2) {
        return Math.sqrt(this.distanceSquared(x1, y1, x2, y2));
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static checkCircleCollision(c1, c2) {
        const distSq = this.distanceSquared(c1.x, c1.y, c2.x, c2.y);
        const radiusSum = c1.radius + c2.radius;
        return distSq < (radiusSum * radiusSum);
    }
}
