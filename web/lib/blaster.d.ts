export enum Protocol {
    PLATFORM_SONY,
    PLATFORM_NEC,
    PLATFORM_SAMSUNG
}

export type EventSignal = {
    protocol: Protocol;
    code: number;
}

export type EventSleep = {
    ms: number;
}

export enum EventType {
    EVENT_SIGNAL,
    EVENT_SLEEP
}

export type ModeStatus = 'transparent'|'wall';
export type PowerStatus = 'on'|'off';
export type NetworkStatus = 'on'|'offline'|'off';

export type BlasterStatus = {
    mode: ModeStatus;
    power: PowerStatus;
    network: NetworkStatus;
};

export type BlasterEventConfig = [{type: EventType}, EventSignal|EventSleep];
export type SubscribeCallback = (event: BlasterEventConfig) => void;
export type BlasterEvents = {
    events: BlasterEventConfig[];
}

export class IRBlaster {
    public subscribe(SubscribeCallback): void
    public send(BlasterEvents): void
    public setStatus(BlasterStatus): void
    public getStatus(): Promise<BlasterStatus>
    public getName(): string
}
