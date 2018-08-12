import Phaser from "./phaser-module.js";
import constants from "./constants.js";
import InputNormalizer from "./input-normalizer.js";

export default class UIScene extends Phaser.Scene {

    constructor() {
        super({ key: 'UIScene' });
    }

    create(data) {
        this.cameras.main.zoom = 4;
        this.cameras.main.centerOn(constants.WINDOW_WIDTH/2, constants.WINDOW_HEIGHT/2);

        this.inputNormalizer = new InputNormalizer(this.input);

        this.header = this.add.sprite(0, 0, 'ui-header').setOrigin(0);

        this.glueUI = this.add.bitmapText(2, 2, 'basic-font', 'GLUE: 1');
        this.glueUI.setLetterSpacing(1);
        this.glueUI.setOrigin(0);

        this.pauseMenu = false;
    }

    updateGlue(count) {
        this.glueUI.text = 'GLUE: ' + count;
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
