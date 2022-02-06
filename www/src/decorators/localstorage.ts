import { decode, encode } from 'js-base64';

export function LocalStorage<T>({
                                  name,
                                  defaultValue,
                                  encrypt = false
                                }: { name?: string; defaultValue: T, encrypt?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Object, propName: string) => {
    const lsName = name || propName;

    let value: T | undefined;
    try {
      const item = window.localStorage.getItem(lsName);

      if (!item) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('propName not found in store');
      }
      value = encrypt ? JSON.parse(decode(item)) : JSON.parse(item);
    } catch (e) {
      value = defaultValue;
      localStorage.setItem(lsName, encrypt ? encode(JSON.stringify(value)) : JSON.stringify(value));
    }

    const boxed = { value };

    Object.defineProperty(target, propName, {
      configurable: true,
      enumerable: true,
      get: (): any => {
        return boxed.value;
      },
      set: (val: any) => {
        boxed.value = val;
        localStorage.setItem(lsName, encrypt ? encode(JSON.stringify(val)) : JSON.stringify(val));
      },
    });
  };
}
