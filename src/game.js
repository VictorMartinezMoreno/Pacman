import StartMenuScene from './Scenes/StartMenuScene.js'
import MainScene from './Scenes/MainScene.js'

const config = {
    type: Phaser.WEBGL,
	parent: 'game',
    width:  380,
	height: 372,
	 render: {
        pixelArt: true,
        antialias: false
    },
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
    
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0},
            debug: false
        },
        checkCollision: {
			up: true,
			down: true,
			left: true,
			right: true
		}
    },
    scene: [StartMenuScene, MainScene],
	title: "Amigo_Invisible",
	version: "1.0.0"
};

const game = new Phaser.Game(config);