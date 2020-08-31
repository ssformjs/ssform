import helper from './helper';
import { ISchema, IContext, IHook, ILifecycle, IEventHandler } from '../Interface';
import Layout from './Layout';
import parser from './parser';
import EventHandler from './EventHandler';

// 上下文
export default class Context implements IContext, ILifecycle, IEventHandler {

    readonly layouts: Set<Layout> = new Set<Layout>()
    readonly eventHandler = new EventHandler()
    readonly schema: ISchema
    readonly originalData: object // 源数据副本

    data: object // form 操作数据
    hook: IHook | null;

    private _forceUpdateFlag: boolean = false // 防止重复标记

    // extends rules 扩展校验规则

    constructor(schema: ISchema, data?: object | null, hook?: IHook) {
        this.schema = schema;
        data = data || {};
        this.originalData = helper.cloneDeep(data);
        this.data = parser(helper.cloneDeep(data), this.formatter);
        // hook
        this.hook = hook || null;
    }
    [key: string]: any;

    get version() {
        return this.schema.version;
    }

    get formatter() {
        if (!helper.isPlainObject(this.schema.formatter)) {
            return;
        }
        return this.schema.formatter;
    }

    get inject() {
        return this.schema.inject || {};
    }

    setHook(hook: IHook) {
        this.hook = hook;
    }

    created(layout?: Layout) {
        if (layout) {
            this.layouts.add(layout);
        }
    }

    destroy(layout?: Layout) {
        if (layout) {
            this.layouts.delete(layout);
        }
    }

    _$render(createElement: Function, layout: Layout, childrens: any[]) {
        const hook = this.hook;
        if (hook) {
            return hook.render(createElement, layout, childrens);
        }
        return null;
    }

    _$forceUpdate(layout: Layout) {
        if (!layout.initialized) return;
        if (this._forceUpdateFlag) return;
        this._forceUpdateFlag = true;
        return Promise.resolve().then(() => {
            this._forceUpdateFlag = false;
            const hook = this.hook;
            if (hook && helper.isFunction(hook.update)) {
                return hook.update(layout);
            }
        });
    }

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
