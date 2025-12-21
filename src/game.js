import StartMenuScene from './Scenes/StartMenuScene.js'
import MainScene from './Scenes/MainScene.js'
import InfoScene from './Scenes/infoScene.js'

const config = {
    type: Phaser.WEBGL,
	parent: 'game',
    width:  380,
	height: 410,
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
    scene: [StartMenuScene, InfoScene, MainScene],
	title: "Amigo_Invisible",
	version: "1.0.0"
};

const game = new Phaser.Game(config);