import helper from './helper';
import { formatterOption } from './types';

// ZAP: 待优化
export default function parser(form: object, formatter: object | undefined, data = form) {
    if (!formatter) {
        return data;
    }
    if (helper.isPlainObject(formatter)) {
        Object.keys(formatter).forEach(key => {
            if (key.startsWith(formatterOption.GET) || key.includes(formatterOption.ADD)) { // 放弃 & | + 字段
                return; // next
            }

            // 处理最终的 key 数据
            let dataKey = key;
            if (key.endsWith(formatterOption.UNPACK)) { // 去除 ？号
                dataKey = key.substring(0, key.length - 1);
            }

            const value = formatter[key];
            if (helper.isString(value)) {
                if (value.includes(formatterOption.ADD)) { // 放弃 + 字段
                // value.split(formatterOption.ADD).forEach(val => helper.set(form, val, data[key]));
                } else if (value.startsWith(formatterOption.GET)) { // 只要 & 开头的为取值
                    if (value.endsWith(formatterOption.UNPACK)) {
                        !helper.isUndefined(data[dataKey]) && helper.set(form, value.substring(1, value.length - 1), data[dataKey]);
                    } else {
                        !helper.isUndefined(data[dataKey]) && helper.set(form, value.substring(1), data[dataKey]);
                    }
                } else if (value.startsWith(formatterOption.MAP) && helper.isPlainObject(data[dataKey])) { // 解析 map
                    helper.set(form, value.substring(1), Object.keys(data[dataKey]).map(_key => {
                        return { key: _key, value: data[dataKey][_key] };
                    }));
                }
            } else if (helper.isPlainObject(value)) {
                parser(form, value, data[dataKey]);
            } else if (Array.isArray(value)) {
                parser(form, value, data[dataKey]);
            }
        });
    } else if (Array.isArray(formatter)) {
        formatter.forEach((val, i) => parser(form, val, data[i]));
    }
    return form;
}
