import Ghost from "./ghost.js"

export default class Clyde extends Ghost {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame); //super, esencial al heredar de Sprites de Phaser, (escena de dnd procede,posicion X, posicion Y, textura que recibe, y el frame inicial)
    }

    preUpdate(t, dt) {

        if (!this.inHome){
            this.objetivo.x = this.scene.player.posX*4;
            this.objetivo.y = this.scene.player.posY*4;

            //Si la distancia entre el objetivo y yo es de menos de 8*2 tiles, huyo
            if (Math.sqrt(((this.objetivo.x-(this.posX*4)) * (this.objetivo.x-(this.posX*4)))+((this.objetivo.y-(this.posY*4)) * (this.objetivo.y-(this.posY*4)))) < 64){
                this.objetivo.x = this.x - (this.objetivo.x - (this.posX*4));
                this.objetivo.y = this.y - (this.objetivo.y - (this.posY*4));
            }
        }
        
        super.preUpdate(t, dt);
    }

    changeAnimation(t, dt){
        //Animación de movimiento (solo rota)
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.body.velocity.x != 0) {
                if (this.body.velocity.x > 0){
                    if (this.flipX) this.flipX = false;
                    this.anims.play("ClydeMovingSide");
                }
                else{
                    if (!this.flipX) this.flipX = true;
                    this.anims.play("ClydeMovingSide");
                }
            }
            else {
                if (this.body.velocity.y > 0) this.anims.play("ClydeMovingDown");
                else this.anims.play("ClydeMovingUp");
            }
        }
    }
};