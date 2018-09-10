/**
 * Parse an Ethereum URI according to ERC-831
 *
 * @param  {string} source URI string.
 *
 * @return {object}        Contains { prefix: string (default: `'pay'`), payload: string }
 */
export function parseURI(source) {
    if (!source || typeof source !== 'string') {
        throw new Error('Source must be a string');
    }

    if (source.substring(0, 9) !== 'ethereum:') {
        throw new Error('Not an Ethereum URI');
    }

    let prefix, payload;

    if (source.substring(9, 11) === '0x') {
        prefix = 'pay';
        payload = source.substring(9);
    } else {
        let cutOff = source.indexOf('-', 9);

        if (cutOff === -1) {
            throw new Error('Missing prefix');
        }

        prefix = source.substring(9, cutOff)
        payload = source.substring(cutOff + 1); // skip the dash
    }

    return { prefix, payload };
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
export function parseURL(source) {
    const { prefix, payload } = parseURI(source);

    if (!(prefix in HANDLERS)) {
        throw new Error(`Unknown prefix: ${prefix}`);
    }

    return HANDLERS[prefix](payload);
}

const HANDLERS = {
    'pay'(payload) {
        const cutoff = payload.search(/([@?\/]|$)/); // first of: `@`, `?`, `/`, EOF

        const address = payload.substring(0, cutoff);
        const remainder = payload.substring(cutoff).match(/^@([0-9]+)/);

        const chainId = remainder && remainder[1] ? Number(remainder[1]) || 1 : 1;

        return {
            prefix: 'pay',
            address,
            chainId
        };
    }
}
