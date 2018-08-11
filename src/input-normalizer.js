import Phaser from "./phaser-module.js";

export let LoadedMaps = new Map();

export default class InputNormalizer extends Phaser.Events.EventEmitter {
    constructor(inputPlugin) {
        super();
        this.inputPlugin = inputPlugin;
        this.gpBtnMap = new Map([
            [0, 'A'],
            [1, 'B'],
            [2, 'X'],
            [3, 'Y'],
            [4, 'L1'],
            [5, 'R1'],
            [6, 'L2'],
            [7, 'R2'],
            [8, 'select'],
            [9, 'start'],
            [10, 'L3'],
            [11, 'R3'],
            [12, 'up'],
            [13, 'down'],
            [14, 'left'],
            [15, 'right'],
            [16, 'home'],
        ]);
        this.gpAxisMap = new Map([
            [0, 'leftStickH'],
            [1, 'leftStickV'],
            [2, 'rightStickH'],
            [3, 'rightStickV'],
            [4, 'altDpadH'],
            [5, 'altDpadV'],
        ]);

        this.gamepadButtons = new Map([ 
            ["A", "A"],
            ["B", "B"],
            ["index", {index: 9, maps: "start"}],
            ["up", "up"],
            ["down", "down"],
            ["left", "left"],
            ["right", "right"],
            ["start", "start"],
        ]);
        this.gamepadAxes = new Map([ 
            ["altDpadH", {pos: "right", neg: "left"}],
            ["altDpadV", {pos: "down", neg: "up"}],
        ]);
        this.keyboardKeys = new Map([ 
            ["Space", "A"],
            ["Escape", "B"],
            ["KeyZ", "B"],
            ["Enter", "start"],
            ["ArrowUp", "up"],
            ["ArrowDown", "down"],
            ["ArrowLeft", "left"],
            ["ArrowRight", "right"],
        ]);

        this.axesHeld = {};
        this.axisButtonMin = 0.4;

        this.selectedGamePad = 1;

        this.A = {isDown: false};
        this.B = {isDown: false};
        this.start = {isDown: false};

        this.up = {isDown: false};
        this.down = {isDown: false};
        this.left = {isDown: false};
        this.right = {isDown: false};

        this.inputPlugin.keyboard.on('keydown', (event) => this.keyboardEvent(event));
        this.inputPlugin.keyboard.on('keyup', (event) => this.keyboardEvent(event));

        this.inputPlugin.gamepad.on('down', (pad, button, value) => this.gamepadButtonEvent('down', pad, button, value));
        this.inputPlugin.gamepad.on('up', (pad, button, value) => this.gamepadButtonEvent('up', pad, button, value));
    }
    loadGamepadConfig(gamepadConfig) {
    }

    keyboardEvent(event) {
        if (this.keyboardKeys.has(event.code)) {
            let normalizedButton = this.keyboardKeys.get(event.code);
            if (event.type === 'keydown' && !event.repeat) {
                this.emit('press_' + normalizedButton);
                this[normalizedButton].isDown = true;
            } else if (event.type === 'keyup') {
                this[normalizedButton].isDown = false;
            }
        }
    }

    gamepadButtonEvent(type, pad, button, value) {
        let buttonName = button.index;
        if (button.index <= 16) { // supported named buttons
            buttonName = this.gpBtnMap.get(button.index);
        }
        if (this.gamepadButtons.has(buttonName)) {
            let normalizedButton = this.gamepadButtons.get(buttonName);
            if (type === 'down') {
                this.emit('press_' + normalizedButton);
                this[normalizedButton].isDown = true;
            } else if (type === 'up') {
                this[normalizedButton].isDown = false;
            }
        }
    }

    // update the gamepad axis state
    update() {
        if (this.inputPlugin.gamepad.total < 1) {
            return;
        }
        if (!this.gamepad) {
            this.gamepad = this.inputPlugin.gamepad.getPad(this.selectedGamePad);
            if (!this.gamepad || !this.gamepad.connected) {
                this.gamepad = this.inputPlugin.gamepad.getAll()[0];
                this.selectedGamePad = this.gamepad.index;
            }
            for (let axis of this.gamepad.axes) {
                if (!this.axesHeld.hasOwnProperty(axis.index)) {
                    this.axesHeld[axis.index] = false;
                }
            }
        }
        let axesCount = this.gamepad.axes.length;
        for (let axis of this.gamepad.axes) {
            let axisName = axis.index;
            if (axis.index <= 5) { // supported named axes
                axisName = this.gpAxisMap.get(axis.index);
            }
            // update emulated buttons from axis values
            if (this.gamepadAxes.has(axisName)) {
                let normalizedButtons = this.gamepadAxes.get(axisName);
                let absVal = Math.abs(axis.value);
                let key = axis.value > 0 ? "pos" : "neg";
                let heldVal = this.axesHeld[axis.index];
                if (absVal > this.axisButtonMin && heldVal !== key) {
                    if (heldVal) {
                        this[normalizedButtons[heldVal]].isDown = false; // axis switched directions
                    }
                    this.axesHeld[axis.index] = key;
                    this.emit('press_' + normalizedButtons[key]);
                    this[normalizedButtons[key]].isDown = true;
                } else if (absVal < this.axisButtonMin && heldVal) {
                    this.axesHeld[axis.index] = false;
                    this[normalizedButtons[heldVal]].isDown = false;
                }
            }
        }
    }
}
