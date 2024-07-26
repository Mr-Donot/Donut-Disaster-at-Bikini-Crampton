class Bullet {
    constructor(x, y, direction, size, damage, img_path) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.size = size;
        this.speed = BULLET_SPEED;
        this.image = new Image();
        this.image.src = img_path;
        this.damage = damage;
    }

    update() {
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    outOfBounds(width, height) {
        return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
    }

    collidesWith(enemy) {
        const dx = (this.x + this.size / 2) - (enemy.x + enemy.size / 2);
        const dy = (this.y + this.size / 2) - (enemy.y + enemy.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size / 2 + enemy.size / 2);
    }
}
