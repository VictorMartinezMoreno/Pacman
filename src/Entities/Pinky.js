import Ghost from "./ghost.js"

export default class Pinky extends Ghost {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame); //super, esencial al heredar de Sprites de Phaser, (escena de dnd procede,posicion X, posicion Y, textura que recibe, y el frame inicial)
    }

    preUpdate(t, dt) {

        if (!this.inHome){
            this.objetivo.x = this.scene.player.posX*4 + (12*this.scene.player.body.velocity.x);
            this.objetivo.y = this.scene.player.posY*4 + (12*this.scene.player.body.velocity.y);
        }

        super.preUpdate(t, dt);
    }

    changeAnimation(t, dt){
        //Animación de movimiento (solo rota)
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.body.velocity.x != 0) {
                if (this.body.velocity.x > 0){
                    if (this.flipX) this.flipX = false;
                    this.anims.play("PinkyMovingSide");
                }
                else{
                    if (!this.flipX) this.flipX = true;
                    this.anims.play("PinkyMovingSide");
                }
            }
            else {
                if (this.body.velocity.y > 0) this.anims.play("PinkyMovingDown");
                else this.anims.play("PinkyMovingUp");
            }
        }
    }
};