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

        this.glueCount = 1;

        this.tilePosition = new Phaser.Geom.Point(tileX, tileY);
        this.setPosition((this.tilePosition.x * constants.TILE_SIZE) + constants.TILE_SIZE/2, (this.tilePosition.y * constants.TILE_SIZE) + constants.TILE_SIZE/2);

        this.net = this.scene.add.sprite(this.x, this.y, 'net');
        this.net.setOrigin(0.5, 1);
        this.net.depth = 19;
        this.net.visible = false;

        // state stuff
        this.state = "stationary";
        this.stateData = {};

        this.facingDirection = constants.DIR_RIGHT;

        // Constants
        this.WALK_SPEED = 0.12;

        this.scene.inputNormalizer.on("press_A", () => this.useNet());
        this.scene.inputNormalizer.on("press_B", () => this.glueBridge());
    }

    useNet() {
        this.body.setVelocity(0, 0);
        this.setState('netting');
        this.net.visible = true;

        let d = this.facingDirection;
        let netX = this.x + (d === constants.DIR_LEFT ? -15 : (d === constants.DIR_RIGHT ? 15 : 0));
        let netY = this.y + (d === constants.DIR_UP ? -15 : (d === constants.DIR_DOWN ? 15 : 0));
        let caught = this.scene.catchButterflies(netX, netY);

        this.scene.removeButterflies(caught);
        for (let b of caught) {
            if (b.color === "blue") {
                this.addGlue(5);
            } else if (b.color === "yellow") {
                this.addGlue(2);
            } else {
                this.addGlue(1);
            }
            b.destroy();
        }

        this.scene.time.addEvent({delay: 700, callback: () => this.putNetAway()});
    }

    putNetAway() {
        this.net.visible = false;
        this.setState('stationary');
    }

    glueBridge() {
        if (this.glueCount <= 0) {
            return;
        }
        this.addGlue(-1);
        this.scene.glueBridge(this.tilePosition.x, this.tilePosition.y);
    }

    addGlue(count) {
        this.glueCount += count;
        this.scene.uiScene.updateGlue(this.glueCount);
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
        this.net.x = this.x;
        this.net.y = this.y;
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
            this.net.rotation = 0;
        } else if (direction === constants.DIR_RIGHT) {
            this.setFrame(3);
            this.net.rotation = Math.PI/2;
        } else if (direction === constants.DIR_DOWN) {
            this.setFrame(0);
            this.net.rotation = Math.PI;
        } else if (direction === constants.DIR_LEFT) {
            this.setFrame(2);
            this.net.rotation = Math.PI/2 + Math.PI;
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
