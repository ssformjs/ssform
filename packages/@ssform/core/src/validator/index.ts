import { IValidationRule, IValidationRuleFunc, IRule } from '../Interface';
import helper, { isRealEmpty } from '../helper';
import ruleConfigs from './rules';

const NOOP_KEY = '________NOOP_KEY________';
const RULES = new Map<string, IValidationRule>();

export class ValidationRule {
    readonly rule: IValidationRule
    readonly validate: IValidationRuleFunc
    message: string | undefined;

    constructor(rule: IValidationRule) {
        this.rule = rule;
        // 错误提示信息
        this.message = rule.message;
        this.validate = helper.isFunction(rule.validate)
            ? rule.validate(...this.variables)
            : () => Promise.resolve(true);
    }

    get isNoop(): boolean {
        return this.key === NOOP_KEY;
    }

    get variables(): any[] {
        return this.rule.variables || [];
    }

    get key(): string {
        return this.rule.key;
    }

    validator(data: any) {
        const validate = this.validate;
        const result = validate(data);
        return result;
    }

    // 创建一个校验实例
    public static create(rule: IValidationRule) {
        return new ValidationRule(rule);
    }
}

// 扩展
export function extend(rule: IValidationRule | IValidationRule[]) {
    if (isRealEmpty(rule)) {
        console.warn('rule is empty!');
        return;
    }
    if (Array.isArray(rule)) {
        rule.forEach(r => {
            RULES.set(r.key, r);
        });
    } else {
        RULES.set(rule.key, rule);
    }
}
// init
extend(ruleConfigs);

function createRegExp(pattern: string, flags = '', message = '请输入有效的格式'): IValidationRule {
    const regx = new RegExp(pattern, flags);
    return {
        key: pattern,
        validate: () => {
            return (value: any) => {
                return new Promise((resolve, reject) => {
                    if (!regx.test(value)) {
                        reject(new Error(message));
                        return;
                    }
                    resolve(value);
                });
            };
        },
    };
}

const noopValidationRule = { key: NOOP_KEY, validate: () => () => Promise.resolve(true) };

export default {
    get(key: string) {
        return RULES.get(key);
    },
    has(key: string) {
        return RULES.has(key);
    },
    get size() {
        return RULES.size;
    },
    createValidationRule(key: string | IRule, ...variables: any) {
        let rule: IValidationRule | undefined;
        let message: string | undefined; // TODO message 还没有解决
        if (helper.isString(key)) {
            rule = this.get(key);
            if (!rule) {
                rule = createRegExp(key);
            }
        } else { // IRule
            message = key.message;
            const flags = key.flags || '';
            if (key.pattern && helper.isString(key.pattern)) {
                const pattern = key.pattern;
                rule = createRegExp(pattern, flags, message);
            } else if (key.name && helper.isString(key.name)) {
                const name = key.name;
                rule = this.get(name);
            }
        }
        if (!rule) {
            // 没有匹配到规则
            return noopValidationRule;
        }
        Object.assign(rule, {
            variables,
            message,
        });
        return rule;
    },
};
