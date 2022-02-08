import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import remotes from 'src/external/remotes';
import { Remote } from 'src/types/remote';
import { Key } from '../../types/key';


@Injectable({
  providedIn: 'root'
})
export class RemotesService {
  public remotes = remotes;
  public list: Remote[] = Object.values(remotes);

  private activeRemote = new BehaviorSubject<Remote|null>(null);
  public active$ = this.activeRemote.pipe();

  public keysDict: Record<string, Key> = {};

  constructor() { }

  setActive(id: string) {
    const remote = this.remotes[id] || null;
    this.activeRemote.next(this.remotes[id] || null);
    this.prepareKeyCodes(remote);
  }

  private prepareKeyCodes(remote: Remote |null) {
    if (!remote) {
      return;
    }

    const keycodes = (remote.keycodes || {}) as Record<Key, { code: string, nbits: number }>;

    this.keysDict = Object.entries(keycodes)
      .reduce<Record<string, Key>>((acc, [key, data]) => {
        acc[data.code] = key as Key;
        return acc;
      }, {});
  }
}
