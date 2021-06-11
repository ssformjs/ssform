
export const FormatterOption = {
    ADD: '+', // 连接
    GET: '&', // 取值
    MAP: '@', // map 拉平
    UNPACK: '?', // 解包，判断 null, undefined, "", []
    FUNCTION: '#', // function() {}
};

export interface BaseParam {
    formatter: object | string | undefined,
}
export interface ParserParam extends BaseParam {
    callback?: (form: object, formatter: object | string) => object
}
export interface FormatParam extends BaseParam {
    callback?: (form: object, formatter: object | string) => object
}
