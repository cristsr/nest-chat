import { BehaviorSubject, scan, Subject } from 'rxjs';
import { Action, Reducer } from 'modules/chat/store/reducers';

export class Store<T> extends BehaviorSubject<T> {
  private readonly dispatcher = new Subject();

  constructor(reducer: Reducer<T>, initialState: T) {
    super(initialState);

    if (!initialState) {
      throw new TypeError('Initial state not provide');
    }

    this.dispatcher
      .pipe(
        scan(
          (state: T, action: Action) => reducer(state, action),
          initialState,
        ),
      )
      .subscribe((state: T) => super.next(state));
  }

  next(value: any) {
    this.dispatcher.next(value);
  }
}
