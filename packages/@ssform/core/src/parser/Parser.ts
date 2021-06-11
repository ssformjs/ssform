import helper from '../helper';
import { FormatterOption, ParserParam } from './types';
import BaseParser from './BaseParser';

export default class Parser extends BaseParser {
    param: ParserParam;

    constructor(param: ParserParam) {
        super(param);
        this.param = param;
    }

    parser(form: object) {
        form = helper.cloneDeep(form);
        const { formatter, callback = _parser } = this.param;
        if (!formatter) {
            return form;
        }
        return callback(form, formatter);
    }
}

// data 属于当前阶段的数据
function _parser(form: object, formatter: object | string, data = form) {
    if (helper.isPlainObject(formatter)) {
        const keys = Object.keys(formatter);
        keys.forEach(key => {
            // { '&a+b': 'xxxx' }
            if (key.startsWith(FormatterOption.GET) || key.includes(FormatterOption.ADD)) { // 放弃 & | + 字段
                return; // next
            }

            const value = formatter[key];
            // 处理最终的 key 数据
            let dataKey = key;
            // { 'key?': 'xxxx' }
            if (key.endsWith(FormatterOption.UNPACK)) { // 去除 ？号
                dataKey = key.substring(0, key.length - 1);
            }

            if (helper.isString(value)) {
                // Function
                if (value.startsWith(FormatterOption.FUNCTION)) { // Function 无法解析
                    return; // next
                } else if (value.includes(FormatterOption.ADD)) { // 放弃 + 字段
                    // value.split(FormatterOption.ADD).forEach(val => helper.set(form, val, data[key]));
                    return; // next
                } else if (value.startsWith(FormatterOption.GET)) { // 只要 & 开头的为取值
                    if (value.endsWith(FormatterOption.UNPACK)) {
                        const _vKey = value.substring(1, value.length - 1);
                        !helper.isUndefined(data[dataKey]) && helper.set(form, _vKey, data[dataKey]);
                    } else {
                        const _vKey = value.substring(1);
                        helper.set(form, _vKey, data[dataKey]);
                    }
                } else if (value.startsWith(FormatterOption.MAP) && helper.isPlainObject(data[dataKey])) { // 解析 map
                    const _vKey = value.substring(1);
                    helper.set(form, _vKey, Object.keys(data[dataKey]).map(_key => {
                        return { key: _key, value: data[dataKey][_key] };
                    }));
                }
            } else if (helper.isPlainObject(value) || Array.isArray(value)) {
                _parser(form, value, data[dataKey]);
            }
        });
    } else if (Array.isArray(formatter)) {
        formatter.forEach((val, i) => _parser(form, val, data[i]));
    }
    return form;
}
