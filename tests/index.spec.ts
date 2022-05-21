import * as test from 'tape';
const { parse, build } = require('../dist');

test('parse', (t) => {
    t.deepEqual(
        parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        },
        'Can parse URI with payload starting with `0x`'
    );

    t.deepEqual(
        parse('ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        },
        'Can parse URI with payload starting with `0x` and `pay` prefix'
    );

    // t.deepEqual(
    //     parse('ethereum:foo-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'),
    //     {
    //         scheme: 'ethereum',
    //         prefix: 'foo',
    //         target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
    //     },
    //     'Can parse URI with payload starting with `0x` and `foo` prefix'
    // );

    t.deepEqual(
        parse('ethereum:pay-doge-to-the-moon.eth'),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: 'doge-to-the-moon.eth',
        },
        'Can parse URI with an ENS name'
    );

    t.deepEqual(
        parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42'),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            chain_id: '42',
        },
        'Can parse URI with chain id'
    );

    t.deepEqual(
        parse(
            'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/transfer?address=0x12345&uint256=1'
        ),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            function_name: 'transfer',
            args: [
                ['address', '0x12345'],
                ['uint256', '1'],
            ],
        },
        'Can parse an ERC20 token transfer'
    );

    t.deepEqual(
        parse(
            'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50'
        ),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            parameters: {
                value: '2014000000000000000',
                gas: '10',
                gasLimit: '21000',
                gasPrice: '50',
            },
        },
        'Can parse a url with value and gas parameters'
    );

    t.deepEqual(
        parse(
            'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/test?value=1&gas=10&gasLimit=21000&gasPrice=50&uint256=-2.014e18'
        ),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            function_name: 'test',
            parameters: {
                value: '1',
                gas: '10',
                gasLimit: '21000',
                gasPrice: '50',
            },
            args: [['uint256', '-2014000000000000000']],
        },
        'Can parse a url with negative value and gas parameters'
    );

    t.deepEqual(
        parse(
            'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/custom_function?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50'
        ),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            function_name: 'custom_function',
            parameters: {
                value: '2014000000000000000',
                gas: '10',
                gasLimit: '21000',
                gasPrice: '50',
            },
        },
        'Can parse a url with function name, value, and gas parameters'
    );

    t.deepEqual(
        parse(
            'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/custom_function?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50&uint8=1&uint256=2'
        ),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            function_name: 'custom_function',
            parameters: {
                value: '2014000000000000000',
                gas: '10',
                gasLimit: '21000',
                gasPrice: '50',
            },
            args: [
                ['uint8', '1'],
                ['uint256', '2'],
            ],
        },
        'Can parse a url with function name, value, gas parameters, and function parameters'
    );

    t.deepEqual(
        parse(
            'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/custom_function?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50&uint256=1&uint256=2'
        ),
        {
            scheme: 'ethereum',
            prefix: 'pay',
            target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
            function_name: 'custom_function',
            parameters: {
                value: '2014000000000000000',
                gas: '10',
                gasLimit: '21000',
                gasPrice: '50',
            },
            args: [
                ['uint256', '1'],
                ['uint256', '2'],
            ],
        },
        'Can parse a url with function name, value, gas parameters, and overlapping type function parameters'
    );

    t.end();
});

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
