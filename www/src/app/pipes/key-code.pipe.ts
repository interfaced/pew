import { Pipe, PipeTransform } from '@angular/core';
import { RemotesService } from '@services/remotes.service';
import { Key } from 'src/types/key';

@Pipe({
  name: 'keyCode'
})
export class KeyCodePipe implements PipeTransform {
  constructor(
    private remotesService: RemotesService
  ) {
  }

  transform(value: string, ...args: unknown[]): Key {
    return this.remotesService.keysDict[value] || Key.UNKNOWN;
  }
}
