import Layout from './core/Layout';

export interface IEventHandler {
    dispatch: (eventName: string, ...values: any) => IEventHandler
    on: (eventName: string, handler: Function) => IEventHandler
    off: (eventName: string, handler: Function) => IEventHandler
    once: (eventName: string, handler: Function) => IEventHandler
}

export interface IContext extends IEventHandler {
    readonly hook: IHook | null;
    readonly schema: ISchema
    readonly layouts: Set<Layout> // 收集所有 layout
    readonly originalData: object // 源数据副本
    data: object

    version: string | undefined
    inject: object | undefined
    formatter: object | undefined

    [key: string]: any

    setHook: (hook: IHook) => void
}

export interface ISchema {
    layouts: Array<Layout>
    version?: string
    inject?: object
    formatter?: object
}

export interface ICurrentData {
    parent: Layout | null
    schema: object | null
    index?: number
    level?: number
}

export interface IRule {
    message: string,
    pattern: string,
    name?: string // pattern 或者 name
    flags?: string,
}

export interface IValidationRuleFunc {
    (value: any): Promise<any>,
}

export interface IValidationRule {
    key: string
    validate: (...variables: any) => IValidationRuleFunc
    variables?: any[]
    message? : string
}

export interface IValidationResult {
    isValid: boolean
    message?: string

    [key: string]: any
}

export interface ILifecycle {
    created: (layout?: Layout) => void
    destroy: (layout?: Layout) => void
}

export interface IHook {
    // 渲染dom函数
    render: (createElement: Function, layout: Layout, childrens: any[]) => any
    // 调用刷新UI操作
    update?: (layout: Layout) => void
    // 自定义校验规则解析
    validationRule?: (rule: string | object) => IValidationRule
}
