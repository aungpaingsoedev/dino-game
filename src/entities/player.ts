import type GameScene from "../scenes/game.scene";

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey?: Phaser.Input.Keyboard.Key;
  scen?: GameScene;

  constructor(scene: GameScene, x: number, y: number, key: string) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.init();
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  init() {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.setOrigin(0, 1);
    this.setGravityY(5000);
    this.setCollideWorldBounds(true);
    this.setBodySize(44, 92);
    this.setOffset(20, 0);
    this.setDepth(10);
    this.registerPlayControls();
    this.registerAnimations();
  }

  registerPlayControls() {
    this.spaceKey = this.scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update(_time: number, _delta: number) {
    let isSpaceJustDown = this.spaceKey
      ? Phaser.Input.Keyboard.JustDown(this.spaceKey)
      : false;

    const isDownPressed = this.cursors?.down?.isDown ?? false;
    const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Handle jumping
    if (isSpaceJustDown && onFloor && !isDownPressed) {
      this.setVelocityY(-1600);
    }

    // Handle ducking (down key held)
    if (isDownPressed && onFloor) {
      if (body.height > 58) {
        // Start ducking
        body.setSize(body.width, 58);
        this.setOffset(20, 34);
        this.anims.play("dino-down", true);
      }
    } else {
      // Stand up (down key released)
      if (body.height <= 58) {
        body.setSize(body.width, 92);
        this.setOffset(20, 0);
      }
    }

    if (!(this.scene as any).isGameRunning) {
      return;
    }

    // Handle running animation
    if (body.deltaAbsX() > 0) {
      this.anims.stop();
      this.setTexture("dino-run", 0);
    } else {
      this.playRunAnimation();
    }
  }

  playRunAnimation() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const isDownPressed = this.cursors?.down?.isDown ?? false;
    
    if (isDownPressed && body.height <= 58) {
      this.anims.play("dino-down", true);
    } else {
      this.anims.play("dino-run", true);
    }
  }

  registerAnimations() {
    this.anims.create({
      key: "dino-run",
      frames: this.anims.generateFrameNames("dino-run", { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dino-down",
      frames: this.anims.generateFrameNames("dino-down"),
      frameRate: 10,
      repeat: -1,
    });
  }

  die() {
    this.anims.stop();
    this.setTexture("dino-hurt");
  }
}
