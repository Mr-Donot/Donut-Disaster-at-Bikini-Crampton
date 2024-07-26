class Player {
    constructor(x, y, size, hp, imageSrc) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.bullet_size = BULLET_SIZE;
        this.hp = hp;
        this.speed = 3;
        this.shootInterval = 10;
        this.direction = { x: 0, y: 0 };
        this.initialDirection = { x: 0, y: -1 };
        this.hasAura = false;
        this.auraSize = 50;
        this.auraDamage = 5;
        this.auraColor = '#FFFF00A0'; // Yellow with transparency
        this.image = new Image();
        this.image.src = imageSrc;
        this.angle = 0;
        this.level = 1;
        this.movementSpeedLevel = 0;
        this.shootingSpeedLevel = 0;
        this.auraLevel = 0;
    }

    update(keys, canvas) {
        let moving = false;
        if (keys['z']) {
            this.y -= this.speed;
            this.direction.y = -1;
            moving = true;
        }
        if (keys['s']) {
            this.y += this.speed;
            this.direction.y = 1;
            moving = true;
        }
        if (keys['q']) {
            this.x -= this.speed;
            this.direction.x = -1;
            moving = true;
        }
        if (keys['d']) {
            this.x += this.speed;
            this.direction.x = 1;
            moving = true;
        }

        if (!moving) {
            this.direction.x = 0;
            this.direction.y = 0;
        }

        this.x = Math.max(0, Math.min(canvas.width - this.size, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.size, this.y));

        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.angle = Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2;
        }
    }

    updateDirection(keys) {
        this.direction = { x: (keys['d'] ? 1 : 0) - (keys['q'] ? 1 : 0), y: (keys['s'] ? 1 : 0) - (keys['z'] ? 1 : 0) };
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            this.initialDirection = { ...this.direction };
        }
    }

    draw(ctx) {
        // Draw aura if the player has one
        if (this.hasAura) {
            ctx.fillStyle = this.auraColor;
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.auraSize, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw player
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();

        // Draw player health bar
        ctx.fillStyle = 'green';
        ctx.fillRect(10, 10, (this.hp / PLAYER_HP) * 200, 20);
    }

    showBonusMenu() {
        isPaused = true;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('bonusMenu').style.display = 'block';
    }

    increaseSpeed() {
        this.speed += 1;
        this.movementSpeedLevel += 1;
        this.level += 1;
        this.updatePlayerInfo();
        this.removeBonusMenu();
    }

    decreaseShootInterval() {
        this.shootInterval = Math.max(1, this.shootInterval - 1);
        this.shootingSpeedLevel += 1;
        this.level += 1;
        this.updatePlayerInfo();
        this.removeBonusMenu();
    }

    addDamageAura() {
        if (!this.hasAura) {
            this.hasAura = true;
        } else {
            this.auraDamage += 5;
            this.auraSize += 10;
            this.updateAuraColor();
        }
        this.auraLevel += 1;
        this.level += 1;
        this.updatePlayerInfo();
        this.removeBonusMenu();
    }

    increaseBulletSize() {
        this.bullet_size += 5;
        this.updatePlayerInfo();
        this.removeBonusMenu();
    }

    updateAuraColor() {
        if (this.auraDamage < 10) {
            this.auraColor = '#FFFF00A0'; // Yellow with transparency
        } else if (this.auraDamage < 20) {
            this.auraColor = '#FFA500A0'; // Orange with transparency
        } else {
            this.auraColor = '#FF0000A0'; // Red with transparency
        }
    }

    updatePlayerInfo() {
        document.getElementById('level').innerText = this.level;
        document.getElementById('movementSpeed').innerText = this.movementSpeedLevel;
        document.getElementById('shootingSpeed').innerText = this.shootingSpeedLevel;
        document.getElementById('auraLevel').innerText = this.auraLevel;
    }

    auraCollidesWith(enemy) {
        const dx = (this.x + this.size / 2) - (enemy.x + enemy.size / 2);
        const dy = (this.y + this.size / 2) - (enemy.y + enemy.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.auraSize + enemy.size / 2;
    }

    removeBonusMenu() {
        isPaused = false;
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('bonusMenu').style.display = 'none';
    }
}
