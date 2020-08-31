// 可变数组
export const MAP_KEY = 'map';
export const ARRAY_KEY = 'array';
export const DYNAMIC_LAYOUT_TYPES = [
    ARRAY_KEY, MAP_KEY,
];

// for schema
export const ORIGNAL_SCHEMA_KEY = Symbol('ORIGNAL_SCHEMA_KEY');
export const IMMUTABLE_SCHEMA_KEYS = [
    'ctx', ORIGNAL_SCHEMA_KEY, 'isRoot',
    'schema', 'layouts', 'key', 'type',
    'options',
];
export const DEFAULT_SCHEMA_GROUP_TYPE = 'layouts';
