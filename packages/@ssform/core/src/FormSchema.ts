import { ISchema, IContext, IHook } from './Interface';
import Context from './core/Context';
import Layout from './core/Layout';
import helper from './helper';

class Builder {

    handler: FormSchema

    private layout: Layout // root layout

    constructor(handler: FormSchema, layout: Layout) {
        this.handler = handler;
        this.layout = layout;
    }

    get root() {
        return this.layout;
    }

    get ctx() {
        return this.handler.ctx;
    }

    get value() {
        const inject = this.ctx.inject || {};
        const v = this.layout.value || {};
        return helper.merge({}, v, inject);
    }

    get formatValue() {
        return this.ctx.getFormatValue(this.value);
    }

    findLayoutByKeyPath(keyPath: string) {
        if (!keyPath) {
            console.warn('[findLayoutByKeyPath] keyPath must be required!', keyPath);
            return;
        }
        const layouts = [ ...this.ctx.layouts ];
        const layout = layouts.find(l => {
            return l.keyPath === keyPath;
        });
        return layout;
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

    destroy() {
        return this.layout.destroy();
    }
}

export default class FormSchema {

    ctx: IContext;
    schema: ISchema | object; // root schema
    builder: Builder | undefined;
    rootLayout: Layout | undefined; // root layout

    constructor(schema: ISchema | object, data?: object | null, hook?: IHook) {
        // 校验 schema
        this.ctx = new Context(<ISchema>schema, data, hook);
        this.schema = schema;
    }

    // ZAP: 需要改进事件机制
    setHook(hook: IHook) {
        this.ctx.setHook(hook);
        return this;
    }

    create() {
        this.rootLayout = new Layout(this.ctx, {
            parent: null,
            schema: this.schema,
            level: 0,
        });
        this.rootLayout.created();
        this.builder = new Builder(this, this.rootLayout);
        return this.builder;
    }

    destroy() {
        if (this.builder) {
            this.builder.destroy();
        }
    }
}
