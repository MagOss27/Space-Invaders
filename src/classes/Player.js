import {
    INITIAL_FRAMES,
    PATH_ENGINE_IMAGE,
    PATH_ENGINE_SPRITES,
    PATH_SPACESHIP_IMAGE
} from "../utils/constants.js";
import Projectile from "./Projectile.js";

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 48 * 2;
        this.height = 48 * 2;
        this.velocity = 6;

        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: canvasHeight - this.height - 30,
        };

        this.image = this.getImage(PATH_SPACESHIP_IMAGE);
        this.engineImage = this.getImage(PATH_ENGINE_IMAGE);
        this.engineSprites = this.getImage(PATH_ENGINE_SPRITES);

        this.sx = 0;               // posição inicial do recorte do sprite
        this.framesCounter = INITIAL_FRAMES;  // contador inicial de frames
    }

    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    moveLeft() {
        this.position.x -= this.velocity;
    }

    moveRight() {
        this.position.x += this.velocity;
    }

    draw(ctx) {
        // Desenha a nave principal
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        // Desenha os sprites da propulsão animada
        ctx.drawImage(
            this.engineSprites,
            this.sx,        // origem X no sprite
            0,              // origem Y no sprite
            48,             // largura do recorte
            48,             // altura do recorte
            this.position.x,
            this.position.y + 10,
            this.width,
            this.height
        );

        // Desenha a imagem extra do motor
        ctx.drawImage(
            this.engineImage,
            this.position.x,
            this.position.y + 8,
            this.width,
            this.height
        );

        this.update();
    }

    update() {
        // Troca o frame quando o contador chega a zero
        if (this.framesCounter <= 0) {
            this.sx = (this.sx === 96) ? 0 : this.sx + 48;
            this.framesCounter = INITIAL_FRAMES;
        }

        // Decrementa o contador a cada atualização
        this.framesCounter--;
    }

    shoot(projectiles) {
        const p = new Projectile({
            x: this.position.x + this.width / 2 - 1,
            y: this.position.y + 2,
        },
            -10
        )

        projectiles.push(p)
    }

}
2;
export default Player;
