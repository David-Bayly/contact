import {SHIPS,PROJECTILES} from '/js/modules/ships.js'
const width = 1200;
const height = 800;
function randInt(base){
    return Math.floor(Math.random()*base);
}
class Laser extends Phaser.Physics.Arcade.Sprite
{
	constructor(scene, x, y,projectileName) {
        super(scene, x, y, projectileName);
    }
	fire(x, y,rotation,speed) {
        this.body.width=30
        this.body.height=30
        this.body.reset(x, y);
		this.setActive(true);
        this.setVisible(true);
        this.setRotation(rotation);
        this.scene.physics.velocityFromRotation(rotation-(3.14159/2),speed,this.body.velocity);
        this.body.x +=(this.body.velocity.x/speed)*20;
        this.body.y +=(this.body.velocity.y/speed)*20;
        return this;

	}
}
class LaserGroup extends Phaser.Physics.Arcade.Group
{
	constructor(scene,name) {
		super(scene.physics.world, scene);

		this.createMultiple({
			frameQuantity: 50,
			key: name,
			active: false,
			visible: false,
			classType: Laser
		});
	}
	fireBullet(x, y,rotation,speed) {
		const laser = this.getFirstDead(false);

		if(laser) {
            return laser.fire(x, y,rotation,speed);
		}
    }
}
class MainScene extends Phaser.Scene {
	constructor() {
		super();
		this.ship;
		this.laserGroup;
        this.keys;
        this.shipdata;
        this.lastFired = 0;
        this.enemies ={},
        this.socket;
        this.solo;
        this.hp;
	}
	preload() {
        this.solo = true;
        this.load.setBaseURL('http://192.168.1.149:8080');
        SHIPS.forEach(ship=>{
            this.load.image(ship.name,ship.path);
        })
        Object.values(PROJECTILES).forEach(projectile=>{
            this.load.image(projectile.name,projectile.path);
        })
        this.load.image('sky', '/stars.png');
        this.socket=io('http://192.168.1.149:5000');
    }
    create() {
        //this.physics.world.setFPS(15)
        this.hp=1;
        this.add.image(0, 0, 'sky');
        this.addShip()
        this.laserGroup = new LaserGroup(this,this.shipdata.projectile.name);
        this.configureSocket()
        this.addEvents()

    }
    addShip(){
        this.shipdata = SHIPS[randInt(SHIPS.length)];
        this.ship = this.add.image(randInt(width),randInt(height),this.shipdata.name);
        this.ship.setSize(50,50);
        this.ship.setScale(this.shipdata.scale)
        this.physics.world.enable(this.ship);
        this.ship.body.setVelocity(100, 200).setBounce(1, 1).setCollideWorldBounds(true);
        this.hp=this.shipdata.hp;
    }
    addEnemy(enemy){
        this.enemies[enemy.id]= {
                data:enemy,
                image:this.add.image(enemy.x,enemy.y,enemy.type)
        }
        this.enemies[enemy.id].image.setSize(50,50);
        this.enemies[enemy.id].image.setScale(enemy.scale)
        this.physics.world.enable(this.enemies[enemy.id].image);
        this.enemies[enemy.id].image.body.setVelocity(enemy.velocity.x,enemy.velocity.y).setBounce(1,1).setCollideWorldBounds(true);
        this.enemies[enemy.id].image.setData("id",enemy.id);
        this.physics.add.overlap(this.enemies[enemy.id].image, this.laserGroup, this.laserHit,()=>{},this); 
    
    }
    laserHit(ship,laser){
        laser.setActive(false);
        laser.setVisible(false);
        laser.x = -100
        laser.y = -100
        const id = ship.data.list.id
        this.socket.emit('hit',{id});

    }
    addEvents(){
        this.keys  = [
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)]
    }
    async fireBullets(){
        switch(this.shipdata.projectile.type){
            default:
                this.laserGroup.fireBullet(
                this.ship.x,
                this.ship.y,
                this.ship.rotation,
                this.shipdata.projectile.speed
                );
        }
    }   
    configureSocket(){
        this.socket.on('userJoined',(data)=>{
            console.log(data);
            this.solo=false;
            this.addEnemy(data)
        })
        this.socket.on('myId',data=>{
            this.shipdata.id = data.id
            Object.keys(data.ships).forEach(key=>{
                this.addEnemy(data.ships[key]);
            })
        })
        this.socket.on('hit',data=>{
            if(data.id===this.shipdata.id){
                this.hp--;
                console.log(this.hp);
                if( this.hp<=0){

                    this.ship.destroy();
                    this.socket.emit('dead',{id:this.shipdata.id});
                }

            }
        })
        this.socket.on('dead',data=>{
            if(this.enemies[data.id]){
                this.enemies[data.id].image.destroy();
                delete(this.enemies[data.id])
            }

        })
        this.socket.emit('connection',{
            x:this.ship.x,
            y:this.ship.y,
            rotation:this.ship.rotation,
            type:this.shipdata.name,
            scale:this.shipdata.scale,
            velocity: this.ship.body.velocity
        })
        
        this.socket.on('update',(data)=>{
            if(!Object.keys(this.enemies).length){
                return;
            }

            Object.keys(data).forEach((id)=>{

                if(id!=this.shipdata.id && this.enemies[id]){
                    this.enemies[id].image.setPosition(data[id].x,data[id].y)
                    this.enemies[id].image.setRotation(data[id].rotation)
                    this.enemies[id].image.body.setVelocity(data[id].velocity.x,data[id].velocity.y);
                }
            })
        })
    }
    async update(){
        if(this.hp<=0){
            return
        }else{
            this.ship.body.angularVelocity = 0;
            this.laserGroup.children.entries.forEach((laser)=>{
                if(laser.active){
                    if(laser.body.checkWorldBounds()){
                        laser.setActive(false);
                        laser.setVisible(false);
                        laser.x = -100
                        laser.y = -100
                    }
                }
            })
            let keyhit = false;
            this.keys.forEach(key =>{
                if(key.isDown){
                    if(key.keyCode === 32 && Phaser.Input.Keyboard.JustDown(key)){
                        this.fireBullets();
                        return
                    }
                    keyhit = true;
                    switch(key.keyCode){
                        case 37://left
                            this.ship.body.angularVelocity = -200;
                        break;
                        case 38:// up
                            this.physics.velocityFromRotation(this.ship.body.rotation*(2*3.14)/360-(3.14)/2, this.shipdata.speed, this.ship.body.velocity);
                        break;
                        case 39:// right
                            this.ship.body.angularVelocity = 200;
                        break
                        case 40:// down 
                            this.physics.velocityFromRotation(this.ship.body.rotation, 0, this.ship.body.velocity);
                        break; 
                        default:
                    }
                }
            })
            if(keyhit ){
                let data = 
                    {
                        x:this.ship.x,
                        y:this.ship.y,
                        rotation:this.ship.rotation,
                        type:this.shipdata.name,
                        speed:this.shipdata.speed,
                        velocity:this.ship.body.velocity,
                        id:this.shipdata.id,
                        scale:this.shipdata.scale
                    }
                    await fetch("http://192.168.1.149:5000/tick",{
                        method:"POST", 
                        body:JSON.stringify(data),
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
            }
        }
    }
}

var config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 0, x:0 },
        debug:false
    }
    },
    scene: MainScene
};

var game = new Phaser.Game(config);