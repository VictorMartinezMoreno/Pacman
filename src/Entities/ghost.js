
export default class ghost extends Phaser.GameObjects.Sprite {
    //Constructor, se llama al crear la entidad
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame); //super, esencial al heredar de Sprites de Phaser, (escena de dnd procede,posicion X, posicion Y, textura que recibe, y el frame inicial)
        this.scene.add.existing(this);
        this.scene = scene;

        this.setOrigin(0.5, 0.5)
        this.setScale(0.65);
        this.setDepth(1);

        this.scene.physics.add.existing(this);
        this.body.width = this.displayWidth * 0.7; this.body.height = this.displayHeight * 0.7;
        this.body.setOffset(this.displayWidth - this.body.width, this.displayHeight - this.body.height);

        this.speed = this.scene.player.speed;
        //Movimiento para salida de casa
        this.inHome = true;

        //Arranque de fantasma
        //Busco hacia qué dirección está la salida
        let i = 0;
        let j = 0;

        //Busco primera casilla de salida
        while (i < this.scene.map.length && this.scene.map[i][j] != 3){
            j = 0;
            while(j < this.scene.map[1].length && this.scene.map[i][j] != 3){
                j++;
            }
            if (this.scene.map[i][j] != 3) i++;
        }

        //Miro cuantas casillas hay para posicionarme en la del medio
        let how3 = 1;
        while (this.scene.map[i][j+how3] === 3) how3++;

        //Si solo hay una casilla en horizontal, quizás la puerta se situe de forma vertical
        //Si solo hay una casilla en vertical en ese caso solo hay 1 tile de puerta por lo que lo que tenemos es lo que tenemos
        if (how3 === 1){
            while (this.scene.map[i+how3][j] === 3) how3++;
            if (how3 !== 1) i+=Math.trunc(how3/2);
        }
        else j+= Math.trunc(how3/2);

        //OBJETIVO
        this.objetivo = {
            x: j*4,
            y: i*4,
        }
    }

    init(){
        //Posición
        this.posX = Math.trunc(this.x/4); //cada posición de la matriz son 4 píxeles
        this.posY = Math.trunc(this.y/4);

        this.maxOffset = 4; // Pixeles entre posición y posición de la matriz del mapa
        this.offset = this.maxOffset;

        //Primer impulso del fantasmuco
        let posiblesRutas = [];
        if ((this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3) || (this.posY === Math.trunc(this.objetivo.y/4) && this.posX+3 === Math.trunc(this.objetivo.x/4)))
            posiblesRutas.push({velocidad:{x: 1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX+3)*4) * (this.objetivo.x-(this.posX+3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
        if ((this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3) || (this.posY === Math.trunc(this.objetivo.y/4) && this.posX-3 === Math.trunc(this.objetivo.x/4)))
            posiblesRutas.push({velocidad:{x: -1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX-3)*4) * (this.objetivo.x-(this.posX-3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
        if ((this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3) || (this.posY+3 === Math.trunc(this.objetivo.y/4) && this.posX === Math.trunc(this.objetivo.x/4)))
            posiblesRutas.push({velocidad:{x: 0, y: 1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY+3)*4) * (this.objetivo.y-(this.posY+3)*4)))});
        if ((this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3) || (this.posY-3 === Math.trunc(this.objetivo.y/4) && this.posX === Math.trunc(this.objetivo.x/4)))
            posiblesRutas.push({velocidad:{x: 0, y: -1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY-3)*4) * (this.objetivo.y-(this.posY-3)*4)))});

        let rutaElegida = {velocidad:{x: 0, y: 0}, distancia: 10000000};
        posiblesRutas.forEach((ruta) =>{
            if (ruta.distancia < rutaElegida.distancia) rutaElegida = ruta;
        });

        this.body.setVelocity(rutaElegida.velocidad.x * this.speed, rutaElegida.velocidad.y * this.speed);
        
        this.changeAnimation();
    }

    preUpdate(t, dt) {
        super.preUpdate(t, dt); //LLamamos al preUpdate del padre para que las animaciones se ejucten correctamente

        if (this.inHome) this.exitHome(t, dt);
        else {
            this.normalBehaviour(t, dt);
        }
    }

    scapeBehaviour(t, dt){

    }

    //Factor Y e X sirven para Clyde, si le pasa -1 el fantasma huirá del pacman
    normalBehaviour(t, dt){
        //Actualización de posición
        this.offset -= (this.speed * dt/1000)

        //Vamos calculando la posición de forma discreta con posiciones de la matriz del mapa que se actualizan al mover x píxeles
        if (this.offset < 0){
            this.offset = this.maxOffset;

            //Recolocamos el personaje para eliminar impurezas como en el anuncio de WIPP
            this.body.x = this.posX * 4;
            this.body.y = this.posY * 4;
            this.x = this.body.x + this.body.width / 4;
            this.y = this.body.y + this.body.height / 4;

            //Solo actuamos si es un cruce
            if (this.scene.map[this.posY][this.posX] === 2){
            
                let posiblesRutas = [];
                if ((this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3) && this.body.velocity.x >= 0)
                    posiblesRutas.push({velocidad:{x: 1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX+3)*4) * (this.objetivo.x-(this.posX+3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
                if ((this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3) && this.body.velocity.x <= 0)
                    posiblesRutas.push({velocidad:{x: -1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX-3)*4) * (this.objetivo.x-(this.posX-3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
                if ((this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3) && this.body.velocity.y >= 0)
                    posiblesRutas.push({velocidad:{x: 0, y: 1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY+3)*4) * (this.objetivo.y-(this.posY+3)*4)))});
                if ((this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3) && this.body.velocity.y <= 0)
                    posiblesRutas.push({velocidad:{x: 0, y: -1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY-3)*4) * (this.objetivo.y-(this.posY-3)*4)))});
        
                let rutaElegida = {velocidad:{x: 0, y: 0}, distancia: 10000000};
                posiblesRutas.forEach((ruta) =>{
                    if (ruta.distancia < rutaElegida.distancia) rutaElegida = ruta;
                });

                if (Math.trunc(rutaElegida.distancia) === 0){
                    this.objetivo.x = this.scene.player.posX*4;
                    this.objetivo.y = this.scene.player.posY*4;
                    this.inHome = false;
                }

                this.body.setVelocity(rutaElegida.velocidad.x * this.speed, rutaElegida.velocidad.y * this.speed);

                this.changeAnimation(t, dt);
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

    changeAnimation(t, dt){
        //Animación de movimiento (solo rota)
        if (this.body.velocity.x != 0 || this.body.velocity.y != 0){
            if (this.body.velocity.x != 0) {
                if (this.body.velocity.x > 0) ;
                else ;
            }
            else {
                if (this.body.velocity.y > 0) ;
                else ;
            }
        }
    }

    exitHome(t, dt){
        //Actualización de posición
        this.offset -= (this.speed * dt/1000)

        //Vamos calculando la posición de forma discreta con posiciones de la matriz del mapa que se actualizan al mover x píxeles
        if (this.offset < 0){
            this.offset = this.maxOffset;

            //Recolocamos el personaje para eliminar impurezas como en el anuncio de WIPP
            this.body.x = this.posX * 4;
            this.body.y = this.posY * 4;
            this.x = this.body.x + this.body.width / 4;
            this.y = this.body.y + this.body.height / 4;

            //Solo actuamos si es un cruce
            if (this.scene.map[this.posY][this.posX] === 2){
                let posiblesRutas = [];
                if ((this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3) || (this.posY === Math.trunc(this.objetivo.y/4) && this.posX+3 === Math.trunc(this.objetivo.x/4)))
                    posiblesRutas.push({velocidad:{x: 1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX+3)*4) * (this.objetivo.x-(this.posX+3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
                if ((this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3) || (this.posY === Math.trunc(this.objetivo.y/4) && this.posX-3 === Math.trunc(this.objetivo.x/4)))
                    posiblesRutas.push({velocidad:{x: -1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX-3)*4) * (this.objetivo.x-(this.posX-3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
                if ((this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3) || (this.posY+3 === Math.trunc(this.objetivo.y/4) && this.posX === Math.trunc(this.objetivo.x/4)))
                    posiblesRutas.push({velocidad:{x: 0, y: 1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY+3)*4) * (this.objetivo.y-(this.posY+3)*4)))});
                if ((this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3) || (this.posY-3 === Math.trunc(this.objetivo.y/4) && this.posX === Math.trunc(this.objetivo.x/4)))
                    posiblesRutas.push({velocidad:{x: 0, y: -1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY-3)*4) * (this.objetivo.y-(this.posY-3)*4)))});
        
                let rutaElegida = {velocidad:{x: 0, y: 0}, distancia: 10000000};
                posiblesRutas.forEach((ruta) =>{
                    if (ruta.distancia < rutaElegida.distancia) rutaElegida = ruta;
                });

                if (Math.trunc(rutaElegida.distancia) === 0){
                    this.objetivo.x = this.scene.player.posX*4;
                    this.objetivo.y = this.scene.player.posY*4;
                    this.inHome = false;
                }

                this.body.setVelocity(rutaElegida.velocidad.x * this.speed, rutaElegida.velocidad.y * this.speed);

                this.changeAnimation(t, dt);
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
};