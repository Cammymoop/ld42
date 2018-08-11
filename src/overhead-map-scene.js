import Phaser from "./phaser-module.js";
import constants from "./constants.js";
import MapCharacter from "./map-character.js";
import InputNormalizer from "./input-normalizer.js";

import { LoadedMaps } from "./preloader-scene.js";


export default class OverheadMapScene extends Phaser.Scene {

    constructor() {
        super({ key: 'OverheadMapScene' });
    }

    create(data) {
        this.cameras.main.setBackgroundColor('#a6fcdb');
        this.cameras.main.zoom = 4;

        if (!this.data.has('mapId')) {
            this.data.set('mapId', 1);
        }

        if (!this.registry.has('muted')) {
            this.registry.set('muted', false);
        }
        this.sound.mute = this.registry.get('muted');

        this.gamePause = false;

        this.uiScene = this.scene.get("UIScene");

        //
        // Input
        //
        this.inputNormalizer = new InputNormalizer(this.input);
        
        this.input.keyboard.on('keydown_R', () => this.scene.restart());
        
        this.input.keyboard.on('keydown_M', function (event) {
            this.registry.set('muted', !this.registry.get('muted'));
            this.sound.mute = this.registry.get('muted');
        }, this);
        
        this.input.keyboard.on('keydown_P', function (event) {
            var curZoom = this.cameras.main.zoom;
            this.cameras.main.zoom = {2: 4, 4: 1, 1: 2}[curZoom];
        }, this);

        // load the map
        this.levelLoaded = false;
        this.loadMap(this.data.get('mapId'));


        this.inputNormalizer.on("press_start", () => this.toggleSoftPause());

        //this.inputNormalizer.on("press_B", () => console.log(this.player.tilePosition));
    }

    goToNextLevel() {
        if (LoadedMaps.has(this.currentMapId + 1)) {
            this.data.set('mapId', this.currentMapId + 1);
        } else {
            this.data.set('mapId', 1);
        }
        this.scene.restart();
    }

    loadMap(mapId) {
        if (!LoadedMaps.has(mapId)) {
            console.log("that map (" + mapId + ") doesn't exist, maybe");
            return;
        }
        console.log('loading map: ' + mapId);
        this.currentMapId = mapId;

        // the tilemap
        this.map = this.make.tilemap({key: LoadedMaps.get(mapId)});
        this.tileset = this.map.addTilesetImage('tiles_i_can_actually_use', 'tiles_img');
        this.collisionLayer = this.map.createDynamicLayer('Tile Layer 1', this.tileset, 0, 0);
        this.collisionLayer.depth = 0;
        this.collisionLayer.setOrigin(0);
        this.collisionLayer.setCollision(6);

        this.extraCollisionLayer = false;
        this.foregroundLayer = false;
        for (let layer of this.map.layers) {
            if (layer.name === "Tile Layer 2") {
                this.extraCollisionLayer = this.map.createDynamicLayer('Tile Layer 2', this.tileset, 0, 0);
                this.extraCollisionLayer.depth = 10;
                this.extraCollisionLayer.setOrigin(0);
            } else if (layer.name === "Above") {
                this.foregroundLayer = this.map.createDynamicLayer('Above', this.tileset, 0, 0);
                this.foregroundLayer.depth = 50;
                this.foregroundLayer.setOrigin(0);
            }
        }

        // lock the camera inside the map
        this.cameras.main.setBounds(0, 0, this.collisionLayer.width, this.collisionLayer.height);

        // spawn the player
        var startingTile = {x: 0, y:0};
        if (this.foregroundLayer) {
            startingTile = this.foregroundLayer.findByIndex(7);
            this.setForegroundTile(startingTile.x, startingTile.y, null);
        }
        this.player = new MapCharacter(this, 'player', startingTile.x, startingTile.y);
        this.add.existing(this.player);

        this.physics.add.existing(this.player);
        this.player.body.setCircle(4, 2, 6);

        this.butterflies = [];
        let butterflyColors = ['red', 'blue', 'yellow'];
        for (let i = 0; i < 30; i++) {
            let color = Phaser.Utils.Array.GetRandom(butterflyColors);
            let b = this.add.sprite(20 + (constants.WINDOW_WIDTH/33) * i, constants.WINDOW_HEIGHT - 10, 'butterfly-' + color);
            b.depth = 40;
            b.flySpeed = (Math.random() * 0.8) + 0.5;
            b.play('b-' + color + '-flap');
            this.butterflies.push(b);
        }

        // Physics
        this.physics.add.collider(this.player, this.collisionLayer);

        this.cameras.main.startFollow(this.player, true);

        // Map Logic
        this.platformCoords = new Set();
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                this.platformCoords.add((3 + i*8) + '_' + (3 + j*8));
                if (i === 1 && j === 2) {
                    this.masterPlatform = (3 + i*8) + '_' + (3 + j*8);
                }
            }
        }

        this.bridgeBreaker = this.time.addEvent({delay: 200, repeat: -1, callback: () => this.damageBridge(this.getRandomBridgeTile())});

        this.levelLoaded = true;
    }

    update(time, delta) {
        this.inputNormalizer.update(); // update gamepad axes
        if (!this.levelLoaded || this.gamePause) {
            return;
        }

        let right = this.inputNormalizer.right.isDown;
        let left = this.inputNormalizer.left.isDown;
        let down = this.inputNormalizer.down.isDown;
        let up = this.inputNormalizer.up.isDown;

        
        if (this.player.state === "stationary") {
            let x = right ? 1 : (left ? -1 : 0);
            let y = down ? 1 : (up ? -1 : 0);
            let vel = this.player.body.velocity;
            if (x === 0 && y === 0) {
                vel.set(0, 0);
            } else {
                vel.set(x, y);
                vel.normalize();
                vel.set(vel.x*100, vel.y*100);
            }
        }

        for (let b of this.butterflies) {
            b.y -= b.flySpeed;
        }

        this.player.update(time, delta);
    }

    getRandomBridgeTile() {
        let bridgeTiles = [2, 3, 4, 5];
        let allBridges = this.collisionLayer.filterTiles((tile) => bridgeTiles.includes(tile.index));
        if (allBridges.length < 1) {
            return false;
        }
        return Phaser.Utils.Array.GetRandom(allBridges);
    }

    glueBridge(tileX, tileY) {
        let curTile = this.getCollisionTileAt(tileX, tileY);
        if (curTile === 2 || curTile === 3) {
            this.setCollisionTile(tileX, tileY, curTile + 2);
        }
    }

    damageBridge(tile) {
        if (!tile) {
            return;
        }
        let newIndex = tile.index;
        if (newIndex > 3) {
            newIndex -= 2;
        } else if (newIndex === 2) {
            newIndex = 3;
        } else {
            newIndex = 6; // break completely
        }
        this.setCollisionTile(tile.x, tile.y, newIndex);
        if (newIndex === 6) {
            this.platformCollapseCheck();
        }
    }

    dropMapSection(tiles) {
        let rndStr = Math.random().toString(36).slice(2);
        let dropLayer = this.map.createBlankDynamicLayer('fall-section' + rndStr, this.tileset);
        dropLayer.randomize(3, 3, 4, 4, [3, 2]);
        let keyCoord = (key) => { let split = key.split('_'); return {x: parseInt(split[0]), y: parseInt(split[1])}; };
        let xs = [];
        let ys = [];
        for (let tileKey of tiles.entries()) {
            let index = tileKey[1];
            let tileCoord = keyCoord(tileKey[0]);

            this.setCollisionTile(tileCoord.x, tileCoord.y, 6);
            dropLayer.putTileAt(index, tileCoord.x, tileCoord.y);

            xs.push(tileCoord.x);
            ys.push(tileCoord.y);
        }
        let sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
        let avg = (arr) => Math.round(sum(arr)/arr.length);
        //dropLayer.setDisplayOrigin(this.collisionLayer.tileToWorldX(avg(xs)), this.collisionLayer.tileToWorldX(avg(ys)));
        dropLayer.pivotPointX = this.collisionLayer.tileToWorldX(avg(xs));
        dropLayer.pivotPointY = this.collisionLayer.tileToWorldY(avg(ys));
        dropLayer.resetAngle = function () {
            this.rotation = 0;
            this.x = 0;
            this.y = 0;
        };
        dropLayer.addAngle = function (rotation) {
            let x = this.x - this.pivotPointX;
            let y = this.x - this.pivotPointY;

            let sin = Math.sin(rotation);
            let cos = Math.cos(rotation);
            let newX = x * cos - y * sin;
            let newY = x * sin + y * cos;

            this.x = newX + this.pivotPointX;
            this.y = newY + this.pivotPointY;
            //this.rotation += rotation;
        };
        dropLayer.changeToAngle = function (rotation) {
            this.resetAngle();
            this.addAngle(rotation);
        }
        dropLayer.setOrigin(1, 0.5);
        //console.log([this.collisionLayer.tileToWorldX(avg(xs)), this.collisionLayer.tileToWorldX(avg(ys))]);
        //dropLayer.setScale(0.5);
        dropLayer.rotation = Math.PI/6;

        let rotator = { // object with setter to enable tweening the angle of my layer
            progress: 0,
            set tweenProgress(val) { this.progress = val; this.updateAngle(); },
            get tweenProgress() { return this.progress; },
            updateAngle: function () {
                let angle = Math.PI * 2 * this.progress;
                this.target.changeToAngle(angle);
            },
            target: dropLayer,
        };
        this.tweens.add({
            targets: rotator,
            tweenProgress: 1,
            duration: 2000,
            onComplete: () => rotator.target.destroy()
        });

        this.softPause();
    }

    platformCollapseCheck() {
        let uncheckedPlatforms = [];
        for (let key of this.platformCoords) {
            if (key !== this.masterPlatform) {
                uncheckedPlatforms.push(key);
            }
        }
        let coordKey = (coord) => (coord.x + '_' + coord.y);
        let keyCoord = (key) => { let split = key.split('_'); return {x: split[0], y: split[1]}; };
        let surround_ = (x, y) => [{x: x, y: y - 1}, {x: x + 1, y: y}, {x: x, y: y + 1}, {x: x - 1, y: y}];
        let surround = (c) => surround_(parseInt(c.x), parseInt(c.y)); 

        let sanity = 0;
        while (uncheckedPlatforms.length > 0) {
            if (sanity++ > 100000) {
                console.log('infinite loop!');
                return;
            }
            let curPlatformKey = uncheckedPlatforms.shift();
            let curPlatformCoord = keyCoord(curPlatformKey);
            let tIndex = this.getCollisionTileAt(curPlatformCoord.x, curPlatformCoord.y);
            let fill = new Map([[curPlatformKey, tIndex]]);
            let fillBorder = new Set([curPlatformKey]);

            // flood fill
            let connected = false;
            while (fillBorder.size > 0) {
                for (let curKey of fillBorder.entries()) {
                    curKey = curKey[0];
                    if (sanity++ > 100000) {
                        console.log('infinite loop!');
                        return;
                    }
                    if (curKey === this.masterPlatform) {
                        // All connected cancel the fill
                        connected = true;
                        fillBorder = new Set();
                        break;
                    }
                    if (uncheckedPlatforms.includes(curKey)) {
                        uncheckedPlatforms.splice(uncheckedPlatforms.indexOf(curKey), 1);
                    }
                    let curCoord = keyCoord(curKey);
                    let surroundPos = surround(curCoord);
                    // for each surrounding tile
                    for (let sc of surroundPos) {
                        let scKey = coordKey(sc);
                        if (!fill.has(scKey)) {
                            let tIndex = this.getCollisionTileAt(sc.x, sc.y);
                            if (tIndex !== 6) {
                                fill.set(scKey, tIndex);
                                fillBorder.add(scKey);
                            }
                        }
                    }
                    fillBorder.delete(curKey);
                }
            }
            //console.log(fill.size);

            if (!connected) {
                // delete all unconnected tiles
                this.dropMapSection(fill);
            }
        }
    }

    getForegroundTileAt(tileX, tileY) {
        if (!this.foregroundLayer || tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height) {
            return -1;
        }
        return this.foregroundLayer.getTileAt(tileX, tileY, true).index;
    }

    getCollisionTileAt(tileX, tileY) {
        if (tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height) {
            console.log('checking outside of map');
            return -1;
        }
        if (this.extraCollisionLayer) {
            let t = this.extraCollisionLayer.getTileAt(tileX, tileY, true);
            if (t.index !== -1) {
                return t.index;
            }
        }
        if (!this.collisionLayer.getTileAt(tileX, tileY, true)) {
            console.log([tileX, tileY])
            console.log('bad tile?');
            console.log(this.collisionLayer.getTileAt(tileX, tileY, true));
        }
        return this.collisionLayer.getTileAt(tileX, tileY, true).index;
    }

    setCollisionTile(tileX, tileY, newTileIndex) {
        if (newTileIndex === null) {
            this.collisionLayer.removeTileAt(tileX, tileY);
        } else {
            this.collisionLayer.putTileAt(newTileIndex, tileX, tileY);
        }
    }

    setForegroundTile(tileX, tileY, newTileIndex) {
        if (newTileIndex === null) {
            this.foregroundLayer.removeTileAt(tileX, tileY);
        } else {
            this.foregroundLayer.putTileAt(newTileIndex, tileX, tileY);
        }
    }

    getTilePosFromWorldPos(worldX, worldY) {
        return new Phaser.Geom.Point(Math.floor(worldX/constants.TILE_SIZE), Math.floor(worldY/constants.TILE_SIZE));
    }

    fixBrokenKeyState() {
        for (let key of this.input.keyboard.keys) {
            if (key && key.isDown) {
                key.reset();
            }
        }
    }

    resume() {
        this.scene.wake();
        this.scene.moveBelow("UIScene");
        this.uiScene.activeScene = this;
        this.fixBrokenKeyState();
        this.gamePause = false;
    }
    softResume() {
        this.gamePause = false;
        this.bridgeBreaker.paused = false;
        console.log('resuming');
    }
    softPause() {
        this.gamePause = true;
        this.bridgeBreaker.paused = true;
        console.log('pausing');
    }
    toggleSoftPause() {
        if (this.gamePause) {
            this.softResume();
        } else {
            this.softPause();
        }
    }
    pause() {
        this.softPause();
        this.scene.sleep();
    }

    pauseMenu() {
        this.softPause();
        this.uiScene.showPauseMenu();
    }
}
