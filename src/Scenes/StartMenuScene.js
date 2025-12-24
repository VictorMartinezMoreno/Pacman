import CTR from "../CTRPipeline.js"

export default class StartMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartMenuScene' }) //id de la escena
    }
    init(map) {
        if (map){
        this.name = map.name;
        this.score = map.score;
        this.highScore = map.highScore;
        this.scoreNum = map.scoreNum;
        }
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
        this.load.spritesheet('Eatable','./assets/sprites/eatable.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('huyendo','./assets/sprites/huyendo.png', {frameWidth: 32, frameHeight: 32});
         this.load.spritesheet('death','./assets/sprites/death.png', {frameWidth: 32, frameHeight: 32});
    }
    create() {
        this.name = this.name || 'tilemap';
        this.score = this.score || '00000';
        this.highScore = localStorage.getItem('bestScore') || this.highScore || '00000';
        this.scoreNum = this.scoreNum || 0;

        this.game.renderer.pipelines.addPostPipeline('CRT', CTR);
        this.cameras.main.setPostPipeline('CRT');
        
        this.input.keyboard.on('keydown', ()=>{
            this.scene.start('infoScene', {name: this.name, score: this.score, highScore: this.highScore, scoreNum: this.scoreNum});
        });

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, "PAC-MAN", {
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