import Phaser from "./phaser-module.js";
import constants from "./constants.js";
import OverheadMapScene from "./overhead-map-scene.js";

export default class Butterfly extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, color, direction) {
        let texture = 'butterfly-' + color;
        super(scene, x, y, texture, 0);
        this.create(color, direction);
    }

    create(color, direction) {
        this.depth = 40;
        this.flySpeed = (Math.random() * 0.8) + 0.5;
        this.color = color;

        this.play('b-' + color + '-flap');

        this.originalPos = {x: this.x, y: this.y};

        this.PARTICLE_TIME = 600;
        this.particleTime = this.PARTICLE_TIME;

        this.updateTilePosition();

        this.facingDirection = direction ? direction : constants.DIR_RIGHT;
        this.faceDirection(direction);

        // Constants
        this.FLY_SPEED = Math.random() * 0.12;
    }
    update(time, delta) {
        this.updateTilePosition();

        let ax = (this.facingDirection === constants.DIR_UP || this.facingDirection === constants.DIR_DOWN) ? 'y' : 'x';
        let wx = ax == 'y' ? 'x' : 'y';
        let sign = (this.facingDirection === constants.DIR_UP || this.facingDirection === constants.DIR_LEFT) ? -1 : 1;

        this[ax] += this.flySpeed * sign;
        this[wx] = this.originalPos[wx] + Math.sin(time/(800/this.flySpeed)) * 12;

        if (this.color === 'blue') {
            this.particleTime -= delta;
            if (this.particleTime < 0) {
                this.spawnParticle();
                this.particleTime = this.PARTICLE_TIME;
            }
        }

        if (this.x < -60 || this.x > this.scene.map.widthInPixels + 60) {
            this.die();
        } else if (this.y < -60 || this.y > this.scene.map.heightInPixels + 60) {
            this.die();
        }
    }

    spawnParticle() {
        let p = this.scene.add.sprite(this.x, this.y, 'particle');
        p.depth = 39;
        p.play('particle-anim', false, Math.floor(Math.random() * 3));
        p.on('animationoncomplete', () => p.destroy());
    }

    overlapsCircle(x, y, radius) {
        let point = new Phaser.Math.Vector2(x, y);
        let maxDist = this.color === 'red' ? 5 : 8; 

        maxDist = Math.pow(radius + maxDist, 2); // using square distance because it's faster to calculate
        return point.distanceSq(this) <= maxDist;
    }

    faceDirection(direction) {
        this.facingDirection = direction;
        if (direction === constants.DIR_UP) {
            this.rotation = 0;
        } else if (direction === constants.DIR_RIGHT) {
            this.rotation = Math.PI/2;
        } else if (direction === constants.DIR_DOWN) {
            this.rotation = Math.PI;
        } else if (direction === constants.DIR_LEFT) {
            this.rotation = Math.PI/2 + Math.PI;
        }
    }

    updateTilePosition() {
        this.tilePosition = this.scene.getTilePosFromWorldPos(this.x, this.y);
    }
    getFGTileNextTo(xDelta, yDelta) {
        return this.scene.getForegroundTileAt(this.tilePosition.x + xDelta, this.tilePosition.y + yDelta);
    }
    getTileNextTo(xDelta, yDelta) {
        return this.scene.getCollisionTileAt(this.tilePosition.x + xDelta, this.tilePosition.y + yDelta);
    }

    die() {
        this.scene.removeButterflies([this]);
        this.destroy();
    }
}
