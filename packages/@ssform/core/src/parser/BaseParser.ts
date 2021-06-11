import { BaseParam } from './types';

export default class BaseParser {
    param: BaseParam;

    constructor(param: BaseParam) {
        this.param = param;
    }
}
