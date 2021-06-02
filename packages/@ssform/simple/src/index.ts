import { FormSchema } from '@ssform/core';
import Layout from '@ssform/core/lib/core/Layout';
import { ISchema, IHook } from '@ssform/core/lib/Interface';

export interface ISimpleHook {
    // 根结点
    renderRoot: (createElement: Function, layout: Layout, childrens: any[]) => any
    // 组节点
    renderGroup: (createElement: Function, layout: Layout, childrens: any[]) => any
    // 子节点
    renderGroupItem: (createElement: Function, layout: Layout, childrens: any[]) => any
    // 动态组节点
    renderDynamicGroup: (createElement: Function, layout: Layout, childrens: any[]) => any
    // 动态组子节点
    renderDynamicGroupLayout: (createElement: Function, layout: Layout, childrens: any[]) => any
    // UI刷新回调
    update?: (layout: Layout) => void
}


export default class SimpleSchema extends FormSchema {

    constructor(schema: ISchema | object, data?: object | null, hook?: ISimpleHook) {
        super(schema, data, SimpleSchema._createHook(hook));
    }

    private static _createHook(hook?: ISimpleHook): IHook | undefined {
        if (hook === null || hook === undefined) return;
        return {
            render(_h: Function, l: Layout, c: any[]) {
                if (l.isRoot) {
                    return hook?.renderRoot(_h, l, c);
                } else if (l.isGroup) {
                    let item = c;
                    if (l.isDynamicLayoutType && c.length > 0) {
                        item = c.map((itemC, index) => {
                            const layout = [ ...l.layouts ][index];
                            return hook?.renderDynamicGroupLayout(_h, layout, [ itemC ]);
                        });
                        if (typeof hook.renderDynamicGroup === 'function') { // if exist
                            return hook?.renderDynamicGroup(_h, l, item);
                        } // else hook.renderGroup
                    }
                    return hook?.renderGroup(_h, l, item);
                }
                return hook?.renderGroupItem(_h, l, c);
            },
            update: hook?.update,
        };
    }

    setSimpleHook(simpleHook: ISimpleHook) {
        const hook = SimpleSchema._createHook(simpleHook);
        if (hook) {
            super.setHook(hook);
        }
    }
}
