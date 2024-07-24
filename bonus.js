class Bonus {
    constructor(x, y, imageSrc) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.image = new Image();
        this.image.src = imageSrc;

    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    collidesWith(player) {
        return Math.abs(player.x - this.x) < player.size && Math.abs(player.y - this.y) < player.size;
    }
}
