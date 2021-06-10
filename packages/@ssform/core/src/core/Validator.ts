import { IContext } from '../Interface';
import Layout from './Layout';
import { ValidationRule } from '../validator';

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
            const vr = this.ctx.validationRuleHook(rule);
            return ValidationRule.create(vr);
        }).filter(rule => !rule.isNoop);
    }

    validate(data: any): Promise<any> {
        const rules = this.rules;
        if (!rules.length) {
            return Promise.resolve(true);
        }
        // TODO validator 通过分析 data 的数据类型，判断是数组还是单项
        return rules.reduce((chain, rule) => { // 串型判断
            return chain.then(() => rule.validator(data));
        }, Promise.resolve());
    }
}
