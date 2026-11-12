const test = require('tape');
const { parse, build } = require('../dist');

const A40 = '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD';

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

test('parse is case-insensitive on the scheme (RFC 3986 s3.1)', (t) => {
    const A = '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD';

    t.deepEqual(parse('Ethereum:' + A), {
        scheme: 'ethereum',
        target_address: A
    }, 'Accepts a mixed-case scheme');

    t.deepEqual(parse('ETHEREUM:' + A), {
        scheme: 'ethereum',
        target_address: A
    }, 'Accepts an upper-case scheme');

    t.deepEqual(parse('EtHeReUm:' + A), {
        scheme: 'ethereum',
        target_address: A
    }, 'Accepts an arbitrarily-cased scheme');

    t.deepEqual(parse('Ethereum:' + A + '@8453?value=1e16'), {
        scheme: 'ethereum',
        target_address: A,
        chain_id: '8453',
        parameters: { value: '10000000000000000' }
    }, 'Mixed-case scheme with chain + scientific-notation value');

    ['notanaethereum:', 'eth:', '', 'Ethereum:nothex'].forEach((bad) => {
        t.throws(() => parse(bad), 'Still rejects ' + JSON.stringify(bad));
    });

    t.deepEqual(parse('ethereum:' + A), {
        scheme: 'ethereum',
        target_address: A
    }, 'Mixed-case checksummed address is returned verbatim');

    t.end();
});

// ---------------------------------------------------------------------------
// Address length. ERC-681 requires exactly 40 hex digits after 0x.
//
// The defect this covers: `address_regex` was '(0x[\w]{40})' with no boundary
// assertion, and the tail of the pattern `\@?([\w]*)*` is greedy and accepts
// the same character class as the address body. So an over-length address did
// not fail -- digits 41..N were swallowed by the *chain_id* group. The address
// was silently truncated to its first 40 digits AND a bogus chain_id appeared.
//
// A single 42-digit sample only exercises one offset, so this sweeps 41..64.
// ---------------------------------------------------------------------------
test('address length is exactly 40 hex digits', (t) => {
    // Positive controls: these must keep working, so the test cannot be
    // satisfied by rejecting everything.
    t.deepEqual(parse('ethereum:' + A40), {
        scheme: 'ethereum',
        target_address: A40
    }, 'control: exactly 40 digits is accepted');

    t.deepEqual(parse('ethereum:' + A40 + '@42'), {
        scheme: 'ethereum',
        target_address: A40,
        chain_id: '42'
    }, 'control: 40 digits + real chain id still accepted');

    t.deepEqual(parse('ethereum:pay-' + A40 + '/transfer?address=0x12345&uint256=1'), {
        scheme: 'ethereum',
        prefix: 'pay',
        target_address: A40,
        function_name: 'transfer',
        parameters: { address: '0x12345', uint256: '1' }
    }, 'control: prefixed 40-digit address still accepted');

    // Negative sweep: 41..64 hex digits must throw, not truncate.
    let swept = 0;
    let truncated = 0;
    let corruptChain = 0;
    const truncatedExamples = [];

    for (let len = 41; len <= 64; len++) {
        const addr = '0x' + '1'.repeat(len);
        swept++;

        let parsed = null;
        let threw = false;
        try {
            parsed = parse('ethereum:' + addr);
        } catch (e) {
            threw = true;
        }

        if (!threw) {
            if (parsed.target_address === addr.substring(0, 42)) truncated++;
            if (parsed.chain_id) corruptChain++;
            if (truncatedExamples.length < 3) {
                truncatedExamples.push({
                    len: len,
                    target: parsed.target_address,
                    chain_id: parsed.chain_id
                });
            }
        }

        t.throws(() => parse('ethereum:' + addr), 'rejects ' + len + '-digit address');
        t.throws(
            () => parse('ethereum:' + addr + '@42'),
            'rejects ' + len + '-digit address with a chain id'
        );
    }

    t.equal(truncated, 0, 'no length in 41..64 is silently truncated to 40');
    t.equal(corruptChain, 0, 'no length in 41..64 leaks surplus digits into chain_id');
    t.equal(swept, 24, 'swept every length in 41..64 inclusive');

    if (truncatedExamples.length) {
        t.comment('truncation observed, e.g. ' + JSON.stringify(truncatedExamples[0]));
    }

    // The same class of bug via the token-contract parameter: `?address=` is
    // free-form here, so this documents current behaviour rather than
    // asserting a fix. If the project later validates parameters, this test
    // should be updated deliberately.
    t.comment('parameter address length is not validated by this library (documented, not asserted)');

    t.end();
});

test('over-length address must not be silently repaired', (t) => {
    // The dangerous shape: a 41-digit address where the 41st digit is a real
    // digit the sender typed. Truncating changes the payee.
    const overLong = '0x' + 'a'.repeat(40) + 'b';
    t.throws(
        () => parse('ethereum:' + overLong),
        'a 41-digit address throws instead of paying the 40-digit prefix'
    );

    // And the prefix must never be produced as a valid target for that input.
    let got = null;
    try {
        got = parse('ethereum:' + overLong);
    } catch (e) {
        got = null;
    }
    t.equal(got, null, 'no result object is produced for an over-length address');

    t.end();
});
