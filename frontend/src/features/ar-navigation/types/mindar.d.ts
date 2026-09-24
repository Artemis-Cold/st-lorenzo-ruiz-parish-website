declare module "mind-ar/dist/mindar-image.prod.js" {
  export class Controller {
    constructor(options: {
      inputWidth: number;
      inputHeight: number;
      maxTrack: number;
      onUpdate: (event: {
        type: string;
        targetIndex: number;
        worldMatrix: number[] | null;
      }) => void;
    });
    addImageTargetsFromBuffer(buffer: ArrayBuffer): { dimensions: number[][] };
    getProjectionMatrix(): number[];
    dummyRun(video: HTMLVideoElement): Promise<void>;
    processVideo(video: HTMLVideoElement): Promise<void>;
    stopProcessVideo(): void;
    dispose(): void;
    worker: Worker;
  }
  export class Compiler {
    compileImageTargets(
      images: HTMLImageElement[],
      progress: (percent: number) => void,
    ): Promise<unknown>;
    exportData(): Uint8Array;
  }
}
