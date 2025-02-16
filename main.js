const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './img/background.png';


// Constants
const PLAYER_SIZE = 75;
const ENEMY_SIZE = 20;
const ENEMY_SPEED = 0.8;
let BULLET_SIZE = 20;
const BULLET_SPEED = 5;
const PLAYER_HP = 150;
const ENEMY_HP = 20;
const SPAWN_RATE = 0.1; // Chance to spawn an enemy each frame
const SHOOT_INTERVAL = 30; // Frames between each shot
const BONUS_CHANCE = 0.06; // Chance to drop a bonus
const HEAL_CHANCE = 0.16;
const HP_GIVEN_BY_HEAL = 1500
const AURA_BASE_DAMAGE = 1;
const AURA_BASE_SIZE = 10;
const AURA_UPGRADE_DAMAGE = 1;
const AURA_UPGRADE_SIZE = 5;
const BULLET_DAMAGE = 500;
const NB_BONUS_IN_CHOICE = 3;


let currentMusic = null;
const BONUS_POOL = [
    {
        class: 'bonus-button',
        action: 'player.increaseSpeed()',
        imgSrc: './img/speed.png',
        alt: 'Increase Speed',
        text: 'Increase Speed'
    },
    {
        class: 'bonus-button',
        action: 'player.decreaseShootInterval()',
        imgSrc: './img/shoot.png',
        alt: 'Decrease Shoot Interval',
        text: 'Decrease Shoot Interval'
    },
    {
        class: 'bonus-button',
        action: 'player.addDamageAura()',
        imgSrc: './img/aura.png',
        alt: 'Add Damage Aura',
        text: 'Add Damage Aura'
    },
    {
        class: 'bonus-button',
        action: 'player.increaseBulletSize()',
        imgSrc: './img/bullet_size.png',
        alt: 'Increase Bullet Size',
        text: 'Increase Bullet Size'
    },
    {
        class: 'bonus-button',
        action: 'player.increaseBulletDamage()',
        imgSrc: './img/bullet_damage.png',
        alt: 'Increase Bullet Damage',
        text: 'Increase Bullet Damage'
    }
];

const waves = [
    {
        templates: [
            { color: 'orange', speed: 1.5, hp: 500, damage: 15, size: 25, img_path: "./img/orange.png" },
        ],
        probabilities: [1],
        totalEnemies: 60,
        music: "./music/wave_fight.mp3"
    },
    {
        templates: [
            { color: 'blue', speed: 1, hp: 4000, damage: 20, size: 30, img_path: "./img/blue.png" },
            { color: 'purple', speed: 2, hp: 200, damage: 5, size: 20, img_path: "./img/purple.png" }
        ],
        probabilities: [0.2, 0.8],
        totalEnemies: 50
    },
    {
        templates: [
            { color: 'red', speed: 2, hp: 10000, damage: 100, size: 100, img_path: "./img/red.png" },
        ],
        probabilities: [1],
        totalEnemies: 2
    },
    {
        templates: [
            { color: 'brown', speed: 1, hp: 6000, damage: 20, size: 30, img_path: "./img/brown.png" },
            { color: 'white', speed: 1.7, hp: 1000, damage: 10, size: 20, img_path: "./img/white.png" }
        ],
        probabilities: [0.4, 0.6],
        totalEnemies: 100
    },
    {
        templates: [
            { color: 'pink', speed: 3, hp: 50000, damage: 500, size: 200, img_path: "./img/pink.png" },
        ],
        probabilities: [1],
        totalEnemies: 1,
        music: "./music/boss_fight.mp3"
    },
    {
        templates: [
            { color: 'red', speed: 3, hp: 40000, damage: 600, size: 150, img_path: "./img/red.png" },
            { color: 'white', speed: 2, hp: 80000, damage: 500, size: 150, img_path: "./img/white.png" },
            { color: 'blue', speed: 4, hp: 40000, damage: 400, size: 150, img_path: "./img/blue.png" },
        ],
        probabilities: [0.33, 0.34, 0.33],
        totalEnemies: 3,
    },
    // Ajouter d'autres vagues ici...
];

function getRandomBonuses() {
    const shuffled = BONUS_POOL.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, NB_BONUS_IN_CHOICE);
}

function generateBonusMenu() {
    const bonusMenu = document.getElementById('bonusMenu');
    bonusMenu.innerHTML = '<h2>Choose a Bonus</h2>'; // Clear existing content

    const randomBonuses = getRandomBonuses();
    randomBonuses.forEach(bonus => {
        bonus.class = 'bonus-button';
    });
    // Randomly select one of the three to be the super bonus
    const superBonusIndex = Math.floor(Math.random() * randomBonuses.length);
    randomBonuses[superBonusIndex].class = 'bonus-button superBonus';

    randomBonuses.forEach((bonus, index) => {
        const button = document.createElement('button');
        button.className = 'bonus-button';

        let action = bonus.action;
        if (index === superBonusIndex) {
            button.classList.add('superBonus');
            action = `${bonus.action}; ${bonus.action}`;
        }

        button.setAttribute('onclick', action);

        const img = document.createElement('img');
        img.src = bonus.imgSrc;
        img.alt = bonus.alt;

        const p = document.createElement('p');
        p.textContent = bonus.text;

        button.appendChild(img);
        button.appendChild(p);
        bonusMenu.appendChild(button);
    });
}

function restartGame() {
    // Reset game variables
    window.location.href = "./index.html"

}

function playMusic(musicPath) {
    if (currentMusic) {
        currentMusic.pause();
    }
    currentMusic = new Audio(musicPath);
    currentMusic.loop = true;
    currentMusic.volume = document.getElementById('volumeControl').value;
    currentMusic.play();
}

function checkWaveMusic() {
    const wave = waves[currentWave];
    if (wave.music) {
        playMusic(wave.music);
    }
}

function setVolume(volume) {
    if (currentMusic) {
        currentMusic.volume = volume;
    }
}


function spawnEnemy() {
    if (currentWave < waves.length && enemiesSpawned < waves[currentWave].totalEnemies) {
        const wave = waves[currentWave];
        const rand = Math.random();
        let sum = 0;

        for (let i = 0; i < wave.probabilities.length; i++) {
            sum += wave.probabilities[i];
            if (rand < sum) {
                const template = wave.templates[i];
                const edge = Math.floor(Math.random() * 4);
                let x, y;
                if (edge === 0) {
                    x = Math.random() * canvas.width;
                    y = 0;
                } else if (edge === 1) {
                    x = canvas.width;
                    y = Math.random() * canvas.height;
                } else if (edge === 2) {
                    x = Math.random() * canvas.width;
                    y = canvas.height;
                } else {
                    x = 0;
                    y = Math.random() * canvas.height;
                }
                enemies.push(new Enemy(x, y, template.size, template.hp, template.damage, template.speed, template.color, currentWave, template.img_path));
                enemiesSpawned++;
                break;
            }
        }
    }
}

function shoot() {
    if (frameCount % player.shootInterval === 0) {
        let playerCenterX = player.x + PLAYER_SIZE / 2;
        let playerCenterY = player.y + PLAYER_SIZE / 2;

        // Calculate direction vector from player to mouse
        let direction = { x: mouseX - playerCenterX, y: mouseY - playerCenterY };


        // Normalize the direction vector
        let magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= magnitude;
        direction.y /= magnitude;

        // Create the bullet if the direction is valid
        if (direction.x !== 0 || direction.y !== 0) {
            bullets.push(new Bullet(playerCenterX - BULLET_SIZE / 2, playerCenterY - BULLET_SIZE / 2, direction, player.bullet_size, player.bulletDamage, BULLET_IMG_PATH));
        }
    }
}

// Update wave completion logic
function update() {
    if (win || gameOver || isPaused) return;

    frameCount++;

    // Player movement
    player.update(keys, canvas);

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.outOfBounds(canvas.width, canvas.height)) {
            bullets.splice(index, 1);
        }
    });

    // Update enemies
    enemies.forEach((enemy, index) => {
        enemy.update(player);
        if (enemy.collidesWith(player)) {
            player.hp -= 1;
            if (player.hp <= 0) gameOver = true;
        }
        bullets.forEach((bullet, bulletIndex) => {
            if (bullet.collidesWith(enemy)) {
                enemy.hp -= bullet.damage;
                bullets.splice(bulletIndex, 1);
                if (enemy.hp <= 0) {
                    if (enemy.wave === currentWave) {
                        score += 100 * (1 + currentWave / 10);
                        enemiesKilled++;
                    }
                    if (Math.random() < BONUS_CHANCE) {
                        bonuses.push(new Bonus(enemy.x, enemy.y, "./img/bonus.png"));
                    }
                    if (Math.random() < HEAL_CHANCE) {
                        heals.push(new Heal(enemy.x, enemy.y, "./img/heal.png"));
                    }
                    enemies.splice(index, 1);
                }
            }
        });
        if (player.hasAura && player.auraCollidesWith(enemy)) {
            enemy.hp -= player.auraDamage;
            if (enemy.hp <= 0) {
                if (enemy.wave === currentWave) {
                    score += 100 * (1 + currentWave / 10);
                    enemiesKilled++;
                }
                if (Math.random() < BONUS_CHANCE) {
                    bonuses.push(new Bonus(enemy.x, enemy.y, "./img/bonus.png"));
                }
                if (Math.random() < HEAL_CHANCE) {
                    heals.push(new Heal(enemy.x, enemy.y, "./img/heal.png"));
                }
                enemies.splice(index, 1);
            }
        }
    });

    // Update bonuses
    bonuses.forEach((bonus, index) => {
        if (bonus.collidesWith(player)) {
            player.showBonusMenu();
            bonuses.splice(index, 1);
        }
    });

    // Update heals
    heals.forEach((heal, index) => {
        if (heal.collidesWith(player)) {
            player.hp = Math.min(PLAYER_HP, player.hp + 20);
            heals.splice(index, 1);
        }
    });

    // Check wave completion
    if (enemiesKilled >= waves[currentWave].totalEnemies) {
        currentWave++;
        enemiesKilled = 0;
        enemiesSpawned = 0;
        if (currentWave >= waves.length) {
            win = true;
        } else {
            checkWaveMusic();
        }
    }

    // Spawn new enemies periodically
    if (Math.random() < SPAWN_RATE) spawnEnemy();

    // Shoot bullets
    shoot();
}


function draw() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '48px serif';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        if (currentMusic) {
            currentMusic.pause();
        }
        return;
    }

    if (win) {
        ctx.fillStyle = 'green';
        ctx.font = '48px serif';
        ctx.fillText('You win !', canvas.width / 2 - 100, canvas.height / 2);
        if (currentMusic) {
            currentMusic.pause();
        }
        return;
    }

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw player
    player.draw(ctx);

    // Draw bullets
    bullets.forEach(bullet => bullet.draw(ctx));

    // Draw enemies
    enemies.forEach(enemy => enemy.draw(ctx));

    // Draw bonuses
    bonuses.forEach(bonus => bonus.draw(ctx));

    // Draw heals
    heals.forEach(heal => heal.draw(ctx));

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 50);

    // Draw wave info
    ctx.fillText(`Wave: ${currentWave + 1}/${waves.length} | Enemies killed: ${enemiesKilled}/${waves[currentWave].totalEnemies}`, 10, 80);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (['z', 'q', 's', 'd'].includes(e.key)) {
        player.updateDirection(keys);
    }
});

window.addEventListener('keyup', e => {
    keys[e.key] = false;
});
function selectCard(card) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

document.getElementById('krab').addEventListener('click', function () { init_game(this); });
document.getElementById('bob').addEventListener('click', function () { init_game(this); });
document.getElementById('patrick').addEventListener('click', function () { init_game(this); });
document.getElementById('carlo').addEventListener('click', function () { init_game(this); });
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', function (event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});
function init_game(choice) {
    document.getElementById('gameContainer').style.display = 'flex';

    document.getElementById('krab').style.display = 'none';
    document.getElementById('bob').style.display = 'none';
    document.getElementById('patrick').style.display = 'none';
    document.getElementById('carlo').style.display = 'none';
    enemies = [];
    bullets = [];
    bonuses = [];
    heals = [];
    keys = {};
    gameOver = false;
    win = false;
    frameCount = 0;
    isPaused = false;
    score = 0;
    currentWave = 0;
    enemiesKilled = 0;
    enemiesSpawned = 0;

    // Reset player
    if (choice.id == "krab") {
        player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_SIZE, PLAYER_HP, "./img/" + choice.id + ".png");
        BULLET_IMG_PATH = "./img/money.png"
    }
    if (choice.id == "bob") {
        player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_SIZE, PLAYER_HP, "./img/" + choice.id + ".png");
        BULLET_IMG_PATH = "./img/patty.png"
    }
    if (choice.id == "patrick") {
        player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_SIZE, PLAYER_HP, "./img/" + choice.id + ".png");
        BULLET_IMG_PATH = "./img/jellyfish.png"
    }
    if (choice.id == "carlo") {
        player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_SIZE, PLAYER_HP, "./img/" + choice.id + ".png");
        BULLET_IMG_PATH = "./img/clarinet.png"
    }

    player.updatePlayerInfo();
    checkWaveMusic();
    loop();
}