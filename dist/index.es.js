/**
 * Parse an Ethereum URI according to ERC-831
 *
 * @param  {string} source URI string.
 *
 * @return {object}        Contains { prefix: string (default: `'pay'`), payload: string }
 */
function parseURI(source) {
    if (!source || typeof source !== 'string') {
        throw new Error('Source must be a string');
    }

    if (source.substring(0, 9) !== 'ethereum:') {
        throw new Error('Not an Ethereum URI');
    }

    var prefix = void 0,
        payload = void 0;

    if (source.substring(9, 11) === '0x') {
        prefix = 'pay';
        payload = source.substring(9);
    } else {
        var cutOff = source.indexOf('-', 9);

        if (cutOff === -1) {
            throw new Error('Missing prefix');
        }

        prefix = source.substring(9, cutOff);
        payload = source.substring(cutOff + 1); // skip the dash
    }

    return { prefix: prefix, payload: payload };
}

/**
 * Parse an Ethereum URL according to ERC-681
 *
 * @param  {string} source URL string.
 *
 * @return {object}        Contains different members depending on extracted prefix:
 *                         * `pay` (default) => { prefix: `'pay'`, address: string, chainId: number (default: `1`) }
 *
 */
function parseURL(source) {
    var _parseURI = parseURI(source),
        prefix = _parseURI.prefix,
        payload = _parseURI.payload;

    if (!(prefix in HANDLERS)) {
        throw new Error('Unknown prefix: ' + prefix);
    }

    return HANDLERS[prefix](payload);
}

var HANDLERS = {
    'pay': function pay(payload) {
        var cutoff = payload.search(/([@?\/]|$)/); // first of: `@`, `?`, `/`, EOF

        var address = payload.substring(0, cutoff);
        var remainder = payload.substring(cutoff).match(/^@([0-9]+)/);

        var chainId = remainder && remainder[1] ? Number(remainder[1]) || 1 : 1;

        return {
            prefix: 'pay',
            address: address,
            chainId: chainId
        };
    }
};

export { parseURI, parseURL };
