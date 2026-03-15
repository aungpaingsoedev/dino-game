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
  parent: "app",
  backgroundColor: "#f7f7f7",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: { pixelArt: false, antialias: true },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [PreloadScene, PlayScene],
};

new Phaser.Game(config);
