import Ghost from "../Entities/ghost.js"
import Player from "../Entities/player.js"
import CTR from "../CTRPipeline.js"

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MainScene' }) //id de la escena
    }

    init() {

    }

    preload() {

    }

    create() {

        this.game.renderer.pipelines.addPostPipeline('CRT', CTR);
        this.cameras.main.setPostPipeline('CRT');

        //Creamos animaciones
        this.createAnims();

        //Creamos el mapa
        this.map = [[]];
        this.createTileMap();
        this.createMap(this.map);
    }

    createTileMap(){
        this.tilemap = this.make.tilemap({ key: 'tilemap' });
        const tilesheet = this.tilemap.addTilesetImage('terrein', "tilesheet");

        //Creamos layers
        this.tilemap.createLayer('terrein', tilesheet).setScale(2);
        this.tilemap.createLayer('walls', tilesheet).setScale(2);
        this.tilemap.createLayer('ghostsDoor', tilesheet).setScale(2);
        this.tilemap.createLayer('crossing', tilesheet).setScale(2);
        this.tilemap.createLayer('tap', tilesheet).setScale(2).setDepth(3);

        //Colocamos objetos
        this.player = this.tilemap.createFromObjects('player', { name: 'Paxmas', classType: Player, key: "player"});
        this.player[0].x *= 2; this.player[0].y *= 2;
        this.player[0].init();

        this.ghosts = {
            Blinky: this.tilemap.createFromObjects('ghosts', { name: 'Blinky', classType: Ghost, key: "Blinky"}),
            Inky: this.tilemap.createFromObjects('ghosts', { name: 'Inky', classType: Ghost, key: "Inky"}),
            Pinky: this.tilemap.createFromObjects('ghosts', { name: 'Pinky', classType: Ghost, key: "Pinky"}),
            Clyde: this.tilemap.createFromObjects('ghosts', { name: 'Clyde', classType: Ghost, key: "Clyde"}),
        }

        this.ghosts.Blinky[0].x *= 2; this.ghosts.Blinky[0].y *= 2;
        this.ghosts.Inky[0].x *= 2; this.ghosts.Inky[0].y *= 2;
        this.ghosts.Pinky[0].x *= 2; this.ghosts.Pinky[0].y *= 2;
        this.ghosts.Clyde[0].x *= 2; this.ghosts.Clyde[0].y *= 2;
    }

    createMap(map){

        //Obtenemos información de los tiles de cada capa
        const wallsLayerInfo = this.tilemap.layers.find(layer => layer.name === 'walls');
        const doorLayerInfo = this.tilemap.layers.find(layer => layer.name === 'ghostsDoor');
        const crossingLayerInfo = this.tilemap.layers.find(layer => layer.name === 'crossing');

        //Inicializamos el mapa a 0
        for (let row = 0; row < wallsLayerInfo.height; row++) {
            const rowData = [];
            for (let col = 0; col < wallsLayerInfo.width; col++) {
                rowData.push(0);
            }
            map.push(rowData);
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
    }
}