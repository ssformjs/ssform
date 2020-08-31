import { IContext, IRule } from '../Interface';
import helper from './helper';
import { ORIGNAL_SCHEMA_KEY, IMMUTABLE_SCHEMA_KEYS, DEFAULT_SCHEMA_GROUP_TYPE, DYNAMIC_LAYOUT_TYPES, MAP_KEY } from './constants';


export default class Schema {

    ctx: IContext
    [ORIGNAL_SCHEMA_KEY]: any

    isRoot: boolean = false

    name?: string
    alias?: string
    help?: string
    description?: string
    placeholder?: string
    default?: any

    invisible?: object | boolean | undefined
    visible?: object | boolean | undefined
    disabled?: object | boolean | undefined

    // options?: Array<any>
    rules?: Array<string|IRule>

    class?: string | Array<string>
    style? : object
    role? : string

    constructor(ctx: IContext, schema?: any | null) {
        this.ctx = ctx;
        if (schema) {
            // this.name = schema.name;
            // this.alias = schema.alias;
            // this.help = schema.help;
            // this.description = schema.description;
            // this.placeholder = schema.placeholder;
            // this.default = schema.default;
            Object.keys(schema).filter(key => {
                return !IMMUTABLE_SCHEMA_KEYS.includes(key);
            }).forEach(key => {
                this[key] = schema[key];
            });
            this[ORIGNAL_SCHEMA_KEY] = schema;
        } else {
            this.isRoot = true;
            this[ORIGNAL_SCHEMA_KEY] = ctx.schema;
        }
    }

    get schema() {
        return this[ORIGNAL_SCHEMA_KEY] || {};
    }

    get layouts(): Array<any> | null {
        return this.schema.layouts;
    }

    get key() {
        return this.schema.key;
    }

    get type() {
        return this.schema.type || DEFAULT_SCHEMA_GROUP_TYPE;
    }

    get isDynamicType() { // 可变数组类型
        const schemaLayouts = this.layouts; // 首先要存在 schema.layouts
        if (schemaLayouts && DYNAMIC_LAYOUT_TYPES.includes(this.type)) {
            if (this.type === MAP_KEY) { // 对 map 特殊处理
                // layouts.key && layouts.value
                const keys = [ 'key', 'value' ];
                return schemaLayouts.length === 2
                    && schemaLayouts.every(item => keys.includes(item.key));
            }
            return true;
        }
        return false;
    }

    get options(): Array<any> {
        const options = this.schema.options;
        if (!Array.isArray(options)) {
            console.warn('[Schema] options must be array!', options);
            return [];
        }
        return options.map(item => {
            if (helper.isString(item)) {
                return { text: item, value: item };
            }
            return item;
        });
    }
}
