import { Injectable } from '@angular/core';

import remotes from 'src/external/remotes';


@Injectable({
  providedIn: 'root'
})
export class RemotesService {
  remotes = remotes;
  constructor() { }
}
