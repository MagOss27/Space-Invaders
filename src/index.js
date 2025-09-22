import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import { GameState } from "./utils/constants.js";

const soundEffects = new SoundEffects()

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");

gameOverScreen.remove()

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// ---------- PLAYER & GRID (necessário para setCanvasSize) ----------
const player = new Player(window.innerWidth, window.innerHeight);
const grid = new Grid(3, 6);

const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];
const obstacles = [];

const initObstacles = () => {
    const x = canvas.width / 2 - 50;
    const y = canvas.height - 250;
    const offset = canvas.width * 0.15;

    const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, "#800000");
    const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, "#800000");

    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
}

initObstacles();

// ---------- RESPONSIVE CANVAS (DPR safe) ----------
const setCanvasSize = () => {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  player.position.x = cssWidth / 2 - player.width / 2;
  player.position.y = cssHeight - player.height - 30;

  obstacles.length = 0;
  initObstacles();
};

setCanvasSize();
window.addEventListener("resize", setCanvasSize);
window.addEventListener("orientationchange", setCanvasSize);
// ---------------------------------------------------

let currentState = GameState.START

const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

const showGameData = () => {
    scoreElement.textContent = gameData.score;
    levelElement.textContent = gameData.level;
    highElement.textContent = gameData.high;
};

const keys = {
    left: false,
    right: false,
    shoot: {
        pressed: false,
        released: true,
    },
};

// ---------- MOBILE CONTROLS ----------
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const createMobileControls = () => {
  if (!isTouchDevice()) return;

  const controls = document.createElement("div");
  controls.className = "mobile-controls";
  controls.innerHTML = `
    <button class="mc-left" aria-label="left">◀</button>
    <button class="mc-shoot" aria-label="shoot">●</button>
    <button class="mc-right" aria-label="right">▶</button>
  `;
  document.body.appendChild(controls);

  const leftBtn = controls.querySelector(".mc-left");
  const rightBtn = controls.querySelector(".mc-right");
  const shootBtn = controls.querySelector(".mc-shoot");

  const bindPress = (el, onDown, onUp) => {
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); onDown(); });
    el.addEventListener("pointerup", (e) => { e.preventDefault(); onUp(); });
    el.addEventListener("pointercancel", (e) => { e.preventDefault(); onUp(); });
    el.addEventListener("pointerleave", (e) => { e.preventDefault(); onUp(); });
  };

  bindPress(leftBtn, () => { keys.left = true; }, () => { keys.left = false; });
  bindPress(rightBtn, () => { keys.right = true; }, () => { keys.right = false; });
  bindPress(shootBtn,
    () => { keys.shoot.pressed = true; keys.shoot.released = true; },
    () => { keys.shoot.pressed = false; keys.shoot.released = true; }
  );

  canvas.style.touchAction = "none";
};

createMobileControls();
// -------------------------------------------------------------


const incrementScore = (value) => {
    gameData.score += value;

    if (gameData.score > gameData.high) {
        gameData.high = gameData.score;
    }
};

const drawObstacles = () => {
    obstacles.forEach((obstacles) => obstacles.draw(ctx))
}

const drawProjectiles = () => {

    const projectiles = [...playerProjectiles, ...invadersProjectiles]

    projectiles.forEach((projectile) => {
        projectile.draw(ctx);
        projectile.update();
    });
};


const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(ctx)
        particle.update()
    })
}

const clearProjectiles = () => {
  for (let i = playerProjectiles.length - 1; i >= 0; i--) {
    if (playerProjectiles[i].position.y <= 0) {
      playerProjectiles.splice(i, 1);
    }
  }
  for (let i = invadersProjectiles.length - 1; i >= 0; i--) {
    if (invadersProjectiles[i].position.y >= window.innerHeight) {
      invadersProjectiles.splice(i, 1);
    }
  }
};

const clearParticles = () => {
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].opacity <= 0) {
      particles.splice(i, 1);
    }
  }
};

const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i += 1) {
        const particle = new Particle(
            {
                x: position.x,
                y: position.y,
            },
            {
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5,
            },
            2,
            color
        );

        particles.push(particle);
    }
};


const checkShootInvaders = () => {
    grid.invaders.forEach((invader, invaderIndex) => {
        playerProjectiles.some((projectile, projectileIndex) => {
            if (invader.hit(projectile)) {
                soundEffects.playHitSound()
                createExplosion(
                    {
                        x: invader.position.x + invader.width / 2,
                        y: invader.position.y + invader.height / 2,
                    },
                    10,
                    "#941CFF"
                )


                incrementScore(10)

                grid.invaders.splice(invaderIndex, 1)
                playerProjectiles.splice(projectileIndex, 1)

            }
        })
    })
}

const checkShootPlayer = () => {
    invadersProjectiles.some((projectile, i) => {
        if (player.hit(projectile)) {
            soundEffects.playExplosionSound()
            invadersProjectiles.splice(i, 1)
            gameOver()
        }
    })
}

const checkShootObstacles = () => {
    obstacles.forEach((obstacle) => {

        playerProjectiles.some((projectile, i) => {
            if (obstacle.hit(projectile)) {
                playerProjectiles.splice(i, 1)
            }
        })

        invadersProjectiles.some((projectile, i) => {
            if (obstacle.hit(projectile)) {
                invadersProjectiles.splice(i, 1)
            }
        })
    })
}

const spawnGrid = () => {
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound()
        grid.rows = Math.round(Math.random() * 9 + 1)
        grid.cols = Math.round(Math.random() * 9 + 1)
        grid.restart()

        gameData.level += 1
    }
}

const gameOver = () => {
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10,
        "white"
    )
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10,
        "#4D9BE6"
    )
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10,
        "crimson"
    )

    currentState = GameState.GAME_OVER
    player.alive = false
    document.body.append(gameOverScreen)
}

const gameLoop = () => {
// Limpa usando CSS pixels (porque usamos ctx.setTransform(dpr...))
ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (currentState == GameState.PLAYING) {
        showGameData()
        spawnGrid()

        drawParticles()
        drawProjectiles();
        drawObstacles()

        clearProjectiles();
        clearParticles()

        checkShootPlayer()
        checkShootInvaders()
        checkShootObstacles()

        grid.draw(ctx)
        grid.update(player.alive)

        ctx.save();

        ctx.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );

        if (keys.shoot.pressed && keys.shoot.released) {
            soundEffects.playShootSound()
            player.shoot(playerProjectiles);
            keys.shoot.released = false;
        }

        if (keys.left && player.position.x >= 0) {
            player.moveLeft();
            ctx.rotate(-0.15);
        }

        if (keys.right && player.position.x <= canvas.width - player.width) {
            player.moveRight();
            ctx.rotate(0.15);
        }

        ctx.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        );

        player.draw(ctx);
        ctx.restore();

    }

    if (currentState == GameState.GAME_OVER) {
        checkShootObstacles()

        drawParticles()
        drawProjectiles()
        drawObstacles()

        clearProjectiles()
        clearParticles()

        grid.draw(ctx)
        grid.update(player.alive)
    }

    requestAnimationFrame(gameLoop)
}

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

const unlockAudio = () => {
  // Array com todos os áudios que você usa
  const allSounds = [
    ...soundEffects.shootSounds,
    ...soundEffects.hitSounds,
    soundEffects.explosionSound,
    soundEffects.nextLevelSound
  ];

  // Tenta "tocar e parar" cada um
  allSounds.forEach(audio => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {
      // se não tocar (erro de autoplay), ignora
    });
  });
};


buttonPlay.addEventListener("click", () => {
  startScreen.remove();
  scoreUi.style.display = "block";
  currentState = GameState.PLAYING;

  unlockAudio(); // <- importante no mobile

  setInterval(() => {
    const invader = grid.getRandonInvader();
    if (invader) {
      invader.shoot(invadersProjectiles);
    }
  }, 1000);
});

buttonRestart.addEventListener("click", () => {
    currentState = GameState.PLAYING
    player.alive = true
    grid.invaders.length = 0
    grid.invadersVelocity = 1

    invadersProjectiles.length = 0

    gameData.score = 0
    gameData.level = 0

    gameOverScreen.remove()
})

gameLoop();
