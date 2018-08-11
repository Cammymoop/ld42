let Phaser = window.Phaser;
import PreloaderScene from "./preloader-scene.js";

window.onload = function() {
    var config = {
        type: Phaser.AUTO,
        width: 624*2,
        height: 372*2,
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
