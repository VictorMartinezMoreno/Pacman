import CTR from "../CTRPipeline.js"

export default class InfoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'infoScene' }) //id de la escena
    }

    init(data) {
        this.mapName = data.name;
        this.score = data.score;
        this.highScore = data.highScore;
        this.scoreNum = data.scoreNum;
    }

    create() {
        this.game.renderer.pipelines.addPostPipeline('CRT', CTR);
        this.cameras.main.setPostPipeline('CRT');

        //this.scene.start('MainScene', {name: "tilemap", highScore: this.highScore});

        this.add.text(this.cameras.main.centerX - 130, 40, this.score, {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0.5).setScale(0.15);

        this.add.text(this.cameras.main.centerX, 20, "HIGH SCORE", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0.5).setScale(0.15);

        this.add.text(this.cameras.main.centerX, 40, this.highScore, {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0.5).setScale(0.15);

        this.add.text(this.cameras.main.centerX + 50, 90, "CHARACTER / NICKNAME", {
            fontFamily: "arcade_classic",
            fontSize: 100,
            color: "#ffffffff"
        }).setOrigin(0.5, 0.5).setScale(0.12);

        //BLINKY
        setTimeout(()=>{
            this.add.image(this.cameras.main.centerX - 120, 130, "Blinky", 1).setOrigin(0.5, 0.5);
            setTimeout(()=>{
               this.add.text(this.cameras.main.centerX - 70, 130, "-SHADOW", {fontFamily: "arcade_classic",fontSize: 100,color: "#db0808ff"}).setOrigin(0, 0.5).setScale(0.12);
               setTimeout(()=>{
                   this.add.text(this.cameras.main.centerX + 70, 130, "\"BLINKY\"", {fontFamily: "arcade_classic",fontSize: 100,color: "#db0808ff"}).setOrigin(0, 0.5).setScale(0.12);
                }, 500);
            }, 1000);
        }, 1000);

        //PINKY
        setTimeout(()=>{
            this.add.image(this.cameras.main.centerX - 120, 170, "Pinky", 1).setOrigin(0.5, 0.5);
            setTimeout(()=>{
               this.add.text(this.cameras.main.centerX - 70, 170, "-SPEEDY", {fontFamily: "arcade_classic",fontSize: 100,color: "#ff8da1"}).setOrigin(0, 0.5).setScale(0.12);
               setTimeout(()=>{
                   this.add.text(this.cameras.main.centerX + 70, 170, "\"PINKY\"", {fontFamily: "arcade_classic",fontSize: 100,color: "#ff8da1"}).setOrigin(0, 0.5).setScale(0.12);
                }, 500);
            }, 1000);
        }, 3000);

        //INKY
        setTimeout(()=>{
            this.add.image(this.cameras.main.centerX - 120, 210, "Inky", 1).setOrigin(0.5, 0.5);
            setTimeout(()=>{
               this.add.text(this.cameras.main.centerX - 70, 210, "-BASHFUL", {fontFamily: "arcade_classic",fontSize: 100,color: "#abb5ffff"}).setOrigin(0, 0.5).setScale(0.12);
               setTimeout(()=>{
                   this.add.text(this.cameras.main.centerX + 70, 210, "\"INKY\"", {fontFamily: "arcade_classic",fontSize: 100,color: "#abb5ffff"}).setOrigin(0, 0.5).setScale(0.12);
                }, 500);
            }, 1000);
        }, 5000);

        //CLYDE
        setTimeout(()=>{
            this.add.image(this.cameras.main.centerX - 120, 250, "Clyde", 1).setOrigin(0.5, 0.5);
            setTimeout(()=>{
               this.add.text(this.cameras.main.centerX - 70, 250, "-POKEY", {fontFamily: "arcade_classic",fontSize: 100,color: "#ffab23ff"}).setOrigin(0, 0.5).setScale(0.12);
               setTimeout(()=>{
                   this.add.text(this.cameras.main.centerX + 70, 250, "\"CLYDE\"", {fontFamily: "arcade_classic",fontSize: 100,color: "#ffab23ff"}).setOrigin(0, 0.5).setScale(0.12);
                }, 500);
            }, 1000);
        }, 7000);

        setTimeout(()=>{
            let container = this.add.container(this.cameras.main.centerX - 50, 350);

            let smallP = this.add.text(20, 0, "10 pts", {
                fontFamily: "arcade_classic",
                fontSize: 100,
                color: "#ffffffff"
            }).setOrigin(0, 0.5).setScale(0.12);

            let largeP = this.add.text(20, 25, "50 pts", {
                fontFamily: "arcade_classic",
                fontSize: 100,
                color: "#ffffffff"
            }).setOrigin(0, 0.5).setScale(0.12);

            let smallI = this.add.image(0, 0, "smallBall").setOrigin(0.5, 0.5);
            this.largeI = this.add.image(0, 25, "largeBall").setOrigin(0.5, 0.5);

            this.time.addEvent({
                delay: 200,
                callback: this.parpadeo,
                callbackScope: this,
                loop: true
            });

            container.add([smallP, largeP, smallI, this.largeI]);

        }, 9500);

        setTimeout(()=>{
            this.scene.start("MainScene", {name: this.mapName, highScore: this.highScore, scoreNum: this.scoreNum});
        }, 11000)
    }

    parpadeo(){
        this.largeI.setVisible(!this.largeI.visible);
    }
}