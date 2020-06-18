/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/// @Copyright ~2020 ☜Samlv9☞ and other contributors
/// @MIT-LICENSE | 6.0.1 | https://developers.guless.com/
/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
import RegisteredEventListener from "./RegisteredEventListener";
import RegisteredEventListenerIterator from "./RegisteredEventListenerIterator";
import Event from "./Event";
import EventPhase from "./EventPhase";
import IEventListener from "./IEventListener";
import internal from "../internal";

class RegisteredEventListenerQueue {
    private _head: null | RegisteredEventListener = null;
    private _tail: null | RegisteredEventListener = null;

    public addListener(listener: RegisteredEventListener): void {
        let prev: null | RegisteredEventListener = this._tail;
        let next: null | RegisteredEventListener = null;

        while (prev !== null) {
            if (prev.priority >= listener.priority) {
                break;
            }

            next = prev;
            prev = prev.prev;
        }

        RegisteredEventListenerIterator.nodeWillBeInserted(listener);

        if (prev !== null) { (prev as internal)._next = listener; (listener as internal)._prev = prev; }
        if (next !== null) { (next as internal)._prev = listener; (listener as internal)._next = next; }

        if (this._head === next) { this._head = listener; }
        if (this._tail === prev) { this._tail = listener; }
    }

    public removeListener(listener: RegisteredEventListener): void {
        RegisteredEventListenerIterator.nodeWillBeRemoved(listener);

        const prev: null | RegisteredEventListener = listener.prev;
        const next: null | RegisteredEventListener = listener.next;

        if (prev !== null) { (prev as internal)._next = next; (listener as internal)._prev = null; }
        if (next !== null) { (next as internal)._prev = prev; (listener as internal)._next = null; }

        if (this._head === listener) { this._head = next; }
        if (this._tail === listener) { this._tail = prev; }
    }

    public hasListener(): boolean {
        return this._head !== null && this._tail !== null;
    }

    public getListener(listener: IEventListener, capture: boolean): null | RegisteredEventListener {
        for (let current: null | RegisteredEventListener = this._head; current !== null; current = current.next) {
            if (current.listener === listener && current.capture === capture) {
                return current;
            }
        }

        return null;
    }

    public dispatchEventToListeners(event: Event): void {
        const iterator: RegisteredEventListenerIterator = new RegisteredEventListenerIterator(this._head);
        
        try {
            iterator.init();
            for (let current: null | RegisteredEventListener = iterator.next(); current !== null && !event.immediatePropagationStopped; current = iterator.next()) {
                if ((event.eventPhase === EventPhase.CAPTURING_PHASE && !current.capture) ||
                    (event.eventPhase === EventPhase.BUBBLING_PHASE  &&  current.capture)) {
                    continue;
                }
                if (current.once) {
                    this.removeListener(current);
                }
                current.handleEvent(event);
            }
        } finally {
            iterator.dispose();
        }
    }
}

export default RegisteredEventListenerQueue;
