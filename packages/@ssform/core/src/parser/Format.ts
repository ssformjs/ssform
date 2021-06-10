import helper, { isRealEmpty } from '../helper';
import { formatterOption, FormatParam } from './types';


function _parseStringUnpack(val, form) {
    if (val.startsWith(formatterOption.GET) && val.endsWith(formatterOption.UNPACK)) {
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
    const result = _parseArrayUnpack(key.split(formatterOption.ADD), form)
        .map(val => {
            if (val.startsWith(formatterOption.GET)) {
                return helper.get(form, val.substring(1));
            }
            return val;
        })
        .filter(item => !helper.isUndefined(item));
    return result.length ? result.join('') : undefined;
}

function _parseStringAt(val, form) {
    const value = val.replace(new RegExp(`^${formatterOption.MAP}`), '')
        .replace(new RegExp(`^${formatterOption.GET}`), ''); // 去除 @
    const arrs = helper.get(form, value);
    if (Array.isArray(arrs) && arrs.length) {
        return arrs.reduce((obj, item) => {
            if (!helper.isUndefined(item.key)) { obj[item.key] = item.value; }
            return obj;
        }, {});
    }
    return undefined;
}


export default class Format {
    param: FormatParam;

    constructor(param: FormatParam) {
        this.param = param;
    }

    format(form: object) {
        form = helper.cloneDeep(form);
        const { formatter } = this.param;
        if (!formatter) {
            return form;
        }
        return this._format(form, formatter);
    }

    private _format(form: object, formatter: object) {
        const result = {};
        if (helper.isPlainObject(formatter)) {
            Object.keys(formatter).forEach(key => {
                const value = formatter[key];
                if (key.includes(formatterOption.ADD)) {
                    if (key.endsWith(formatterOption.UNPACK)) { // 去除解包符号 ？
                        key = _parseStringPlus(key.substring(0, key.length - 1), form);
                    } else {
                        key = _parseStringPlus(key, form);
                    }
                } else if (key.startsWith(formatterOption.GET)) { // & 开头为自定义字段
                    if (key.endsWith(formatterOption.UNPACK)) { // 去除解包符号 ？
                        key = helper.get(form, key.substring(1, key.length - 1), null);
                    } else {
                        key = helper.get(form, key.substring(1), null);
                    }
                }

                // 处理最终的 key 数据
                let dataKey = key;
                if (key.endsWith(formatterOption.UNPACK)) { // 去除 ？号
                    dataKey = key.substring(0, key.length - 1);
                }

                if (helper.isString(value)) {
                    if (value.startsWith(formatterOption.MAP)) { // 把数组转换成 map
                        result[dataKey] = _parseStringAt(value, form);
                    } else if (value.includes(formatterOption.ADD)) {
                        const val = _parseStringPlus(value, form);
                        val !== undefined && (result[dataKey] = val);
                    } else if (value.startsWith(formatterOption.GET)) { // 只要 & 开头的为取值
                        const val = _parseStringUnpack(value, form); // 解包
                        val !== undefined && (result[dataKey] = helper.get(form, val.substring(1)));
                    } else {
                        result[dataKey] = value;
                    }
                } else if (helper.isPlainObject(value)) {
                    result[dataKey] = this._format(form, value);
                } else if (Array.isArray(value)) {
                    result[dataKey] = this._format(form, value);
                }

                if (key.endsWith(formatterOption.UNPACK)) {
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
            return formatter.map(val => this._format(form, val));
        }
        return result;
    }
}
