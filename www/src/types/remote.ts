import { Key } from './key';
import { Protocols } from './pew/types';


// @ts-ignore
export const ProtocolName: Record<Protocols, number>  = {
  [Protocols.NEC as number]: 'NEC',
  [Protocols.SAMSUNG as number]: 'Samsung',
  [Protocols.SONY as number]: 'Sony',
  [Protocols.UNKNOWN as number]: 'Ʉ₦₭₦Ø₩₦'
}

export interface RemoteJSON {
  id: string,
  layout: (RemoteBtn|null)[][],
  label: string
}

export interface Remote {
  id: string,
  protocol: Protocols,
  layout: (RemoteBtn|null)[][],
  keycodes: Record<Key, { code: string, nbits: number }>,
  label: string,
  logo?: string
}

export interface KeyData { code: string, nbits: number }

export interface ProtocolJSON {
  id: string,
  label: string,
  protocol: Protocols,
  keyMap: Record<Key, KeyData>
}

export interface RemoteBtn {
  key: Key;
  label?: string;
  icon?: string; // see icon font
  bgColor?: string; // hex
  textColor?: string; // hex
  spanX?: number;
  spanY?: number;
}

export interface externalRemote {
  label: string;
  value: Remote
}
