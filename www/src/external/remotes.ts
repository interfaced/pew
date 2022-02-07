import SonyRemoteJSON from 'src/external/remotes/sony.json';
import SonyProtocolJSON from 'src/external/protocols/sony.json';

import TizenRemoteJSON from 'src/external/remotes/samsung.json';
import TizenProtocolJSON from 'src/external/protocols/samsung.json';

import LGRemoteJSON from 'src/external/remotes/lg.json';
import LGProtocolJSON from 'src/external/protocols/lg.json';

import { Remote, RemoteJSON, ProtocolJSON } from 'src/types/remote';

const remotes: Record<string, Remote> = {
  [TizenRemoteJSON.id]: {
    id: TizenRemoteJSON.id,
    protocol: (TizenProtocolJSON as ProtocolJSON).protocol,
    label: (TizenRemoteJSON as RemoteJSON).label,
    layout: (TizenRemoteJSON as RemoteJSON).layout,
    keycodes: (TizenProtocolJSON as ProtocolJSON).keyMap
  },
  [SonyRemoteJSON.id]: {
    id: SonyRemoteJSON.id,
    protocol: (SonyProtocolJSON as ProtocolJSON).protocol,
    label: (SonyRemoteJSON as RemoteJSON).label,
    layout: (SonyRemoteJSON as RemoteJSON).layout,
    keycodes: (SonyProtocolJSON as ProtocolJSON).keyMap
  },
  [LGRemoteJSON.id]: {
    id: LGRemoteJSON.id,
    protocol: (LGProtocolJSON as ProtocolJSON).protocol,
    label: (LGRemoteJSON as RemoteJSON).label,
    layout: (LGRemoteJSON as RemoteJSON).layout,
    keycodes: (LGProtocolJSON as ProtocolJSON).keyMap
  }
}

export default remotes;
