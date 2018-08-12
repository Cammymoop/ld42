import Phaser from "./phaser-module.js";
import OverheadMapScene from "./overhead-map-scene.js";
import UIScene from "./ui-scene.js";
import constants from "./constants.js";

export let LoadedMaps = new Map();

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        "use strict";
        super({ key: 'PreloaderScene' });
    }

    preload() {
        "use strict";
        this.sys.canvas.style.display = "block";
        this.sys.canvas.style.marginLeft = "auto";
        this.sys.canvas.style.marginRight = "auto";
        this.sys.canvas.style.border = "6px solid #403353";

        this.cameras.main.setBackgroundColor('#a6fcdb');
        this.cameras.main.zoom = 2;

        this.load.setBaseURL('assets/');

        this.load.image('loader-image', 'img/loader.png');
        this.load.once('filecomplete', this.fullLoad, this);
    }

    fullLoad() {
        "use strict";
        // show the loading splash screen
        var loadingScreen = this.add.image(0, 0, 'loader-image');
        this.cameras.main.centerOn(0, 0);


        this.load.spritesheet('player', 'img/guy.png', {frameWidth: 12, frameHeight: 14});
        this.load.image('tiles_img', 'img/tiles_i_can_actually_use' + (constants.DEBUG ? 2 : 1) + '_extruded.png');

        this.load.image('brace', 'img/brace.png');
        this.load.image('net', 'img/net.png');

        this.load.atlas('butterfly-red', 'img/butterfly_red.png', 'img/butterfly_red.json');
        this.load.atlas('butterfly-blue', 'img/butterfly_blue.png', 'img/butterfly_blue.json');
        this.load.atlas('butterfly-yellow', 'img/butterfly_yellow.png', 'img/butterfly_yellow.json');

        // maps
        var mapId = 1;
        this.preloadLevel(mapId++, 'map1', 'map/map_orth.json');

        // audio
        /*
        this.load.audio('remove', [
            'audio/remove.ogg',
            'audio/remove.mp3'
        ]);
        */
    }

    preloadLevel(mapId, key, file) {
        "use strict";
        this.load.tilemapTiledJSON(key, file);
        LoadedMaps.set(mapId, key);
    }

    frameNamesDuration(frameNames) {
        for (let f of frameNames) {
            let textureFrame = this.textures.getFrame(f.key, f.frame);
            f.duration = textureFrame.customData.duration;
            console.log(f.duration);
        }
        return frameNames;
    }

    create() {
        "use strict";
        /*
        this.cache.bitmapFont.add('basic-font', Phaser.GameObjects.RetroFont.Parse(this, {
            image: 'symbols',
            chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>-+* ',
            width: 5,
            height: 8,
            charsPerRow: 10,
            spacing: {x: 1, y: 0},
        }));
        */
        let colors = ['red', 'blue', 'yellow'];
        for (let c of colors) {
            let frames = this.frameNamesDuration(this.anims.generateFrameNames('butterfly-' + c, { prefix: 'butterfly_' + c + ' ', suffix: '.ase', start: 0, end: 1}));
            this.anims.create({ key: 'b-' + c + '-flap', frames: frames, repeat: -1 });
        }


        //let gamepadConfig = document.localStorage.getItem('gamepad-config');
        let gamepadConfig = false;
        if (gamepadConfig) {
            this.registry.set('gamepadConfig', gamepadConfig);
        }

        this.scene.add('UIScene', UIScene);
        this.scene.add('OverheadMapScene', OverheadMapScene);

        console.log('starting ui scene');
        this.scene.launch('UIScene');

        console.log('starting overhead map scene');
        this.scene.start("OverheadMapScene");

        this.scene.bringToTop('UIScene');
        this.scene.get("UIScene").activeScene = this.scene.get("OverheadMapScene");
    }
}
