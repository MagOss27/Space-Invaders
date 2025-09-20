import Grid from "./classes/Grid.js";
import Player from "./classes/Player.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

ctx.imageSmoothingEnabled = false;

const player = new Player(canvas.width, canvas.height);
const grid = new Grid(3, 6);

const playerProjectiles = [];
const invadersProjectiles = [];

const keys = {
    left: false,
    right: false,
    shoot: {
        pressed: false,
        released: true,
    },
};

const drawProjectiles = () => {

    const projectiles = [...playerProjectiles, ...invadersProjectiles]

    projectiles.forEach((projectile) => {
        projectile.draw(ctx);
        projectile.update();
    });
};

const clearProjectiles = () => {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        if (playerProjectiles[i].position.y <= 0) {
            playerProjectiles.splice(i, 1);
        }
    }
};

const checkShootInvaders = () => {
    grid.invaders.forEach((invader, invaderIndex) => {
        playerProjectiles.some((projectile, projectileIndex) => {
            if (invader.hit(projectile)) {
                grid.invaders.splice(invaderIndex, 1)
                playerProjectiles.splice(projectileIndex, 1)
            }
        })
    })
}

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawProjectiles();
    clearProjectiles();
    checkShootInvaders()

    // desenha e atualiza os invaders
    grid.invaders.forEach((invader) => invader.draw(ctx));
    grid.update();

    // salva o estado antes de rotacionar
    ctx.save();
    ctx.translate(
        player.position.x + player.width / 2,
        player.position.y + player.height / 2
    );

    let rotation = 0;

    if (keys.left && player.position.x >= 0) {
        player.moveLeft();
        rotation = -0.15;
    }

    if (keys.right && player.position.x <= canvas.width - player.width) {
        player.moveRight();
        rotation = 0.15;
    }

    ctx.rotate(rotation);

    ctx.translate(
        -(player.position.x + player.width / 2),
        -(player.position.y + player.height / 2)
    );

    if (keys.shoot.pressed && keys.shoot.released) {
        player.shoot(playerProjectiles);
        keys.shoot.released = false;
    }

    player.draw(ctx);

    ctx.restore();

    requestAnimationFrame(gameLoop);
};

// Captura as teclas
addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a") keys.left = true;
    if (key === "d") keys.right = true;
    if (key === "enter") keys.shoot.pressed = true;
});

addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a") keys.left = false;
    if (key === "d") keys.right = false;
    if (key === "enter") {
        keys.shoot.pressed = false;
        keys.shoot.released = true;
    }
});

setInterval(() => {
    const invader = grid.getRandonInvader()

    if (invader) {
        invader.shoot(invadersProjectiles)
    }
}, 1000)

gameLoop();
