import sonyRemote from 'src/external/remotes/sony.json';
import sonyProtocol from 'src/external/protocols/sony.json';

import { Remote, RemoteJSON, ProtocolJSON, KeyData } from 'src/types/remote';

const remotes: Record<string, Remote> = {
  'sony': {
    id: 'sony',
    protocol: (sonyProtocol as ProtocolJSON).protocol,
    label: (sonyRemote as RemoteJSON).label,
    layout: (sonyRemote as RemoteJSON).layout,
    keycodes: (sonyProtocol as ProtocolJSON).keyMap
  }
}

export default remotes;
