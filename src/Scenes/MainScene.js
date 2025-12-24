import Blinky from "../Entities/Blinky.js"
import Inky from "../Entities/Inky.js"
import Pinky from "../Entities/Pinky.js"
import Clyde from "../Entities/Clyde.js"
import Player from "../Entities/player.js"
import CTR from "../CTRPipeline.js"
import Ball from "../ball.js"

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MainScene' }) //id de la escena
    }

    init(map) {
        this.mapName = map.name;
        this.highScore = map.highScore;
        this.score = map.scoreNum;

        if (map.lifes) this.lifes = map.lifes;
        if (map.catchedBalls) {
            this.catchedBalls = map.catchedBalls;
        }
        else this.catchedBalls = undefined;
    }

    preload() {

    }

    create() {

        this.game.renderer.pipelines.addPostPipeline('CRT', CTR);
        this.cameras.main.setPostPipeline('CRT');

        //Creamos animaciones
        this.createAnims();

        //Creamos el mapa
        this.pointMap = [[]];
        this.map = [[]];
        this.createTileMap();
        this.createMap(this.map, this.pointMap);

        let Ptext = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "READY!", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#f2fa07ff"
        }).setOrigin(0.5, 0.5).setScale(0.5).setDepth(3);

        setTimeout(()=>{this.scene.resume(); Ptext.destroy();}, 2000);
        this.scene.pause();

        this.placeObjects();

        //VIDAS
        this.lifes = this.lifes || 4;

        //HUD
        this.hud();

        //
        this.eatPoints = 200;
    }

    createTileMap(){
        this.tilemap = this.make.tilemap({ key: this.mapName});
        const tilesheet = this.tilemap.addTilesetImage('terrein', "tilesheet");

        //Creamos layers
        this.tilemap.createLayer('terrein', tilesheet).setScale(2);
        this.tilemap.createLayer('walls', tilesheet).setScale(2);
        this.tilemap.createLayer('ghostsDoor', tilesheet).setScale(2);
        this.tilemap.createLayer('crossing', tilesheet).setScale(2);
        this.tilemap.createLayer('tap', tilesheet).setScale(2).setDepth(3);
        this.tilemap.createLayer('smallBalls', tilesheet).setScale(2);
        this.tilemap.createLayer('largeBalls', tilesheet).setScale(2);
    }

    createMap(map, pointMap){

        //Obtenemos información de los tiles de cada capa
        const wallsLayerInfo = this.tilemap.layers.find(layer => layer.name === 'walls');
        const doorLayerInfo = this.tilemap.layers.find(layer => layer.name === 'ghostsDoor');
        const crossingLayerInfo = this.tilemap.layers.find(layer => layer.name === 'crossing');
        const smallBallsLayerInfo = this.tilemap.layers.find(layer => layer.name === 'smallBalls');
        const largeBallsLayerInfo = this.tilemap.layers.find(layer => layer.name === 'largeBalls');

        //Inicializamos el mapa a 0
        for (let row = 0; row < wallsLayerInfo.height; row++) {
            const rowData = [];
            for (let col = 0; col < wallsLayerInfo.width; col++) {
                rowData.push(0);
            }
            map.push(rowData);
        }
        for (let row = 0; row < wallsLayerInfo.height; row++) {
            const rowData = [];
            for (let col = 0; col < wallsLayerInfo.width; col++) {
                rowData.push(0);
            }
            pointMap.push(rowData);
        }

        if (this.catchedBalls === undefined){
            this.catchedBalls = [[]];
            for (let row = 0; row < wallsLayerInfo.height; row++) {
                const rowData = [];
                for (let col = 0; col < wallsLayerInfo.width; col++) {
                    rowData.push(0);
                }
                this.catchedBalls.push(rowData);
            }
        }

        //Inicializamos a 1 las paredes
        for (let row = 0; row < wallsLayerInfo.height; row++) {
            for (let col = 0; col < wallsLayerInfo.width; col++) {
                if (wallsLayerInfo.data[row][col].index !== -1) map[row][col] = 1;
            }
        }

        //Inicializamos a 2 los cruces
        for (let row = 0; row < crossingLayerInfo.height; row++) {
            for (let col = 0; col < crossingLayerInfo.width; col++) {
                if (crossingLayerInfo.data[row][col].index !== -1) map[row][col] = 2;
            }
        }

        //Inicializamos a 3 la puerta de los fantasmas
        for (let row = 0; row < doorLayerInfo.height; row++) {
            for (let col = 0; col < doorLayerInfo.width; col++) {
                if (doorLayerInfo.data[row][col].index !== -1) map[row][col] = 3;
            }
        }

        //Inicializamos a 4 las posiciones de los puntos pequeños
        for (let row = 0; row < smallBallsLayerInfo.height; row++) {
            for (let col = 0; col < smallBallsLayerInfo.width; col++) {
                if (smallBallsLayerInfo.data[row][col].index !== -1) pointMap[row][col] = 4;
            }
        }

        //Inicializamos a 5 las posiciones de los puntos grandes
        for (let row = 0; row < largeBallsLayerInfo.height; row++) {
            for (let col = 0; col < largeBallsLayerInfo.width; col++) {
                if (largeBallsLayerInfo.data[row][col].index !== -1) pointMap[row][col] = 5;
            }
        }

        for (let row = 0; row < this.catchedBalls.length; row++) {
            for (let col = 0; col < this.catchedBalls[row].length; col++) {
                if (this.catchedBalls[row][col] === 1) pointMap[row][col] = -1;
            }
        }
    }
    placeObjects(){
        //Colocamos objetos
        //player
        const players = this.tilemap.createFromObjects('player', { name: 'Paxmas', classType: Player, key: "player"});
        this.player = players[0];
        this.player.x *= 2; this.player.y *= 2;
        this.player.init();

        //fantasmas
        this.ghosts = {
            Blinky: this.tilemap.createFromObjects('ghosts', { name: 'Blinky', classType: Blinky, key: "Blinky"}),
            Inky: this.tilemap.createFromObjects('ghosts', { name: 'Inky', classType: Inky, key: "Inky"}),
            Pinky: this.tilemap.createFromObjects('ghosts', { name: 'Pinky', classType: Pinky, key: "Pinky"}),
            Clyde: this.tilemap.createFromObjects('ghosts', { name: 'Clyde', classType: Clyde, key: "Clyde"}),
        }

        this.ghosts.Blinky[0].x *= 2; this.ghosts.Blinky[0].y *= 2; this.ghosts.Blinky[0].init();
        this.ghosts.Inky[0].x *= 2; this.ghosts.Inky[0].y *= 2; setTimeout(()=>{this.ghosts.Inky[0].init();}, 3000)
        this.ghosts.Pinky[0].x *= 2; this.ghosts.Pinky[0].y *= 2; setTimeout(()=>{this.ghosts.Pinky[0].init();}, 4000) 
        this.ghosts.Clyde[0].x *= 2; this.ghosts.Clyde[0].y *= 2; setTimeout(()=>{this.ghosts.Clyde[0].init();}, 5000)

        //Puntos
        this.points = 0;
        for (let i = 0; i < this.pointMap.length; i++) for (let j = 0; j < this.pointMap[1].length; j++){
            if (i != this.player.posY || j != this.player.posX){
                if (this.pointMap[i][j] === 4){
                    new Ball(this, j*4, i*4, "smallBall", 10);
                    this.points++;
                }
                else if (this.pointMap[i][j] === 5){
                    new Ball(this, j*4, i*4, "largeBall", 50);
                    this.points++;
                }
            }
        }
    }

    createAnims(){
        if (!this.anims.exists("playerMoving")) {
            this.anims.create({
                key: "playerMoving",
                frames: this.anims.generateFrameNumbers("player", { start: 0, end: 6}),
                frameRate: 45,
                repeat: -1
            });
        }

        if (!this.anims.exists("BlinkyMovingSide")) {
            this.anims.create({
                key: "BlinkyMovingSide",
                frames: this.anims.generateFrameNumbers("Blinky", { start: 0, end: 1}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("BlinkyMovingUp")) {
            this.anims.create({
                key: "BlinkyMovingUp",
                frames: this.anims.generateFrameNumbers("Blinky", { start: 2, end: 3}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("BlinkyMovingDown")) {
            this.anims.create({
                key: "BlinkyMovingDown",
                frames: this.anims.generateFrameNumbers("Blinky", { start: 4, end: 5}),
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this.anims.exists("InkyMovingSide")) {
            this.anims.create({
                key: "InkyMovingSide",
                frames: this.anims.generateFrameNumbers("Inky", { start: 0, end: 1}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("InkyMovingUp")) {
            this.anims.create({
                key: "InkyMovingUp",
                frames: this.anims.generateFrameNumbers("Inky", { start: 2, end: 3}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("InkyMovingDown")) {
            this.anims.create({
                key: "InkyMovingDown",
                frames: this.anims.generateFrameNumbers("Inky", { start: 4, end: 5}),
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this.anims.exists("PinkyMovingSide")) {
            this.anims.create({
                key: "PinkyMovingSide",
                frames: this.anims.generateFrameNumbers("Pinky", { start: 0, end: 1}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("PinkyMovingUp")) {
            this.anims.create({
                key: "PinkyMovingUp",
                frames: this.anims.generateFrameNumbers("Pinky", { start: 2, end: 3}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("PinkyMovingDown")) {
            this.anims.create({
                key: "PinkyMovingDown",
                frames: this.anims.generateFrameNumbers("Pinky", { start: 4, end: 5}),
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this.anims.exists("ClydeMovingSide")) {
            this.anims.create({
                key: "ClydeMovingSide",
                frames: this.anims.generateFrameNumbers("Clyde", { start: 0, end: 1}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("ClydeMovingUp")) {
            this.anims.create({
                key: "ClydeMovingUp",
                frames: this.anims.generateFrameNumbers("Clyde", { start: 2, end: 3}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("ClydeMovingDown")) {
            this.anims.create({
                key: "ClydeMovingDown",
                frames: this.anims.generateFrameNumbers("Clyde", { start: 4, end: 5}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("eatableAnim")) {
            this.anims.create({
                key: "eatableAnim",
                frames: this.anims.generateFrameNumbers("Eatable", { start: 0, end: 1}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("lowEatableAnim")) {
            this.anims.create({
                key: "lowEatableAnim",
                frames: this.anims.generateFrameNumbers("Eatable", { frames:[0, 2]}),
                frameRate: 5,
                repeat: -1
            });
        }

        if (!this.anims.exists("huyendoSide")) {
            this.anims.create({
                key: "huyendoSide",
                frames: this.anims.generateFrameNumbers("huyendo", { start: 0, end: 1}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("huyendoUp")) {
            this.anims.create({
                key: "huyendoUp",
                frames: this.anims.generateFrameNumbers("huyendo", { start: 2, end: 3}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("huyendoDown")) {
            this.anims.create({
                key: "huyendoDown",
                frames: this.anims.generateFrameNumbers("huyendo", { start: 4, end: 5}),
                frameRate: 5,
                repeat: -1
            });
        }
        if (!this.anims.exists("diying")) {
            this.anims.create({
                key: "diying",
                frames: this.anims.generateFrameNumbers("death", { start: 0, end: 15}),
                frameRate: 20,
            });
        }
    }

    hud(){
        this.scoreText = this.add.text(this.cameras.main.centerX - 100, this.sys.game.canvas.height - 25, "00000", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(1, 0.5).setScale(0.11);
        this.updatePoints(0);

        this.add.text(this.cameras.main.centerX, this.sys.game.canvas.height - 30, "HIGH SCORE", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0.5).setScale(0.11);

        this.add.text(this.cameras.main.centerX, this.sys.game.canvas.height - 15, this.highScore, {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0.5).setScale(0.11);

        if (this.lifes > 2) this.add.image(this.cameras.main.centerX + 125, this.sys.game.canvas.height - 25, 'player', 1).setOrigin(0.5, 0.5).setScale(0.5);
        if (this.lifes > 1) this.add.image(this.cameras.main.centerX + 100, this.sys.game.canvas.height - 25, 'player', 1).setOrigin(0.5, 0.5).setScale(0.5);
        if (this.lifes > 3) this.add.image(this.cameras.main.centerX + 150, this.sys.game.canvas.height - 25, 'player', 1).setOrigin(0.5, 0.5).setScale(0.5);
    }

    updatePoints(points, discountBalls = true){
        this.score += points

        let text = ""
        let howZ = 0;

        for(let i = this.score; i > 0; i = Math.trunc(i/10)) howZ++;

        for (let i = 5-howZ; i > 0; i--) text += "0";
        text+=this.score;

        this.scoreText.setText(text);

        if (points > 0 && discountBalls) this.points--;

        if (this.points <= 0){

            setTimeout(()=>{
                let highScore = 0;
                (this.highScore > this.score)? highScore = this.highScore : highScore = this.score;

                let text2 = ""
                if (highScore === this.score){
                    let howZ2 = 0;
                    for(let i = highScore; i > 0; i = Math.trunc(i/10)) howZ2++;
                    for (let i = 5-howZ2; i > 0; i--) text2 += "0";
                }
                text2+=highScore;

                localStorage.setItem('bestScore', text2);
                this.scene.start("infoScene", {name: "tilemap", score: text, highScore: text2, scoreNum: this.score});
            }, 3000);

            this.scene.pause();
        }
    }
}