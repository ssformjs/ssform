import { IEventHandler } from '../Interface';

export class EventHandler implements IEventHandler {

    private readonly eventBus: Map<string, Set<Function>> = new Map<string, Set<Function>>();

    dispatch(eventName: string, ...values: any) {
        const eventBus = this.eventBus;
        const funcs = eventBus.get(eventName);
        if (funcs) {
            funcs.forEach(func => func(...values));
        }
        return this;
    }

    on(eventName: string, handler: Function) {
        const eventBus = this.eventBus;
        let funcs: Set<Function>;
        if (!eventBus.has(eventName)) {
            funcs = new Set();
            eventBus.set(eventName, funcs);
        } else {
            funcs = eventBus.get(eventName) || new Set();
        }
        funcs.add(handler);
        return this;
    }

    off(eventName: string, handler: Function) {
        const eventBus = this.eventBus;
        const funcs = eventBus.get(eventName);
        if (funcs) {
            funcs.delete(handler);
        }
        return this;
    }

    clear(eventName?: string) {
        const eventBus = this.eventBus;
        if (eventName) {
            eventBus.delete(eventName);
        } else {
            eventBus.clear();
        }
        return this;
    }

    once(eventName: string, handler: Function) {
        const wrapperHandler = (...args: any) => {
            const result = handler(...args);
            this.off(eventName, wrapperHandler);
            return result;
        };
        return this.on(eventName, wrapperHandler);
    }

}

// 上下文
export default abstract class BaseEventHandler implements IEventHandler {

    readonly eventHandler = new EventHandler()

    // TODO: 是否需要单独的事件？
    // events
    on(eventName: string, handler: Function) {
        return this.eventHandler.on(eventName, handler);
    }

    once(eventName: string, handler: Function) {
        return this.eventHandler.once(eventName, handler);
    }

    off(eventName: string, handler: Function) {
        return this.eventHandler.off(eventName, handler);
    }

    dispatch(eventName: string, ...values: any) {
        return this.eventHandler.dispatch(eventName, ...values);
    }

}
