import Ghost from "./ghost.js"

export default class Inky extends Ghost {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame); //super, esencial al heredar de Sprites de Phaser, (escena de dnd procede,posicion X, posicion Y, textura que recibe, y el frame inicial)
    }

    preUpdate(t, dt) {

        if (!this.inHome){
            this.objetivo.x = this.scene.ghosts.Blinky[0].posX*4 - (this.scene.player.posX*4 - this.scene.ghosts.Blinky[0].posX*4)
            this.objetivo.y = this.scene.ghosts.Blinky[0].posY*4 - (this.scene.player.posY*4 - this.scene.ghosts.Blinky[0].posY*4)
        }
        
        super.preUpdate(t, dt);
    }

    changeAnimation(t, dt){
        //Animación de movimiento (solo rota)
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.body.velocity.x != 0) {
                if (this.body.velocity.x > 0){
                    if (this.flipX) this.flipX = false;
                    this.anims.play("InkyMovingSide");
                }
                else{
                    if (!this.flipX) this.flipX = true;
                    this.anims.play("InkyMovingSide");
                }
            }
            else {
                if (this.body.velocity.y > 0) this.anims.play("InkyMovingDown");
                else this.anims.play("InkyMovingUp");
            }
        }
    }
};