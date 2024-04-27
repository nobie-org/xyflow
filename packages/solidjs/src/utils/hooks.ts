
export const useRef = <T>(initialValue: T): Ref<T> => {
    return new Ref(initialValue);
}

class Ref<T> { 
    constructor(private _current: T) {
    }

    get current() {
        return this._current;
    }

    set current(value) {
        this._current = value;
    }
}