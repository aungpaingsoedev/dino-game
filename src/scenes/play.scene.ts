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
  startText!: Phaser.GameObjects.Text;
  scoreText!: Phaser.GameObjects.Text;
  highScoreText!: Phaser.GameObjects.Text;

  spawnInterval: number = 1500;
  spawnTime: number = 0;
  gameSpeed: number = 10;
  score: number = 0;
  scoreTimer: number = 0;
  highScore: number = 0;

  private static readonly STORAGE_HIGH_SCORE = "dino_high_score";

  constructor() {
    super("PlayScene");
  }

  create() {
    this.highScore = this.loadHighScore();
    this.createEnvironment();
    this.createPlayer();
    this.createObstacles();
    this.createGameOverContainer();
    this.createAnimations();
    this.createStartText();
    this.createScoreText();
    this.createHighScoreText();

    this.handleGameStart();
    this.handleGameRestart();
    this.handleObstacleCollision();
  }

  update(_time: number, delta: number): void {
    if (!this.isGameRunning) {
      return;
    }

    this.spawnTime += delta;
    this.scoreTimer += delta;
    if (this.scoreTimer >= 100) {
      this.score += 1;
      this.scoreTimer = 0;
      this.scoreText.setText(String(this.score));
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore(this.highScore);
        this.highScoreText.setText(String(this.highScore));
      }
    }

    if (this.spawnTime > this.spawnInterval) {
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
      .setOrigin(0, 1)
      .setDepth(2);
  }

  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createGameOverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add.image(0, 80, "restart");

    this.restartText.setInteractive({ useHandCursor: true });
    this.restartText.on("pointerover", () => this.restartText.setScale(1.05));
    this.restartText.on("pointerout", () => this.restartText.setScale(1));

    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([this.gameOverText, this.restartText])
      .setAlpha(0)
      .setDepth(20);
  }

  createStartText() {
    this.startText = this.add
      .text(this.gameWidth / 2, this.gameHeight / 2 - 20, "Press SPACE to start", {
        fontSize: "18px",
        color: "#535353",
        fontFamily: "Arial, sans-serif",
      })
      .setOrigin(0.5)
      .setDepth(15);
    this.tweens.add({
      targets: this.startText,
      alpha: { from: 0.6, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createScoreText() {
    this.scoreText = this.add
      .text(this.gameWidth - 24, 24, "0", {
        fontSize: "22px",
        color: "#535353",
        fontFamily: "Arial, sans-serif",
      })
      .setOrigin(1, 0)
      .setAlpha(0)
      .setDepth(15);
  }

  createHighScoreText() {
    this.add
      .text(this.gameWidth - 90, 52, "HI", {
        fontSize: "14px",
        color: "#535353",
        fontFamily: "Arial, sans-serif",
      })
      .setOrigin(0, 0)
      .setDepth(15);
    this.highScoreText = this.add
      .text(this.gameWidth - 24, 52, String(this.highScore), {
        fontSize: "14px",
        color: "#535353",
        fontFamily: "Arial, sans-serif",
      })
      .setOrigin(1, 0)
      .setDepth(15);
  }

  loadHighScore(): number {
    try {
      const s = localStorage.getItem(PlayScene.STORAGE_HIGH_SCORE);
      return s ? Math.max(0, parseInt(s, 10)) : 0;
    } catch {
      return 0;
    }
  }

  saveHighScore(value: number): void {
    try {
      localStorage.setItem(PlayScene.STORAGE_HIGH_SCORE, String(value));
    } catch {}
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

    obstacle.setImmovable(true).setOrigin(0, 1).setDepth(3);
  }

  handleGameStart() {
    this.startTrigger = this.physics.add
      .sprite(0, 10, "")
      .setAlpha()
      .setOrigin(0, 1);

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, +this.game.config.height);
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
            this.startText.setVisible(false);
            this.scoreText.setAlpha(1);
          }
        },
      });
    });
  }

  handleGameRestart() {
    this.restartText.on("pointerdown", () => {
      this.tweens.add({
        targets: this.gameOverContainer,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.physics.resume();
          this.player.setVelocityY(0);
          this.obstacles.clear(true, true);
          this.anims.resumeAll();
          this.spawnTime = 0;
          this.score = 0;
          this.scoreTimer = 0;
          this.scoreText.setText("0");
          this.isGameRunning = true;
        },
      });
    });
  }

  handleObstacleCollision() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      if (!this.isGameRunning) return;

      this.physics.pause();
      this.player.die();
      this.isGameRunning = false;
      this.anims.pauseAll();
      this.gameOverContainer.setAlpha(0);
      this.tweens.add({
        targets: this.gameOverContainer,
        alpha: 1,
        duration: 300,
        ease: "Quad.easeOut",
      });
    });
  }
}

export default PlayScene;
