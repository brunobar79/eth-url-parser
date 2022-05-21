import * as test from 'tape';

import { parse681 } from '../src/parse681';
import { parse2400 } from '../src/parse2400';
import { testParse681 } from './parse681.spec';
import { testParse2400 } from './parse2400.spec';
const { parse, build } = require('../dist');

test('parse681 from subfunction', testParse681(parse681));
test('parse681 from main', testParse681(parse));
test('parse2400 from subfunction', testParse2400(parse2400));
test('parse2400 from main', testParse2400(parse));

test('build', (t) => {
    t.equals(
        build({
            scheme: 'ethereum',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        }),
        'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        'Can build a URL with payload starting with `0x`'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        }),
        'ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        'Can build a URL with payload starting with `0x` and `pay` prefix'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            prefix: 'foo',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        }),
        'ethereum:foo-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        'Can build a URL with payload starting with `0x` and `foo` prefix'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            prefix: 'foo',
            target_address: 'doge-to-the-moon.eth',
        }),
        'ethereum:foo-doge-to-the-moon.eth',
        'Can build a URL with an ENS name'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            chain_id: '42',
        }),
        'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42',
        'Can build a URL with chain id'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            function_name: 'transfer',
            args: [
                ['address', '0x12345'],
                ['uint256', '1'],
            ],
        }),
        'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/transfer?address=0x12345&uint256=1',
        'Can build a URL for an ERC20 token transfer'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            parameters: {
                value: '2014000000000000000',
                gas: '10',
                gasLimit: '21000',
                gasPrice: '50',
            },
        }),
        'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=2.1e4&gasPrice=50',
        'Can build a url with value and gas parameters'
    );

    t.equals(
        build({
            scheme: 'ethereum',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            parameters: {
                value: '2014000000000000000',
                gas: 10,
                gasLimit: 21_000,
                gasPrice: 50,
            },
        }),
        'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=2.1e4&gasPrice=50',
        'Can build a url with value and gas parameters and incorrect type entry'
    );

    t.end();
});
