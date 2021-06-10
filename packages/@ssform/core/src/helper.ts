import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';
import isNumber from 'lodash/isNumber';
import merge from 'lodash/merge';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';
import _isNaN from 'lodash/isNaN';
import isBuffer from 'lodash/isBuffer';
import isArrayLike from 'lodash/isArrayLike';
import isArguments from 'lodash/isArguments';
import isTypedArray from 'lodash/isTypedArray';
import isMap from 'lodash/isMap';
import isSet from 'lodash/isSet';

// 随机数
export function randomID(length = 6) {
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
}

export function mapToArrayForData(map: any) {
    if (isPlainObject(map)) {
        return Object.keys(map).map(key => {
            return { key, value: map[key] };
        });
    }
    return [];
}
export function arrayToMapForData(array: any[]) {
    const map = array.reduce((obj, item) => {
        return Object.assign(obj, item);
    }, {});
    if (isString(map.key) && map.key.length) { // 只接受 key 为 string 且不为空
        return {
            [map.key]: map.value,
        };
    }
    return {};
}

export function isRealEmpty(value: any): boolean {
    if (isNil(value)) {
        return true;
    }
    if (isArrayLike(value) && (Array.isArray(value)
        || typeof value === 'string'
        || typeof value.splice === 'function'
        || isBuffer(value)
        || isTypedArray(value)
        || isArguments(value))
    ) {
        return !value.length;
    }
    if (isMap(value) || isSet(value)) {
        return !value.size;
    }
    if (isNumber(value)) {
        return _isNaN(value);
    }
    return isEmpty(value);
}

export default {
    isPlainObject,
    isEmpty,
    isString,
    isUndefined,
    isNull,
    get,
    cloneDeep,
    set,
    isNumber,
    merge,
    isFunction,
    isNaN: _isNaN,
    isNil,
    isBuffer,
    isTypedArray,
    isArguments,
    isArrayLike,
    isMap, isSet,
    pickBy,
};
