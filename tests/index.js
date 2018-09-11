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
    }, 'Can parse URI with an chain id');

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
/*
test('build', (t) => {
    t.equals(build({}), {
        prefix: 'pay',
        address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        chainId: 1
    }, 'Can parse URL with an address, implied prefix and implied chainId');

    t.deepEqual(build('ethereum:0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42'), {
        prefix: 'pay',
        address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        chainId: 42
    }, 'Can parse URL with an address, implied prefix and specified chainId');

    t.deepEqual(build('ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@42'), {
        prefix: 'pay',
        address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
        chainId: 42
    }, 'Can parse URL with an address, specified prefix and specified chainId');


    t.deepEqual(build('ethereum:pay-doge-to-the-moon.eth@42'), {
        prefix: 'pay',
        address: 'doge-to-the-moon.eth',
        chainId: 42
    }, 'Can parse URL with an ENS address, specified prefix and specified chainId');

    t.end();
});
*/