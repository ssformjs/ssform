import helper, { isRealEmpty } from '../helper';
import { FormatterOption, FormatParam } from './types';
import BaseParser from './BaseParser';

function _parseStringUnpack(val, form) {
    if (val.startsWith(FormatterOption.GET) && val.endsWith(FormatterOption.UNPACK)) {
        const result = helper.get(form, val.substring(1, val.length - 1));
        // if (helper.isUndefined(result) || helper.isNull(result) || helper.isNaN(result) || (helper.isString(result) && !result.length) || (Array.isArray(result) && !result.length)) {
        if (isRealEmpty(result)) {
            return undefined;
        }
        return val.substring(0, val.length - 1); // 去除 ？号
    }
    return val;
}

const ERROR_SYMBOL = Symbol('ERROR');
function _parseArrayUnpack(arrs, form) {
    return arrs.reduce((arrs, val) => { // 先过滤解包符号
        if (arrs.includes(ERROR_SYMBOL)) {
            return arrs;
        }
        const value = _parseStringUnpack(val, form);
        arrs.push(value === undefined ? ERROR_SYMBOL : value);
        return arrs;
    }, []).filter(val => { // 过滤失败的
        return val !== ERROR_SYMBOL;
    });
}

function _parseStringPlus(key, form) {
    const result = _parseArrayUnpack(key.split(FormatterOption.ADD), form)
        .map(val => {
            if (val.startsWith(FormatterOption.GET)) {
                return helper.get(form, val.substring(1));
            }
            return val;
        })
        .filter(item => !helper.isUndefined(item));
    return result.length ? result.join('') : undefined;
}

function _parseStringAt(val, form) { // 去除 @&
    const value = val.replace(new RegExp(`^${FormatterOption.MAP}`), '')
        .replace(new RegExp(`^${FormatterOption.GET}`), ''); // 去除 @
    const arrs = helper.get(form, value);
    if (Array.isArray(arrs) && arrs.length) {
        return arrs.reduce((obj, item) => {
            if (!helper.isUndefined(item.key)) { obj[item.key] = item.value; }
            return obj;
        }, {});
    }
    return undefined;
}

function _parseFunction(val, form) {
    const fnString = val.replace(new RegExp(`^${FormatterOption.FUNCTION}`), ''); // 去除 #
    // eslint-disable-next-line no-eval
    // const result = eval(`(function(data) { return ${fnString} })(${form}, ${dataKey}, ${key})`);
    // eslint-disable-next-line no-new-func
    const func = new Function('data', 'dataKey', 'key', fnString);
    const result = func(form);
    return result;
}

function _formatValueString(formatter, form) {
    console.info('针对性处理 string');
    if (formatter.startsWith(FormatterOption.FUNCTION)) { // Function
        return _parseFunction(formatter, form);
    } else if (formatter.startsWith(FormatterOption.MAP)) { // 把数组转换成 map
        return _parseStringAt(formatter, form); // 去除 @&
    } else if (formatter.includes(FormatterOption.ADD)) {
        return _parseStringPlus(formatter, form);
    } else if (formatter.startsWith(FormatterOption.GET)) { // 只要 & 开头的为取值
        const val = _parseStringUnpack(formatter, form); // 解包
        return val !== undefined && helper.get(form, val.substring(1));
    }
    return formatter;
}


export default class Format extends BaseParser {
    param: FormatParam;

    constructor(param: FormatParam) {
        super(param);
        this.param = param;
    }

    format(form: object) {
        form = helper.cloneDeep(form);
        const { formatter, callback = _format } = this.param;
        if (!formatter) {
            return form;
        }
        return callback(form, formatter);
    }
}

// 递归
function _format(form: object, formatter: object | string) {
    const result = {};
    if (helper.isPlainObject(formatter)) {
        const keys = Object.keys(formatter);
        keys.forEach(key => {
            const value = formatter[key];
            // 处理最终的 key 数据
            let dataKey = key;
            if (key.endsWith(FormatterOption.UNPACK)) { // 去除解包符号 ？
                dataKey = key.substring(0, key.length - 1);
            }

            if (key.includes(FormatterOption.ADD)) {
                dataKey = _parseStringPlus(dataKey, form);
            } else if (key.startsWith(FormatterOption.GET)) { // & 开头为自定义字段
                dataKey = helper.get(form, dataKey, null);
            }

            if (helper.isString(value)) {
                const val = _formatValueString(value, form);
                val !== undefined && (result[dataKey] = val);
                // if (value.startsWith(FormatterOption.FUNCTION)) { // Function
                //     const val = _parseFunction(value, form);
                //     val !== undefined && (result[dataKey] = val);
                // } else if (value.startsWith(FormatterOption.MAP)) { // 把数组转换成 map
                //     result[dataKey] = _parseStringAt(value, form); // 去除 @&
                // } else if (value.includes(FormatterOption.ADD)) {
                //     const val = _parseStringPlus(value, form);
                //     val !== undefined && (result[dataKey] = val);
                // } else if (value.startsWith(FormatterOption.GET)) { // 只要 & 开头的为取值
                //     const val = _parseStringUnpack(value, form); // 解包
                //     val !== undefined && (result[dataKey] = helper.get(form, val.substring(1)));
                // } else {
                //     result[dataKey] = value;
                // }
            } else if (helper.isPlainObject(value) || Array.isArray(value)) {
                result[dataKey] = _format(form, value);
            }

            if (key.endsWith(FormatterOption.UNPACK)) {
                // 对象特殊处理 unpack
                if (helper.isPlainObject(result[dataKey])) {
                    const obj = result[dataKey];
                    const r = Object.keys(obj).reduce((o, _key) => {
                        if (!helper.isUndefined(obj[_key])) {
                            o[_key] = obj[_key];
                        }
                        return o;
                    }, {});
                    result[dataKey] = helper.isEmpty(r) ? undefined : r;
                }
            }
        });
    } else if (Array.isArray(formatter)) {
        return formatter.map(val => _format(form, val));
    } else if (helper.isString(formatter)) { // 针对性处理
        return _formatValueString(formatter, form);
    }
    return result;
}
