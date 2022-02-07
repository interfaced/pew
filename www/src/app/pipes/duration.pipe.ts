import { Pipe, PipeTransform } from '@angular/core';
import { duration, Milliseconds } from '@app/utils/time';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: Milliseconds): string {
    return duration(value);
  }

}
