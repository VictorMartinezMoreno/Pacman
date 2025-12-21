
export default class ball extends Phaser.GameObjects.Sprite {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, points, frame = 0) {
        super(scene, x, y, texture, frame); //super, esencial al heredar de Sprites de Phaser, (escena de dnd procede,posicion X, posicion Y, textura que recibe, y el frame inicial)
        this.scene.add.existing(this);

        this.setOrigin(0.5, 0.5)
        this.setScale(0.65);
        this.setDepth(0);

        if (texture === "largeBall"){
            this.scene.time.addEvent({
                delay: 300,
                callback: this.parpadeo,
                callbackScope: this,
                loop: true
            });
        }

        this.scene.physics.add.existing(this);
        this.body.width = this.displayWidth * 0.7; this.body.height = this.displayHeight * 0.7;
        this.body.setOffset(this.displayWidth - this.body.width, this.displayHeight - this.body.height);

        this.points = points;

        this.scene.physics.add.overlap(this, this.scene.player, (ball) =>{
            this.scene.updatePoints(ball.points);
            ball.destroy();
        });
    }
    preUpdate(t, dt) {
        super.preUpdate(t, dt); //LLamamos al preUpdate del padre para que las animaciones se ejucten correctamente
    }

    parpadeo(){
        this.setVisible(!this.visible);
    }
};