const test = require('tape');
const { parse, build } = require('../dist');

test('parse', (t) => {
    t.deepEqual(parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'), {
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
    }, 'Can parse URI with payload starting with `0x`');

    t.deepEqual(parse('ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'), {
        scheme: 'ethereum',
        prefix: 'pay',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
    }, 'Can parse URI with payload starting with `0x` and `pay` prefix');

    t.deepEqual(parse('ethereum:foo-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'), {
        scheme: 'ethereum',
        prefix: 'foo',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
    }, 'Can parse URI with payload starting with `0x` and `foo` prefix');

    t.deepEqual(parse('ethereum:foo-doge-to-the-moon.eth'), {
        scheme: 'ethereum',
        prefix: 'foo',
        target_address: 'doge-to-the-moon.eth',
    }, 'Can parse URI with an ENS name');

    t.deepEqual(parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42'), {
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        chain_id: '42'
    }, 'Can parse URI with chain id');

    t.deepEqual(parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/transfer?address=0x12345&uint256=1'), {
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        function_name: 'transfer',
        parameters: {
            'address': '0x12345',
            'uint256': '1'
        }
    }, 'Can parse an ERC20 token transfer');

    t.deepEqual(parse('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50'), {
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        parameters: {
            'value': '2014000000000000000',
            'gas': '10',
            'gasLimit': '21000',
            'gasPrice': '50',
        }
    }, 'Can parse a url with value and gas parameters');

    t.end();
});

test('build', (t) => {
    t.equals(build({
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
    }), 'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
    'Can build a URL with payload starting with `0x`');

    t.equals(build({
        scheme: 'ethereum',
        prefix: 'pay',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
    }), 'ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
    'Can build a URL with payload starting with `0x` and `pay` prefix');

    t.equals(build({
        scheme: 'ethereum',
        prefix: 'foo',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
    }), 'ethereum:foo-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
    'Can build a URL with payload starting with `0x` and `foo` prefix');

    t.equals(build({
        scheme: 'ethereum',
        prefix: 'foo',
        target_address: 'doge-to-the-moon.eth',
    }), 'ethereum:foo-doge-to-the-moon.eth',
    'Can build a URL with an ENS name');

    t.equals(build({
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        chain_id: '42'
    }), 'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42',
    'Can build a URL with chain id');

    t.equals(build({
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        function_name: 'transfer',
        parameters: {
            'address': '0x12345',
            'uint256': '1'
        }
    }), 'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD/transfer?address=0x12345&uint256=1',
    'Can build a URL for an ERC20 token transfer');

    t.equals(build({
        scheme: 'ethereum',
        target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        parameters: {
            'value': '2014000000000000000',
            'gas': '10',
            'gasLimit': '21000',
            'gasPrice': '50',
        }
    }), 'ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD?value=2.014e18&gas=10&gasLimit=21000&gasPrice=50',
    'Can build a url with value and gas parameters');

    t.end();
});
