
export default class Player extends Phaser.GameObjects.Sprite {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        this.scene.add.existing(this);

        this.setOrigin(0.5, 0.5)
        this.setScale(0.5);
        this.setDepth(1);

        this.scene.physics.add.existing(this);
        this.body.width = this.displayWidth * 0.1; this.body.height = this.displayHeight * 0.1;
        this.body.setOffset(this.displayWidth - this.body.width, this.displayHeight - this.body.height);

        this.anims.play("playerMoving");

        //Movimiento
        //Guardo la última tecla pulsada cuando se pulsa
        this.lastKey = null;
        this.scene.input.keyboard.on('keydown', (key) => {
            //Si la tecla pulsada es una de las que me interesan, esta será la última pulsada
            //Y es un próximo movimiento válido
            const Key = key.key.toUpperCase();
            let isValid = true; // TO DO
            if ((Key === "W" || Key === "A" || Key === "S" || Key === "D") && isValid) this.lastKey = Key;
        });

        this.speed = 80;
        this.body.setVelocity(this.speed, 0);
    }

    init(){
        //Posición
        this.posX = Math.trunc(this.x/4); //cada posición de la matriz son 4 píxeles
        this.posY = Math.trunc(this.y/4);

        this.maxOffset = 4; // Pixeles entre posición y posición de la matriz del mapa
        this.offset = this.maxOffset;
    }
    preUpdate(t, dt) {
        super.preUpdate(t, dt); //LLamamos al preUpdate del padre para que las animaciones se ejucten correctamente

        //Actualización de posición
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) this.offset -= (this.speed * dt/1000)

        //Reasignación de movimiento ASÍNCRONO
        if (this.lastKey === 'W' && this.scene.map[this.posY - 3][this.posX] !== 1 && this.body.velocity.y > 0){
            this.body.setVelocity(0, -this.speed);
            this.offset = this.maxOffset - this.offset;
            this.changeAnimation();
            this.lastKey = null;
        }
        else if (this.lastKey === 'A' && this.scene.map[this.posY][this.posX - 3] !== 1 && this.body.velocity.x > 0){
            this.body.setVelocity(-this.speed, 0);
            this.offset = this.maxOffset - this.offset;
            this.changeAnimation();
            this.lastKey = null;
        }
        else if (this.lastKey === 'S' && this.scene.map[this.posY + 3][this.posX] !== 1 && this.body.velocity.y < 0){
            this.body.setVelocity(0, this.speed);
            this.offset = this.maxOffset - this.offset;
            this.changeAnimation();
            this.lastKey = null;
        }
        else if (this.lastKey === 'D' && this.scene.map[this.posY][this.posX + 3] !== 1 && this.body.velocity.x < 0){
            this.body.setVelocity(this.speed, 0);
            this.offset = this.maxOffset - this.offset;
            this.changeAnimation();
            this.lastKey = null;
        }

        //Vamos calculando la posición de forma discreta con posiciones de la matriz del mapa que se actualizan al mover x píxeles
        if (this.offset < 0 || (this.body.velocity.x === 0 && this.body.velocity.y === 0)){
            this.offset = this.maxOffset;

            //Recolocamos el personaje para eliminar impurezas como en el anuncio de WIPP
            this.body.x = this.posX * 4;
            this.body.y = this.posY * 4;
            this.x = this.body.x + this.body.width / 2;
            this.y = this.body.y + this.body.height / 2;

            //Solo actuamos si es un cruce
            if (this.scene.map[this.posY][this.posX] === 2){

                if (this.body.velocity.x > 0 && this.scene.map[this.posY][this.posX + 3] === 1 ||
                    this.body.velocity.x < 0 && this.scene.map[this.posY][this.posX - 3] === 1 ||
                    this.body.velocity.y > 0 && this.scene.map[this.posY + 3][this.posX] === 1 ||
                    this.body.velocity.y < 0 && this.scene.map[this.posY - 3][this.posX] === 1
                ) this.body.setVelocity(0, 0);

                //Reasignación de movimiento SÍNCRONO
                if (this.lastKey === 'W' && this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3){
                    this.body.setVelocity(0, -this.speed)
                    this.lastKey = null;
                }
                else if (this.lastKey === 'A' && this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3){
                    this.body.setVelocity(-this.speed, 0);
                    this.lastKey = null;
                }
                else if (this.lastKey === 'S' && this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3){
                    this.body.setVelocity(0, this.speed);
                    this.lastKey = null;
                }
                else if (this.lastKey === 'D' && this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3){
                    this.body.setVelocity(this.speed, 0);
                    this.lastKey = null;
                }
            
                this.changeAnimation();
            }

            //Calculamos la nueva posición
            if (this.body.velocity.x != 0) this.posX += this.body.velocity.x / Math.abs(this.body.velocity.x);
            else if (this.body.velocity.y != 0) this.posY += this.body.velocity.y / Math.abs(this.body.velocity.y);

            //Si la nueva posición se sale del array, vuelve por el otro lado (toroidal)
            if (this.posX >= this.scene.map[this.posY].length) {this.posX = 1; this.x = 0;}
            if (this.posY >= this.scene.map.length) {this.posY = 1; this.y = 0;}
            if (this.posX < 0) {this.posX = this.scene.map[this.posY].length - 2; this.x = (this.scene.map[this.posY].length - 1)*4;}
            if (this.posY < 0) {this.posY = this.scene.map.length - 2; this.y = (this.scene.map.length - 1)*4;}
        }
        
    }

    changeAnimation(){
        //Animación de movimiento (solo rota)
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.anims.isPaused) this.anims.resume();
            if (this.body.velocity.x != 0){
                if (this.body.velocity.x > 0) this.angle = 0;
                else this.angle = 180;
            }
            else this.angle = 90 * this.body.velocity.y / Math.abs(this.body.velocity.y);
        }
        else this.anims.pause()
    }
};



