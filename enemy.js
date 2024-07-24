class Enemy {
    constructor(x, y, size, hp, damage, speed, color, wave, img_path) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.hp = hp;
        this.maxHp = hp;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.wave = wave;
        this.image = new Image();
        this.image.src = img_path;
        this.angle = 0;
    }

    update(player) {
        const dx = (player.x + player.size / 2) - (this.x + this.size / 2);
        const dy = (player.y + player.size / 2) - (this.y + this.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;

        this.angle = Math.atan2(dy, dx) + Math.PI / 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();

        // Draw enemy health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.size, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 10, (this.hp / this.maxHp) * this.size, 5);
    }

    collidesWith(player) {
        const dx = (this.x + this.size / 2) - (player.x + player.size / 2);
        const dy = (this.y + this.size / 2) - (player.y + player.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size / 2 + player.size / 2);
    }
}
