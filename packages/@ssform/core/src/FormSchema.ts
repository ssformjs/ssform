import { ISchema, IContext, IHook } from './Interface';
import Context from './core/Context';
import Layout from './core/Layout';
import format from './core/format';
import helper from './core/helper';

export default class FormSchema {

    ctx: IContext
    layout: Layout // root layout

    constructor(schema: ISchema | object, data?: object | null, hook?: IHook) {
        // 校验 schema

        this.ctx = new Context(<ISchema>schema, data, hook);
        this.layout = new Layout(this.ctx, {
            parent: null,
            schema,
            level: 0,
        });
        this.layout.created();

    }

    get value() {
        const inject = this.ctx.inject || {};
        const v = this.layout.value || {};
        return helper.merge({}, v, inject);
    }

    get formatValue() {
        return format(this.value, this.ctx.formatter);
    }

    validate(): Promise<any> {
        return this.layout.validate();
    }

    render(createElement?: Function) {
        if (!helper.isFunction(createElement)) {
            createElement = (a: any) => a;
        }
        return this.layout.render(createElement);
    }

    forceUpdate() {
        return this.layout.forceUpdate();
    }

    // ZAP: 需要改进事件机制
    setHook(hook: IHook) {
        this.ctx.setHook(hook);
    }
}
