import {BlasterStatus} from './blaster';
import {EventEmitter} from 'events';

export interface IIRBlaster extends EventEmitter {
    send(BlasterEvents): void
    setStatus(BlasterStatus): void
    getStatus(): Promise<BlasterStatus>
    getName(): string
}
