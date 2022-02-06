import { BlasterEvent } from './pew/blaster';

export interface BlasterJob {
  name: string;
  items: BlasterEvent[];
}
