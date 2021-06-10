
export const formatterOption = {
    ADD: '+', // 连接
    GET: '&', // 取值
    MAP: '@', // map 拉平
    UNPACK: '?', // 解包，判断 null, undefined, "", []
};

export interface BaseParam {
    formatter: object | undefined,
}
export interface ParserParam extends BaseParam {
}
export interface FormatParam extends BaseParam {
}
