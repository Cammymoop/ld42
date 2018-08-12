import Phaser from "./phaser-module.js";
import constants from "./constants.js";
import OverheadMapScene from "./overhead-map-scene.js";

export default class Butterfly extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, color, direction) {
        let texture = 'butterfly-' + color;
        super(scene, x, y, texture, 0);
        this.create(color);
    }

    create(color, direction) {
        this.depth = 20;
        this.color = color;

        this.isSolid = true;

        this.updateTilePosition();

        this.facingDirection = direction ? direction : constants.DIR_RIGHT;
        this.faceDirection(direction);

        // Constants
        this.FLY_SPEED = Math.random() * 0.12;

        this.scene.inputNormalizer.on("press_A", () => this.glueBridge());
    }
    update(time, delta) {
        this.updateTilePosition();

        if (this.x < -60 || this.x > this.scene.map.widthInPixels + 60) {
            this.die();
        }
        if (this.y < -60 || this.y > this.scene.map.heightInPixels + 60) {
            this.die();
        }
        var tileHere = this.getTileNextTo(0, 0);
        var fgTileHere = this.getFGTileNextTo(0, 0);
        if (tileHere === 7 || fgTileHere === 7) {
            // nothing
        }
    }

    overlapsCircle(x, y, radius) {
        let point = new Phaser.Math.Vector2(x, y);
        let maxDist = color === 'red' ? 5 : 8; 

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
        this.destroy();
    }
}
