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

        this.levelUI = this.add.bitmapText(2 + 60, 2, 'basic-font', 'LEVEL: 1');
        this.levelUI.setLetterSpacing(1);
        this.levelUI.setOrigin(0);

        this.scoreUI = this.add.bitmapText(constants.WINDOW_WIDTH - 80, 2, 'basic-font', 'SCORE: 00000');
        this.scoreUI.setLetterSpacing(1);
        this.scoreUI.setOrigin(0);

        this.pauseMenu = false;

        this.gameOverBG = false;
        this.gameOverText = false;
    }

    updateScore(score) {
        score = score + '';
        let zeros = 5 - score.length;
        if (zeros > 0) {
            for (let i = 0; i < zeros; i++) {
                score = '0' + score;
            }
        }
        if (score.length > 6) {
            this.scoreUI.x = constants.WINDO_WIDTH - 2 - ((7 + score.width)*6);
        }
        this.scoreUI.text = 'SCORE: ' + score;
    }

    updateGlue(count) {
        this.glueUI.text = 'GLUE: ' + count;
    }

    updateLevel(level) {
        this.levelUI.text = 'LEVEL: ' + level;
    }

    showPauseMenu() {
        return;
    }

    gameOver() {
        let x = constants.WINDOW_WIDTH/2;
        let y = constants.WINDOW_HEIGHT/2;
        this.gameOverBG = this.add.sprite(x, y, 'game-over-back');
        this.gameOverBG.depth = 1;

        this.gameOverText = this.add.bitmapText(x, y, 'basic-font', 'GAME OVER');
        this.gameOverText.depth = 2;
        this.gameOverText.setLetterSpacing(1);
        this.gameOverText.x -= this.gameOverText.width/2;
        this.gameOverText.y -= this.gameOverText.height/2 - 1;
    }
    unGameOver() {
        if (this.gameOverBG) {
            this.gameOverBG.destroy();
            this.gameOverText.destroy();
            this.gameOverBG = null;
            this.gameOverText = null;
        }
    }

    resumeScene() {
        this.activeScene.softResume(); 
    }

    update(time, delta) {
        this.inputNormalizer.update();
    }
}
