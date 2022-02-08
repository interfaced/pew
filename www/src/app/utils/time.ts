export type Milliseconds = number;

function pad2(num:number) {
  return `${num < 10 ? '0' : ''}${num}`;
}

export function duration(time: Milliseconds):string {
  const seconds = time / 1000;
  const minutes = Math.floor(seconds / 60);

  if (seconds < 1) {
    return `00:${pad2(Math.floor(seconds))}.${time-Math.floor(seconds)}`;
  }

  if (minutes < 1) {
    return `00:${pad2(Math.floor(seconds))}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainSeconds = Math.floor(seconds % 60);
  const remainMinutes = minutes % 60;

  if (hours < 1) {
    return `${remainMinutes}:${pad2(remainSeconds)}`;
  }

  return `${hours.toString(10)}:${pad2(remainMinutes)}:${pad2(remainSeconds)}`;
}
