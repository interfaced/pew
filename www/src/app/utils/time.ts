export type Milliseconds = number;

export function duration(ms: Milliseconds) {
  const self = ms/1000;
  const min = (self) << 0;
  const sec = (self*60) % 60;

  return min + ':' + (sec === 0 ? '00': sec)
}
