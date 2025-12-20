import Phaser from "phaser";
import PreloadScene from "./scenes/preload.scene";
import PlayScene from "./scenes/play.scene";

export const PRELOAD_CONFIG = {
  cactusesCount: 6,
  birdsCount: 1,
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1000,
  height: 340,
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 200, x: 0 },
      debug: true,
    },
  },
  scene: [PreloadScene, PlayScene],
};

new Phaser.Game(config);
