// index.test.ts

import { FormSchema } from '../src';
import schemaTestData from './schemaTestData';

/**
   * test Schema
   */
describe('validate:', () => {

    it('testSchema', () => {
        const form = new FormSchema(schemaTestData, {
            kind: 'circuit-breaker',
            response: {
                // headers: [
                //     {
                //         key: 'k1',
                //         value: 'v1',
                //     },
                //     {
                //         key: 'k2',
                //         value: 'v2',
                //     },
                // ],
                headers: {
                    k1: 'v1',
                    k2: 'v2',
                },
                code: '22',
                body: '222',
            },
            config: {
                average_response_time: '12',
                error_percent_threshold: '12',
                consecutive_slow_requests: '222',
                breakType: [
                    'ErrorPercentCircuitbreaker',
                    'RTCircuitbreaker',
                ],
                min_request_amount: '22',
                lookback_duration: '2',
                break_duration: '22',
            },
        }, {
            render: (h, layout, childrens) => {
                console.log('render...');
                const level = layout.level;
                console.log('--> level:', level);
                console.log('--> childrens:', childrens.length);
                return null;
            },
        });

        const h = () => {

        };
        form.render(h);
        console.log('[Value]\n', JSON.stringify(form.formatValue, null, 2));
        // console.log('[JSON]\n', JSON.stringify(form, null, 2));
        expect(form.layout.parent).toStrictEqual(null);
        // console.log('[FormatValue]\n', JSON.stringify(form.formatValue, null, 2));
    });

});
