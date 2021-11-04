import helper from '../helper';
import { ISchema, IContext, IHook, ILifecycle, IRule } from '../Interface';
import Layout from './Layout';
import { Parser, Format } from '../parser';
import BaseEventHandler from './BaseEventHandler';
import validator from '../validator';

// 上下文
export default class Context extends BaseEventHandler implements IContext, ILifecycle {

    readonly layouts: Set<Layout> = new Set<Layout>()
    readonly schema: ISchema
    readonly originalData: object // 源数据副本
    readonly parserHandler: Parser
    readonly formatHandler: Format

    data: object // form 操作数据
    hook: IHook | null;

    private _forceUpdateFlag: boolean = false // 防止重复标记
    private _stateMap = new Map(); // 全局变量

    // extends rules 扩展校验规则

    constructor(schema: ISchema, data?: object | null, hook?: IHook) {
        super();
        this.schema = schema;
        data = data || {}; // 数据
        this.originalData = helper.cloneDeep(data); // 原始数据

        this.parserHandler = new Parser({ formatter: this.formatter });
        this.formatHandler = new Format({ formatter: this.formatter });

        this.data = this.parserHandler.parser(data);
        // hook
        this.hook = hook || null;
    }
    [key: string]: any;

    get version() {
        return this.schema.version;
    }

    get formatter() {
        return this.schema.formatter;
    }

    get inject() {
        return this.schema.inject || {};
    }

    // 设置监听
    setHook(hook: IHook) {
        this.hook = hook;
    }

    validationRuleHook(rule) {
        // 需要通过某一种规则解析 rules 中的每一个值
        if (this.hook && helper.isFunction(this.hook.validationRule)) {
            return this.hook.validationRule(rule);
        }
        return (rule: string | IRule) => {
            // rule 可能是一个对象
            if (helper.isString(rule)) { // 默认处理方式
                const key = rule.replace(/\([\w|\d|\\.]+\)/g, ''); // 可增强
                const params = rule.replace(key, '').replace('(', '').replace(')', '');
                const variables = params.split(',').map(param => param.trim());
                return validator.createValidationRule(key, ...variables);
            }
            return validator.createValidationRule(rule);
        };
    }

    getFormatValue(value) {
        return this.formatHandler.format(value);
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

    // 存全局变量
    setState(k: String, v: any) {
        return this._stateMap.set(k, v);
    }

    // 判断是否有全局变量
    hasState(k: String) {
        return this._stateMap.has(k);
    }

    // 取全局变量
    getState(k: String) {
        return this._stateMap.get(k);
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
}
