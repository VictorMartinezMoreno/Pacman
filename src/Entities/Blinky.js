import Ghost from "./ghost.js"

export default class Blinky extends Ghost {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame); //super, esencial al heredar de Sprites de Phaser, (escena de dnd procede,posicion X, posicion Y, textura que recibe, y el frame inicial)
    }

    preUpdate(t, dt) {

        if (!this.inHome && !this.scape || this.eatable > 0){
            this.objetivo.x = this.scene.player.posX*4;
            this.objetivo.y = this.scene.player.posY*4;

            if (this.eatable > 0){
                this.objetivo.x = this.x - (this.objetivo.x - (this.posX*4));
                this.objetivo.y = this.y - (this.objetivo.y - (this.posY*4));
            }
        }
        else if (!this.inHome){
            this.objetivo.x = 0;
            this.objetivo.y = 0;
        }

        super.preUpdate(t, dt);
    }

    changeAnimation(t, dt){
        //Animación de movimiento
        if (this.huyendo){
            if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.body.velocity.x != 0) {
                if (this.body.velocity.x > 0){
                    if (this.flipX) this.flipX = false;
                    this.anims.play("huyendoSide", true);
                }
                else{
                    if (!this.flipX) this.flipX = true;
                    this.anims.play("huyendoSide", true);
                }
            }
            else {
                if (this.body.velocity.y > 0) this.anims.play("huyendoDown");
                else this.anims.play("huyendoUp", true);
            }
        }
        }
        else
        if (this.eatable > 0){
            if (this.eatable > 3000) this.anims.play("eatableAnim", true);
            else this.anims.play("lowEatableAnim", true);
        }
        else 
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.body.velocity.x != 0) {
                if (this.body.velocity.x > 0){
                    if (this.flipX) this.flipX = false;
                    this.anims.play("BlinkyMovingSide", true);
                }
                else{
                    if (!this.flipX) this.flipX = true;
                    this.anims.play("BlinkyMovingSide", true);
                }
            }
            else {
                if (this.body.velocity.y > 0) this.anims.play("BlinkyMovingDown");
                else this.anims.play("BlinkyMovingUp", true);
            }
        }
    }
};