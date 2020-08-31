import { IContext } from '../Interface';
import Layout from './Layout';
import validator, { ValidationRule } from '../validator';
import helper from './helper';

// 验证器
// ZAP: 联动校验?，比如：字段B的值必须大于等于字段A的值
// ZAP: 层级与层级之间的字段有联动校验，比如第二阶梯的字段A的值要大于第一阶梯字段B的值
export default class Validator {

    readonly ctx: IContext
    readonly layout: Layout;
    readonly rules: ValidationRule[];

    constructor(ctx: IContext, layout: Layout) {
        this.ctx = ctx;
        this.layout = layout;

        this.rules = this.initRules();
    }

    get schema() {
        return this.layout.schema;
    }

    private initRules(): ValidationRule[] {
        const rules = this.schema.rules;
        if (!rules || !Array.isArray(rules) || !rules.length) {
            return [];
        }
        return rules.map(rule => {
            // rule 可能是一个对象
            if (helper.isString(rule)) {
                const key = rule.replace(/\([\w|\d|\\.]+\)/g, ''); // 可增强
                const params = rule.replace(key, '').replace('(', '').replace(')', '');
                const variables = params.split(',').map(param => param.trim());
                return validator.create(key, ...variables);
            }
            return validator.create(rule);
        }).filter(rule => !rule.isNoop);
    }

    validate(data: any): Promise<any> {
        const rules = this.rules;
        if (!rules.length) {
            return Promise.resolve(true);
        }
        // 通过
        // TODO validator 通过分析 data 的数据类型，判断是数组还是单项
        return rules.reduce((chain, rule) => { // 串型判断
            // if (Array.isArray(data)) { // 不再处理数据类型，规则中区分数据类型
            //     return data.reduce((_c, item) => {
            //         return _c.then(() => rule.validator(item));
            //     }, chain);
            // }
            return chain.then(() => rule.validator(data));
        }, Promise.resolve());
    }
}
