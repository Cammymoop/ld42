import Phaser from "./phaser-module.js";
import constants from "./constants.js";
import OverheadMapScene from "./overhead-map-scene.js";

export default class MapCharacter extends Phaser.GameObjects.Sprite {
    constructor(scene, spritesheet, x, y) {
        super(scene, 0, 0, spritesheet, 0);
        this.create(x, y);
    }

    create(tileX, tileY) {
        this.depth = 20;

        this.isSolid = true;

        this.tilePosition = new Phaser.Geom.Point(tileX, tileY);
        this.setPosition((this.tilePosition.x * constants.TILE_SIZE) + constants.TILE_SIZE/2, (this.tilePosition.y * constants.TILE_SIZE) + constants.TILE_SIZE/2);

        // state stuff
        this.state = "stationary";
        this.stateData = {};

        this.facingDirection = constants.DIR_RIGHT;

        // Constants
        this.WALK_SPEED = 0.12;

        this.scene.inputNormalizer.on("press_A", () => this.glueBridge());
    }

    glueBridge() {
        console.log(['trying to glue', this.tilePosition]);
        this.scene.glueBridge(this.tilePosition.x, this.tilePosition.y);
    }

    setState(stateName, data) {
        this.state = stateName;
        if (!data) {
            data = {};
        }
        switch (stateName) {
            default:
                this.stateData = {};
        }
        this.onStateChange();
    }
    onStateChange() {
        if (this.state === "stationary") {
        } else if (this.state === "walking") {
            //this.faceDirection(this.stateData.walkDir, this.stateData.walkAxis);
        }
    }
    update(time, delta) {
        if (!this.scene) {
            return; // destoryed already, not sure why update is still being called sometimes
        }
        var sd = this.stateData;
        if (this.state === "stationary") {
        } else if (this.state === "suspended") {
            // do nothing
        } else if (this.state === "walking") {
            //this.updateTilePosition();
        }
        this.updateTilePosition();

        var tileHere = this.getTileNextTo(0, 0);
        var fgTileHere = this.getFGTileNextTo(0, 0);
        if (tileHere === 7 || fgTileHere === 7) {
            // nothing
        }
    }

    faceDirection(direction) {
        this.facingDirection = direction;
        if (direction === constants.DIR_UP) {
            this.setFrame(1);
        } else {
            this.setFrame(0);
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
