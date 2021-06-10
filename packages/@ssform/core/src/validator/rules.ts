// import validator from 'validator';
import helper, { isRealEmpty } from '../helper';

const rules = {
    Required: () => {
        const message = '不能为空';
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (isRealEmpty(value)) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    MaxLength: (variable: any) => {
        const len = parseInt(variable);
        const message = `不可超过${len}个字符`;
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (value && value.length > len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    MinLength: (variable: any) => {
        const len = parseInt(variable);
        const message = `不可少于${len}个字符`;
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (value && value.length < len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    ArrayMaxLength: (variable: any) => {
        const len = parseInt(variable);
        const message = `最多只可添加${len}个值`;
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (value && Array.isArray(value) && value.length > len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    ArrayMinLength: (variable: any) => {
        const len = parseInt(variable);
        const message = `最少必须添加${len}个值`;
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (value && Array.isArray(value) && value.length < len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    Number: (variable: any) => {
        const len = isRealEmpty(variable) ? null : parseInt(variable);
        let message = '请输入有效的数字';
        const regex = new RegExp('^(([1-9]{1}\\d*)|(0{1}))$');
        if (helper.isNumber(len)) {
            message = `请输入有效的数字, 且最多${len}位`;
        }
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (helper.isNumber(len)) {
                    if (!helper.isNil(value) && String(value).length > len) {
                        reject(new Error(message));
                        return;
                    }
                }
                if (!helper.isNil(value) && !regex.test(value)) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    MaxNumber: (variable: any) => {
        const len = parseInt(variable);
        const message = `不可以大于${len}`;
        return (value: any) => {
            const num = parseInt(value);
            return new Promise((resolve, reject) => {
                if (helper.isNumber(num) && num > len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    MinNumber: (variable: any) => {
        const len = parseInt(variable);
        const message = `不可以小于${len}`;
        return (value: any) => {
            const num = parseInt(value);
            return new Promise((resolve, reject) => {
                if (helper.isNumber(num) && num < len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    FloatNumber: (variable: any) => {
        const len = isRealEmpty(variable) ? null : parseInt(variable);
        let message = '请输入有效的数字';
        let regex = new RegExp('^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,})?$');
        if (helper.isNumber(len)) {
            message = `请输入有效的数字, 且最多${len}位小数`;
            regex = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,${len}})?$`);
        }
        return (value: any) => {
            return new Promise((resolve, reject) => {
                if (helper.isNil(value) || !regex.test(value)) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    MaxFloatNumber: (variable: any) => {
        const len = parseFloat(variable);
        const message = `不可以大于${len}`;
        return (value: any) => {
            const num = parseFloat(value);
            return new Promise((resolve, reject) => {
                if (helper.isNumber(num) && num > len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
    MinFloatNumber: (variable: any) => {
        const len = parseFloat(variable);
        const message = `不可以小于${len}`;
        return (value: any) => {
            const num = parseFloat(value);
            return new Promise((resolve, reject) => {
                if (helper.isNumber(num) && num < len) {
                    reject(new Error(message));
                    return;
                }
                resolve(value);
            });
        };
    },
};

export default Object.keys(rules).map(key => {
    return {
        key,
        validate: rules[key],
    };
});
