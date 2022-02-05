import IRBlaster from './blaster';

export type ScannerCallback = (IRBlaster) => void;

export interface IRBlasterScanner {
    subscribe(ScannerCallback): void
    get(): IRBlaster[]
}
