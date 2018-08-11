import Phaser from "./phaser-module.js";
import constants from "./constants.js";
import InputNormalizer from "./input-normalizer.js";

export default class UIScene extends Phaser.Scene {

    constructor() {
        super({ key: 'UIScene' });
    }

    create(data) {
        this.cameras.main.zoom = 6;
        this.cameras.main.centerOn(constants.WINDOW_WIDTH/2, constants.WINDOW_HEIGHT/2);

        this.inputNormalizer = new InputNormalizer(this.input);

        this.pauseMenu = false;

        this.inputNormalizer.on('press_down', () => this.menuCursorMove('down'));
        this.inputNormalizer.on('press_up', () => this.menuCursorMove('up'));

        this.inputNormalizer.on('press_A', () => this.selectMenuItem());

        this.input.enabled = false;
    }

    showPauseMenu() {
        return;
    }

    resumeScene() {
        this.activeScene.softResume(); 
    }

    update(time, delta) {
        this.inputNormalizer.update();
    }
}
