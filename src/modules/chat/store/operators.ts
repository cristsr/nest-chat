import { distinctUntilChanged, Observable, pluck } from 'rxjs';

export const select = (key: string) => {
  return (target: Observable<{ [key: string]: any }>) =>
    target.pipe(pluck(key), distinctUntilChanged());
};
