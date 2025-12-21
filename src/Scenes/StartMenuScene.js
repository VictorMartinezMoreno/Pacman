import CTR from "../CTRPipeline.js"

export default class StartMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartMenuScene' }) //id de la escena
    }
    init() {

    }
    preload() {
        this.load.tilemapTiledJSON("tilemap", "./assets/sprites/tiled/map0.json");
        this.load.image("tilesheet", "./assets/sprites/tiled/tileSheet.png");
        this.load.spritesheet('player','./assets/sprites/Paxmas.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('Blinky','./assets/sprites/Blinky.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('Inky','./assets/sprites/Inky.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('Pinky','./assets/sprites/Pinky.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('Clyde','./assets/sprites/Clyde.png', {frameWidth: 32, frameHeight: 32});
        this.load.image("smallBall", "./assets/sprites/smallBall.png");
        this.load.image("largeBall", "./assets/sprites/largeBall.png");
    }
    create() {
        
        this.game.renderer.pipelines.addPostPipeline('CRT', CTR);
        this.cameras.main.setPostPipeline('CRT');
        
        this.input.keyboard.on('keydown', ()=>{
            this.scene.start('infoScene', {name: 'tilemap', score: "00000", highScore: "00000", scoreNum: 0});
        });

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, "PAX-MAS", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#fff700ff"
        }).setOrigin(0.5, 0.5).setScale(0.35);

        let start = this.add.text(this.cameras.main.centerX, this.sys.game.canvas.height - 25, "Press any key to start", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0).setScale(0.1);

        this.tweens.add({
            targets: start,
            alpha: 0,
            ease: 'Quad.InOut',
            duration: 1000,
            repeat: -1,
            yoyo: true,
        });
    }
}