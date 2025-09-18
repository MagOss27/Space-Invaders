class Player {
    constructor(canvasWidth, canvadsHeight) {
        this.width = 100;
        this.height = 100;
        this.velocity = 6
        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: canvadsHeight - this.height - 30,
        };
    }

    moveleft() {
        this.position.x -= this.velocity

    }

    moveRight() {
        this.position.x += this.velocity

    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

export default Player;
