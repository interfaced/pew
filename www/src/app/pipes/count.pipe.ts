import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'count'
})
export class CountPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    const count = ++value;
    return count < 10 ? '0' + count : count.toString();
  }
}
