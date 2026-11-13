import Phaser from "phaser";

/**
 * 1 px pixel-art outline textures, built once at boot from existing frames (works on WebGL and Canvas: no tints).
 * Cloud playtest: at point-blank range the dark-green hero merged into Nanh Rễ's pale body, so spacing and facing
 * were hard to judge. A dark 4-neighbour outline drawn behind the hero keeps the silhouette (and the sword) readable
 * over any background. For each texture `key` with the prefix, adds `key + "_ol"`.
 */
export function buildOutlines(scene: Phaser.Scene, prefix: string, rgba: [number, number, number, number] = [8, 10, 14, 235]): void {
  for (const key of scene.textures.getTextureKeys()) {
    if (!key.startsWith(prefix) || key.endsWith("_ol") || scene.textures.exists(key + "_ol")) continue;
    const src = scene.textures.get(key).getSourceImage() as HTMLCanvasElement | HTMLImageElement;
    const w = src.width, h = src.height;
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d")!;
    g.drawImage(src, 0, 0);
    const a = g.getImageData(0, 0, w, h).data;
    const out = g.createImageData(w, h), o = out.data;
    const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (solid(x, y) || !(solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) continue;
        const i = (y * w + x) * 4;
        o[i] = rgba[0]; o[i + 1] = rgba[1]; o[i + 2] = rgba[2]; o[i + 3] = rgba[3];
      }
    g.clearRect(0, 0, w, h);
    g.putImageData(out, 0, 0);
    scene.textures.addCanvas(key + "_ol", c);
  }
}
