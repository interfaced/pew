import {IRBlaster} from './blaster';

export type ScannerCallback = (IRBlaster) => void;

export class IRBlasterScanner {
    subscribe(ScannerCallback): void
    get(): IRBlaster[]
}
