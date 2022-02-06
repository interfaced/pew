import {ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class RootErrorHandler extends ErrorHandler {
  override handleError(error: any): void {
    console.log('Error handled by RootErrorHandler: ' + error);
  }
}
