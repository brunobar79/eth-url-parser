'use strict'

import qs from 'qs';
import { BigNumber } from 'bignumber.js';

/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 *
 * @param  {string} uri string.
 *
 * @return {object}
 */
export function parse(uri) {

    if (!uri || typeof uri !== 'string') {
        throw new Error('uri must be a string');
    }

    // RFC 3986 s3.1: URI schemes are case-insensitive. `Ethereum:` and
    // `ETHEREUM:` denote the same scheme as `ethereum:`. The strict
    // comparison here rejected them as "Not an Ethereum URI".
    if (uri.substring(0, 9).toLowerCase() !== 'ethereum:') {
        throw new Error('Not an Ethereum URI');
    }

    let prefix;
    // ERC-681: a hex address is `0x` followed by exactly 40 hex digits.
    //
    // This used to be '(0x[\\w]{40})' with no boundary assertion. Two bugs
    // followed from that:
    //   1. [\\w] is wider than hex -- it also matches '_' and 'g'..'z', so
    //      'ethereum:0x<40 hex>zzz' parsed as an address.
    //   2. The group had no right-hand boundary, and the tail of the pattern
    //      below (`\\@?([\\w]*)*`) accepts the same character class. So an
    //      over-length address did not fail: digits 41..N were absorbed by
    //      the *chain_id* group. The address was silently truncated to its
    //      first 40 digits and a bogus chain_id appeared alongside it --
    //      'ethereum:0x' + '1'.repeat(41) yielded target_address
    //      '0x111...1' (40 digits) with chain_id '1'.
    //
    // Truncating an address is a payee change, not a cosmetic error, so the
    // lookahead below makes an over-length address fail to match. It is
    // zero-width, so capture-group numbering (and therefore data[2]) is
    // unchanged.
    let address_regex = '(0x[0-9a-fA-F]{40})(?![0-9a-fA-F])';


    if (uri.substring(9, 11).toLowerCase() === '0x') {
        prefix = null;
    } else {
        let cutOff = uri.indexOf('-', 9);

        if (cutOff === -1) {
            throw new Error('Missing prefix');
        }
        prefix = uri.substring(9, cutOff);
        const rest = uri.substring(cutOff + 1);

        // Adapting the regex if ENS name detected
        if(rest.substring(0,2).toLowerCase() !== '0x'){
            address_regex = '([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,})';
        }
    }

    const full_regex = '^ethereum:(' + prefix + '-)?'+address_regex + '\\@?([\\w]*)*\\/?([\\w]*)*';

    // 'i' so the literal 'ethereum:' prefix inside the pattern matches
    // regardless of case. Without this, lowercasing only the guard above
    // merely shifts the failure to 'Couldn not parse the url'.
    // The address group stays case-sensitive: mixed case is an EIP-55
    // checksum claim and re-casing it would change the payee.
    const exp = new RegExp(full_regex, 'i');
    const data = uri.match(exp);
    if(!data) {
        throw new Error('Couldn not parse the url');
    }

    let parameters = uri.split('?');
    parameters = parameters.length > 1 ? parameters[1] : '';
    const params = qs.parse(parameters);

    const obj = {
        scheme: 'ethereum',
        target_address: data[2],
    };

    if(prefix){
        obj.prefix = prefix;
    }

    if(data[3]){
        obj.chain_id = data[3];
    }

    if(data[4]){
        obj.function_name = data[4];
    }

    if(Object.keys(params).length){
        obj.parameters = params;
        const amountKey = obj.function_name === 'transfer' ? 'uint256' : 'value';

        if(obj.parameters[amountKey]) {
            obj.parameters[amountKey] = new BigNumber(obj.parameters[amountKey], 10).toString();
            if (!isFinite(obj.parameters[amountKey])) throw new Error('Invalid amount')
            if (obj.parameters[amountKey] < 0) throw new Error('Invalid amount')
        }
    }

    return obj;
}

/**
 * Builds a valid Ethereum URI based on the initial parameters
 * @param  {object} data
 *
 * @return {string}
 */
export function build({ prefix = null, target_address, chain_id = null, function_name = null, parameters = null }) {

    let query = null;
    if(parameters) {
        const amountKey = function_name === 'transfer' ? 'uint256' : 'value';
        if(parameters[amountKey]){
            // This is weird. Scientific notation in JS is usually 2.014e+18
            // but the EIP 681 shows no "+" sign ¯\_(ツ)_/¯
            // source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md#semantics
            parameters[amountKey] = new BigNumber(parameters[amountKey], 10).toExponential().replace('+','').replace('e0','');
            if (!isFinite(parameters[amountKey])) throw new Error('Invalid amount');
            if (parameters[amountKey] < 0) throw new Error('Invalid amount');
        }
        query = qs.stringify(parameters);
    }

    const url = `ethereum:${prefix?prefix+'-':''}${target_address}${chain_id ? `@${chain_id}` : ''}${function_name ? `/${function_name}`:''}${query ? '?' + query : ''}`;
    return url;
}
