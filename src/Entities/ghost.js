
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
        this.lowerSpeed = this.scene.player.speed * 0.5;
        this.higherSpeed = this.scene.player.speed * 1.5;

        //Movimiento para salida de casa
        this.inHome = true;

        //Contadores para controlar los estados del fantasma
        this.scape = false;

        this.cycleCount = 0;
        this.maxCycles = 4;
        
        this.normalTimer = false;
        this.normalBehaviourTimerMax = 20000;
        this.normalBehaviourTime = 20000;
        
        this.scapeTimer = false;
        this.scapeTimerMax = 7000;
        this.scapeTimerMaxLower = 5000;
        this.scapeTime = 7000;

        //Estado comestible
        this.timeEatable = 10000;
        this.eatable = 0;
        
        this.event = new Phaser.Events.EventEmitter();

        this.event.on('eatable', ()=>{
            this.eatable = this.timeEatable;
        });

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
            x: 0,
            y: 0,
        }

        this.home = {
            x: j*4,
            y: i*4
        }

        this.huyendo = false;
        this.scene.physics.add.overlap(this, this.scene.player, () => {
            if (this.eatable > 0 && !this.huyendo)
            {
                this.huyendo = true;
                this.speed = this.higherSpeed;
                let Ptext = this.scene.add.text(this.x, this.y, this.scene.eatPoints, {
                    fontFamily: "arcade_classic",
                    fontSize: 100,
                    color: "#ffffffff"
                }).setOrigin(0.5, 0.5).setScale(0.07).setDepth(3);
                this.scene.updatePoints(this.scene.eatPoints, false);
                this.scene.eatPoints*=2;
                setTimeout(()=>{this.scene.scene.resume(); Ptext.destroy();}, 500);
                this.scene.scene.pause();
            }
            else if (!this.huyendo){
                this.scene.lifes--;
                setTimeout(()=>{this.scene.player.events.emit('die');}, 500);
                this.scene.scene.pause();
            }
        });
    }

    callbackScape(){
        this.scape = false;
        this.scapeTimer = false;
        this.normalBehaviourTime = this.normalBehaviourTimerMax;
        this.normalTimer = true;
    }

    callbackNormal(){
        this.cycleCount++;

        if (this.cycleCount < 2) {
            this.scape = true;
            this.normalTimer = false;
            this.scapeTime = this.scapeTimerMax;
            this.scapeTimer = true;
        }
        else if (this.cycleCount < this.maxCycles){
            this.scape = true;
            this.normalTimer = false;
            this.scapeTime = this.scapeTimerMaxLower;
            this.scapeTimer = true;
        }
        else{
            this.normalTimer = false;
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
        if ((this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3) || (this.posY === Math.trunc(this.home.y/4) && this.posX+3 === Math.trunc(this.home.x/4)))
            posiblesRutas.push({velocidad:{x: 1, y: 0}, distancia: Math.sqrt(((this.home.x-(this.posX+3)*4) * (this.home.x-(this.posX+3)*4)) + ((this.home.y-(this.posY)*4) * (this.home.y-(this.posY)*4)))});
        if ((this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3) || (this.posY === Math.trunc(this.home.y/4) && this.posX-3 === Math.trunc(this.home.x/4)))
            posiblesRutas.push({velocidad:{x: -1, y: 0}, distancia: Math.sqrt(((this.home.x-(this.posX-3)*4) * (this.home.x-(this.posX-3)*4)) + ((this.home.y-(this.posY)*4) * (this.home.y-(this.posY)*4)))});
        if ((this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3) || (this.posY+3 === Math.trunc(this.home.y/4) && this.posX === Math.trunc(this.home.x/4)))
            posiblesRutas.push({velocidad:{x: 0, y: 1}, distancia: Math.sqrt(((this.home.x-(this.posX)*4) * (this.home.x-(this.posX)*4)) + ((this.home.y-(this.posY+3)*4) * (this.home.y-(this.posY+3)*4)))});
        if ((this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3) || (this.posY-3 === Math.trunc(this.home.y/4) && this.posX === Math.trunc(this.home.x/4)))
            posiblesRutas.push({velocidad:{x: 0, y: -1}, distancia: Math.sqrt(((this.home.x-(this.posX)*4) * (this.home.x-(this.posX)*4)) + ((this.home.y-(this.posY-3)*4) * (this.home.y-(this.posY-3)*4)))});

        let rutaElegida = {velocidad:{x: 0, y: 0}, distancia: 10000000};
        posiblesRutas.forEach((ruta) =>{
            if (ruta.distancia < rutaElegida.distancia) rutaElegida = ruta;
        });

        this.body.setVelocity(rutaElegida.velocidad.x * this.speed, rutaElegida.velocidad.y * this.speed);
        
        this.changeAnimation();
    }

    preUpdate(t, dt) {
        super.preUpdate(t, dt); //LLamamos al preUpdate del padre para que las animaciones se ejucten correctamente

        if (this.eatable > 0 && !this.huyendo){

            if (this.eatable === this.timeEatable) this.speed = this.lowerSpeed;

            this.eatable -= dt;

            if (this.eatable <= 0) this.speed = this.scene.player.speed;

            if (this.eatable <= 0 || this.eatable === this.timeEatable - dt){
                this.scene.eatPoints = 200;
                let vx, vy;
                if (this.body.velocity.y != 0) vy = this.body.velocity.y / Math.abs(this.body.velocity.y);
                else vy = 0;
                if (this.body.velocity.x != 0) vx = this?.body.velocity.x / Math.abs(this.body.velocity.x);
                else vx = 0;
                this.body.setVelocity(vx*this.speed, vy*this.speed);
            }
        }
        
        if (this.normalTimer){
            this.normalBehaviourTime -= dt;
            if(this.normalBehaviourTime <= 0) this.callbackNormal();
        }

        if (this.scapeTimer){
            this.scapeTime -= dt;
            if(this.scapeTime <= 0) this.callbackScape();
        }

        if (this.inHome) this.exitHome(t, dt);
        else if (!this.huyendo){
            this.normalBehaviour(t, dt);
        }
        else
        {
            this.objetivo.x = this.home.x;
            this.objetivo.y = this.home.y;
            this.huyendoBehaviour(t, dt);
        }

        this.changeAnimation(t, dt);
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

    huyendoBehaviour(t, dt){
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
                if (((this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3) && this.body.velocity.x >= 0) || (this.posY === Math.trunc(this.home.y/4) && this.posX+3 === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: 1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX+3)*4) * (this.objetivo.x-(this.posX+3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
                if (((this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3) && this.body.velocity.x <= 0) || (this.posY === Math.trunc(this.home.y/4) && this.posX-3 === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: -1, y: 0}, distancia: Math.sqrt(((this.objetivo.x-(this.posX-3)*4) * (this.objetivo.x-(this.posX-3)*4)) + ((this.objetivo.y-(this.posY)*4) * (this.objetivo.y-(this.posY)*4)))});
                if (((this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3) && this.body.velocity.y >= 0) || (this.posY+3 === Math.trunc(this.home.y/4) && this.posX === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: 0, y: 1}, distancia: Math.sqrt(((this.objetivo.x-(this.posX)*4) * (this.objetivo.x-(this.posX)*4)) + ((this.objetivo.y-(this.posY+3)*4) * (this.objetivo.y-(this.posY+3)*4)))});
                if (((this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3) && this.body.velocity.y <= 0) || (this.posY-3 === Math.trunc(this.home.y/4) && this.posX === Math.trunc(this.home.x/4)))
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

                if (Math.trunc(rutaElegida.distancia) === 0){
                    this.inHome = true;
                    this.huyendo = false;
                    this.speed = this.scene.player.speed;
                    this.eatable = 0;
                }

                this.body.setVelocity(rutaElegida.velocidad.x * this.speed, rutaElegida.velocidad.y * this.speed);
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
                if ((this.scene.map[this.posY][this.posX + 3] !== 1 && this.scene.map[this.posY][this.posX + 3] !== 3) || (this.posY === Math.trunc(this.home.y/4) && this.posX+3 === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: 1, y: 0}, distancia: Math.sqrt(((this.home.x-(this.posX+3)*4) * (this.home.x-(this.posX+3)*4)) + ((this.home.y-(this.posY)*4) * (this.home.y-(this.posY)*4)))});
                if ((this.scene.map[this.posY][this.posX - 3] !== 1 && this.scene.map[this.posY][this.posX - 3] !== 3) || (this.posY === Math.trunc(this.home.y/4) && this.posX-3 === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: -1, y: 0}, distancia: Math.sqrt(((this.home.x-(this.posX-3)*4) * (this.home.x-(this.posX-3)*4)) + ((this.home.y-(this.posY)*4) * (this.home.y-(this.posY)*4)))});
                if ((this.scene.map[this.posY + 3][this.posX] !== 1 && this.scene.map[this.posY + 3][this.posX] !== 3) || (this.posY+3 === Math.trunc(this.home.y/4) && this.posX === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: 0, y: 1}, distancia: Math.sqrt(((this.home.x-(this.posX)*4) * (this.home.x-(this.posX)*4)) + ((this.home.y-(this.posY+3)*4) * (this.home.y-(this.posY+3)*4)))});
                if ((this.scene.map[this.posY - 3][this.posX] !== 1 && this.scene.map[this.posY - 3][this.posX] !== 3) || (this.posY-3 === Math.trunc(this.home.y/4) && this.posX === Math.trunc(this.home.x/4)))
                    posiblesRutas.push({velocidad:{x: 0, y: -1}, distancia: Math.sqrt(((this.home.x-(this.posX)*4) * (this.home.x-(this.posX)*4)) + ((this.home.y-(this.posY-3)*4) * (this.home.y-(this.posY-3)*4)))});
        
                let rutaElegida = {velocidad:{x: 0, y: 0}, distancia: 10000000};
                posiblesRutas.forEach((ruta) =>{
                    if (ruta.distancia < rutaElegida.distancia) rutaElegida = ruta;
                });

                if (Math.trunc(rutaElegida.distancia) === 0){
                    this.inHome = false;
                    this.scape = true;
                    this.scapeTimer = true;
                }

                this.body.setVelocity(rutaElegida.velocidad.x * this.speed, rutaElegida.velocidad.y * this.speed);
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