let Phaser = window.Phaser;
import PreloaderScene from "./preloader-scene.js";

import constants from "./constants.js";

window.onload = function() {
    var config = {
        type: Phaser.AUTO,
        width: constants.WINDOW_WIDTH*4,
        height: constants.WINDOW_HEIGHT*4,
        pixelArt: true,
        zoom: 1,
        parent: 'gameContainer',
        scene: PreloaderScene,
        input: {
            gamepad: true,
        },
        physics: {
            default: 'arcade',
            arcade: {
                /*debug: true*/
            }
        },
    };
    window.gameInstance = new Phaser.Game(config);
};
