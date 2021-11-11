import { ICurrentData, IContext, ILifecycle } from '../Interface';
import Schema from './Schema';
import Validator from './Validator';
import helper, { randomID, arrayToMapForData, mapToArrayForData } from '../helper';
import { MAP_KEY, ARRAY_KEY } from './constants';
import BaseEventHandler from './BaseEventHandler';

const EVENT_NAME = {
    VALIDATE: 'validate',
};

export default class Layout extends BaseEventHandler implements ILifecycle {
    private readonly __RANDOM_UUID__: string = randomID()
    readonly ctx: IContext // 上下文

    readonly schema: Schema // 规则
    readonly validator: Validator // 验证器
    readonly layouts: Set<Layout> = new Set<Layout>()

    root: Layout // 根级
    index: number // 数组位置（对象时则是 0）
    level: number // 层级
    parent: Layout | null // 父级

    private _data: any // 当前层级 form 数据
    private _initialized: boolean = false
    private _visiblable: boolean = false // 是否显示
    private _valueCache: any = undefined

    constructor(ctx: IContext, current: ICurrentData) {
        super();
        this.ctx = ctx;

        const { parent, index, level, schema } = current;
        this.index = index || 0; // index 数组（isGroupItem = true）时有效
        this.level = level || 0;
        this.parent = parent || null;
        this.root = this.parent ? this.parent.root : this; // get rootParent

        // 以下顺序不可变
        this.schema = new Schema(ctx, schema);
        this.validator = new Validator(ctx, this);
    }

    get initialized() {
        return this._initialized;
    }

    get uuid() {
        const parent = this.parent;
        if (parent) {
            const level = this.level;
            const index = this.index;
            if (this.isGroupItem) {
                return `${parent.uuid}-${level}_${index}_DynamicItem_${this.__RANDOM_UUID__}`;
            }
            const key = this.schema.key;
            if (key) {
                return `${parent.uuid}-${level}_${index}_${key}`;
            }
            return `${parent.uuid}-${level}_${index}_${this.__RANDOM_UUID__}`;
        }
        return `Root_${this.__RANDOM_UUID__}`;
    }

    get layoutArray() {
        return [ ...this.layouts ];
    }

    // ZAP: data 处理为 immutable？
    get data() {
        const ctx = this.ctx;
        let result: any;

        if (!this.initialized) { // init
            if (this.parent) {
                if (this.isGroupItem) {
                    result = this.parent.data && this.parent.data[this.index];
                } else {
                    const key = this.schema.key;
                    result = this.parent.data && this.parent.data[key];
                }
                // map 对象转回数组
                if (this.isDynamicLayoutType) {
                    if (this.layoutType === MAP_KEY) {
                        result = mapToArrayForData(result);
                    }
                }
            } else {
                result = ctx.data;
            }

            // 初始化 data
            if (result === undefined) {
                if (this.isDynamicLayoutType) {
                    result = [];
                } else if (this.isGroup || this.isGroupItem) {
                    result = {};
                } else {
                    result = this.schema.default;
                }
            }

            // validate
            // this.validateDataFunc(result);

            // 快速赋值，刷新逻辑
            this.data = result;

        } else {
            result = this._data;
        }

        return result;
    }

    set data(value: any) {
        if (this.parent) {
            if (this.isGroupItem) {
                this.parent.data[this.index] = value;
            } else {
                const key = this.schema.key;
                this.parent.data[key] = value;
            }
            this.parent._clearvalueCache();
        } else { // not has parent
            this.ctx.data = value;
        }
        this._clearvalueCache();
        this._data = value;

        // validate
        this.validateDataFunc(this._data).then(() => {
            // update
            this.forceUpdate();
        });
    }

    get isRoot() {
        return !this.parent;
    }

    get parentLayoutType() {
        return this.parent && this.parent.layoutType || null;
    }

    get layoutType() {
        return this.schema.type;
    }

    get hasChildren() {
        return this.layouts.size > 0;
    }

    // 是否可以对 layouts 进行动态 增删
    get isDynamicLayoutType() { // 可变数组 , wrappers LayoutGroup
        if (this.isGroupItem) {
            return false; // 暂不支持嵌套 array、map
        }
        return this.schema.isDynamicType || false;
    }

    get isGroup() {
        return this.isRoot || this.hasChildren || this.isDynamicLayoutType;
    }

    get isGroupItem() {
        return this.parent && this.parent.isDynamicLayoutType || false;
    }

    get visiblable() {
        return this._visiblable;
    }

    get value() {
        if (this._valueCache !== undefined) {
            return this._valueCache;
        }
        this._valueCache = this.valueFunc();
        return this._valueCache;
    }

    get key() {
        return this.schema.key;
    }

    get keyPath() {
        return this.getKeyPath();
    }

    private _clearvalueCache() {
        this._valueCache = undefined;
    }

    private initLayouts() {
        // 通过 schema 创建层级
        const subLayouts = this.createSubLayouts();
        subLayouts.forEach(layout => {
            this.layouts.add(layout);
            layout.created();
        });
    }

    private createSubLayouts() {
        const layouts = this.schema.layouts;
        if (!Array.isArray(layouts)) {
            return [];
        }
        const level = this.level || 0;
        const currLevel = level + 1;

        // 当 type = array || map 这里应该是数据驱动
        if (this.isDynamicLayoutType) {
            const array = this.data; // 当前数据
            if (Array.isArray(array)) {
                return array.map((item, index) => {
                    const schema = Object.assign({}, this.schema.schema);
                    return this.createSubLayout(schema, index, currLevel);
                });
            }
            return [];
        }
        return layouts.map((item, index) => {
            const currIndex = this.isGroupItem ? index : this.index;
            return this.createSubLayout(item, currIndex, currLevel);
        });
    }

    private createSubLayout(schema: any, index = 0, level = 0) {
        const ctx = this.ctx;
        const layout = new Layout(ctx, {
            schema,
            parent: this,
            index,
            level,
        });
        return layout;
    }

    private renderChildrens(createElement: Function) {
        const childrens = this.layoutArray.map(layout => {
            return layout.render(createElement);
        }).filter(layout => !!layout);
        return childrens;
    }

    private valueFunc() {
        // 判断是否 visible
        if (!this.visiblable) {
            return {};
        }
        if (this.isRoot) {
            return this.layoutArray.reduce((obj, layout) => {
                return Object.assign(obj, layout.value);
            }, {});
        }
        if (this.isGroupItem) {
            // ZAP: 是否 传递空参数，如：{} || []
            if (this.layoutType === MAP_KEY) { // 对 map 特殊处理
                // { key:'', value:'' }
                return arrayToMapForData(this.layoutArray.map(layout => {
                    return layout.value;
                }));
            }
            return this.layoutArray.reduce((obj, layout) => {
                return Object.assign(obj, layout.value);
            }, {});
        }
        const key = this.schema.key;
        if (!key) return this.data;
        if (this.isGroup) {
            if (this.isDynamicLayoutType && this.layoutType === ARRAY_KEY) {
                return {
                    [key]: this.layoutArray.map(layout => {
                        return layout.value;
                    }),
                };
            }
            return {
                [key]: this.layoutArray.reduce((obj, layout) => {
                    return Object.assign(obj, layout.value);
                }, {}),
            };
        }
        return {
            [key]: this.data,
        };
    }

    private visiblableFunc() {
        const schema = this.schema;
        if (schema.visible === false) {
            return false;
        }
        if (schema.invisible === true) {
            return false;
        }
        if (!helper.isEmpty(schema.visible) && helper.isPlainObject(schema.visible)) {
            const schemaVisible = <object>schema.visible;
            if (!Object.keys(schemaVisible).some(key => {
                const value = schemaVisible[key];
                return this.visiblableItemFunc(key, value);
            })) {
                return false;
            }
        }
        if (!helper.isEmpty(schema.invisible) && helper.isPlainObject(schema.invisible)) {
            const schemaInvisible = <object>schema.invisible;
            if (Object.keys(schemaInvisible).some(key => {
                const value = schemaInvisible[key];
                return this.visiblableItemFunc(key, value);
            })) {
                return false;
            }
        }
        return true;
    }

    private visiblableItemFunc(key: string, value: string | any[]) {
        if (Array.isArray(value)) { // key、value反转
            if (value[0] === 'this' && this.parent) {
                const parentData = this.parent.data;
                return String(helper.get(parentData, value.slice(1))) === String(key);
            }
            // 处理 value
            const rootData = this.ctx.data;
            return String(helper.get(rootData, value)) === String(key);
        }
        if (key.startsWith('this.') && this.parent) {
            const parentData = this.parent.data;
            const _key = key.replace(/^this\./, '');
            return helper.get(parentData, _key) === value;
        }
        const rootData = this.ctx.data;
        return helper.get(rootData, key) === value;
    }

    private validateDataFunc(data: any): Promise<any> {
        return this.validator.validate(data).then(result => {
            const validationResult = {
                data,
                result,
                isValid: true,
            };
            this.dispatch(EVENT_NAME.VALIDATE, validationResult);
        }).catch(error => {
            const validationResult = {
                data,
                result: error,
                message: error.message,
                isValid: false,
            };
            this.dispatch(EVENT_NAME.VALIDATE, validationResult);
        });
    }

    // 整条链路的key组成path
    getKeyPath(separator: string = '.') {
        const key = this.key;
        const p = [ key ];
        let parent = this.parent;
        while (parent) {
            if (parent.key) {
                p.unshift(parent.key);
            }
            parent = parent.parent;
        }
        return p.join(separator);
    }

    validate(): Promise<any> {
        // TODO 验证数据
        if (this.isGroup || this.isGroupItem) {
            return this.layoutArray.reduce((chain, layout) => {
                return chain.then(() => layout.validate());
            }, Promise.resolve());
        }
        return this.validator.validate(this.data);
    }

    // alias
    setData(value: any) {
        this.data = value;
    }

    // @private method
    created() {
        // 以下顺序不可变
        this.initLayouts(); // 初始化子组件
        this._data = this.data; // initData
        this._initialized = true;
        this.ctx.created(this); // 注册 layout
        return this;
    }

    // @private method
    destroy() {
        this.ctx.destroy(this);
        // 销毁数据
        if (this.parent) {
            if (this.isGroupItem) {
                const index = this.index;
                this.parent.data.splice(index, 1);
            } else {
                const key = this.schema.key;
                delete this.parent.data[key];
            }
            this.parent._clearvalueCache();
        }
        this._clearvalueCache();

        const validationResult = {
            isValid: true,
        };
        this.dispatch(EVENT_NAME.VALIDATE, validationResult);
    }

    toJSON() {
        return {
            visiblable: this.visiblable,
            data: this.data,
            isGroup: this.isGroup,
            isGroupItem: this.isGroupItem,
            isDynamicLayoutType: this.isDynamicLayoutType,
            layouts: this.hasChildren ? this.layoutArray : undefined,
        };
    }

    addChildLayout(index?: number) {
        if (!this.isDynamicLayoutType) {
            console.warn('[Warn]', 'Not Support addChildLayout...');
            return;
        }
        const layouts = this.layouts;
        let nextIndex = layouts.size;
        if (helper.isNumber(index) && index < nextIndex) {
            nextIndex = index;
            // 之后所有layout index + 1；
            this.layoutArray.forEach(layout => {
                if (layout.index >= nextIndex) {
                    layout.index = layout.index + 1;
                }
            });
        }
        const nextLevel = this.level + 1;
        const schema = Object.assign({}, this.schema.subItemSchema);
        const layout = this.createSubLayout(schema, nextIndex, nextLevel);
        if (layout) {
            this.layouts.add(layout);
            layout.created();
            layout.forceUpdate();
        }
        return layout;
    }

    // remove self
    remove() {
        return this.parent?.removeChildLayout(this.index);
    }

    removeChildLayout(index: number) {
        if (!this.isDynamicLayoutType) {
            console.warn('[Warn]', 'Not Support removeChildLayout...');
            return;
        }
        let layout: Layout | undefined;
        // 之后所有layout index + 1；
        this.layoutArray.forEach(item => {
            if (item.index === index) {
                layout = item;
            }
            if (item.index > index) {
                item.index = item.index - 1;
            }
        });
        if (layout) {
            this.layouts.delete(layout);
            layout.destroy();
            layout.forceUpdate();
        }
        return layout;
    }

    // 需要实现 hook.render()
    render(createElement: Function) {
        this._clearvalueCache();
        this._visiblable = this.visiblableFunc();
        // 判断是否 visible
        if (!this.visiblable) {
            return null;
        }
        const childrens = this.renderChildrens(createElement);
        return this.ctx._$render(createElement, this, childrens);
    }

    forceUpdate() { // 需要实现 hook.update()
        return this.ctx._$forceUpdate(this);
    }
}
