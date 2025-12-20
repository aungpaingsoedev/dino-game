import Phaser from "phaser";
import type { SpriteWithDynamicBody } from "../types";
import { Player } from "../entities/player";
import GameScene from "./game.scene";
import { PRELOAD_CONFIG } from "../main";

class PlayScene extends GameScene {
  player!: Player;
  startTrigger!: SpriteWithDynamicBody;
  obstacles!: Phaser.Physics.Arcade.Group;
  ground!: Phaser.GameObjects.TileSprite;
  gameOverText!: Phaser.GameObjects.Image;
  restartText!: Phaser.GameObjects.Image;
  gameOverContainer!: Phaser.GameObjects.Container;

  spawnInterval: number = 1500;
  spawnTime: number = 0;
  gameSpeed: number = 10;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();
    this.createObstacles();
    this.createGameOverContainer();
    this.createAnimations();

    this.handleGameStart();
    this.handleGameRestart();
    this.handleObstacleCollision();
  }

  update(time: number, delta: number): void {
    if (!this.isGameRunning) {
      return;
    }

    this.spawnTime += delta;

    if (this.spawnTime > this.spawnInterval) {
      console.log("spawn obsacle");
      this.spawnTime = 0;
      this.spawnObstacle();
    }

    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);

    (this.obstacles.getChildren() as SpriteWithDynamicBody[]).forEach(
      (obstacle) => {
        if (obstacle.getBounds().right < 0) {
          this.obstacles.remove(obstacle);
        }
      }
    );

    this.ground.tilePositionX += this.gameSpeed;
  }

  createPlayer() {
    this.player = new Player(this, 0, +this.game.config.height, "dino-idle");
  }

  createEnvironment() {
    this.ground = this.add
      .tileSprite(0, +this.game.config.height, 88, 26, "ground")
      .setOrigin(0, 1);
  }

  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createGameOverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add.image(0, 80, "restart");

    // Make restart text interactive before adding to container
    this.restartText.setInteractive({ useHandCursor: true });

    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([this.gameOverText, this.restartText])
      .setAlpha(0);
  }

  createAnimations() {
    this.anims.create({
      key: "enemy-bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird", { start: 0, end: -1 }),
      frameRate: 6,
      repeat: -1
    });
  }

  spawnObstacle() {
    const ObstacleNumber =
      Math.floor(
        Math.random() * PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount
      ) + 1;
    const distance = Phaser.Math.Between(600, 900);

    let obstacle;

    if (ObstacleNumber > PRELOAD_CONFIG.cactusesCount) {
      let enemyPossibleHeight = [20, 70];
      let enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)];
      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight - enemyHeight,
        `enemy-bird`
      );
      // Play bird animation
      if (this.anims.exists("enemy-bird-fly")) {
        obstacle.anims.play("enemy-bird-fly", true);
      }
    } else {
      obstacle = this.obstacles.create(
        this.gameWidth + distance, 
        this.gameHeight,
        `obstacle-${ObstacleNumber}`
      );
    }

    obstacle.setImmovable(true).setOrigin(0, 1);
  }

  handleGameStart() {
    this.startTrigger = this.physics.add
      .sprite(0, 10, "")
      .setAlpha()
      .setOrigin(0, 1);

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, +this.game.config.height);
        console.log("RESET");
        return;
      }

      this.startTrigger.body.reset(900, 999);

      let rollOutEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callback: () => {
          this.player.playRunAnimation();
          this.player.setVelocityX(80);
          this.ground.width += 17 * 2;

          if (this.ground.width >= +this.gameWidth) {
            rollOutEvent.remove();
            this.player.setVelocityX(0);
            this.ground.width = +this.gameWidth;
            this.isGameRunning = true;
          }
        },
      });
    });
  }

  handleGameRestart() {
    this.restartText.on("pointerdown", () => {
      this.physics.resume();
      this.gameOverContainer.setAlpha(0);
      this.player.setVelocityY(0);
      this.obstacles.clear(true, true);
      this.anims.resumeAll();
      // Reset spawn time to allow immediate spawning
      this.spawnTime = 0;
      this.isGameRunning = true;
    });
  }

  handleObstacleCollision() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      if (!this.isGameRunning) return;
      
      this.physics.pause();
      this.player.die();
      this.isGameRunning = false;
      // Pause all animations including bird animations
      this.anims.pauseAll();
      this.gameOverContainer.setAlpha(1);
    });
  }
}

export default PlayScene;
