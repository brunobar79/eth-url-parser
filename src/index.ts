'use strict';

import { BigNumber } from 'bignumber.js';
import qs from 'qs';

export type ETHAddress = string;
export type ENSName = string;

export type ParseResult = {
    scheme: 'ethereum';
    prefix?: 'pay' | string;
    target_address: ETHAddress | ENSName;
    function_name?: string;
    chain_id?: `${number}`;
    parameters?: Partial<{
        value: `${number}`;
        gas: `${number}`;
        gasPrice: '${number}';
    }>;
};

/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 *
 * @param  {string} uri string.
 *
 * @return {object}
 */
export function parse(uri): ParseResult {
    // Verify we are dealing with a string
    if (!uri || typeof uri !== 'string') {
        throw new Error('uri must be a string');
    }

    // Verify we are dealing with an ethereum link
    if (uri.slice(0, 9) !== 'ethereum:') {
        throw new Error('Not an Ethereum URI');
    }

    let prefix;
    let address_regex = '0x[\\w]{40}';

    // Figure out wether we need address of ens matching
    if (uri.slice(9, 11).toLowerCase() === '0x') {
        prefix = undefined;
    } else {
        const cutOff = uri.indexOf('-', 9);

        if (cutOff === -1) {
            throw new Error('Missing prefix');
        }

        prefix = uri.slice(9, cutOff);
        const rest = uri.slice(Math.max(0, cutOff + 1));

        // Adapting the regex if ENS name detected
        if (rest.slice(0, 2).toLowerCase() !== '0x') {
            address_regex =
                '[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,}';
        }
    }

    // Full regex for matching
    const full_regex = `^ethereum:(${prefix}-)?(${address_regex})\\@?([\\w]*)*\\/?([\\w]*)*`;

    const exp = new RegExp(full_regex);
    const data = uri.match(exp);

    if (!data) {
        throw new Error('Couldn not parse the url');
    }

    const _parameters = uri.split('?');

    const parameters = _parameters.length > 1 ? _parameters.at(1) : '';
    const parameters_ = qs.parse(parameters);

    const result: ParseResult = {
        scheme: 'ethereum',
        target_address: data.at(2),
    };

    if (prefix) {
        result.prefix = prefix;
    }

    if (data.at(3)) {
        result.chain_id = data.at(3) as `${number}`;
    }

    if (data.at(4)) {
        result.function_name = data.at(4);
    }

    if (Object.keys(parameters_).length > 0) {
        result.parameters = parameters_;
        const amountKey =
            result.function_name === 'transfer' ? 'uint256' : 'value';

        if (result.parameters[amountKey]) {
            result.parameters[amountKey] = new BigNumber(
                result.parameters[amountKey],
                10
            ).toString();

            if (
                !Number.isFinite(
                    Number.parseInt(result.parameters[amountKey])
                ) ||
                result.parameters[amountKey] < 0
            )
                throw new Error(
                    'Invalid amount ' + result.parameters[amountKey]
                );
        }
    }

    return result;
}

/**
 * Builds a valid Ethereum URI based on the initial parameters
 * @param  {object} data
 *
 * @return {string}
 */
export function build({
    prefix,
    target_address,
    chain_id,
    function_name,
    parameters,
}: ParseResult): string {
    let query;

    if (parameters) {
        const amountKey = function_name === 'transfer' ? 'uint256' : 'value';

        if (parameters[amountKey]) {
            // This is weird. Scientific notation in JS is usually 2.014e+18
            // but the EIP 681 shows no "+" sign ¯\_(ツ)_/¯
            // source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-681.md#semantics
            parameters[amountKey] = new BigNumber(parameters[amountKey], 10)
                .toExponential()
                .replace('+', '')
                .replace('e0', '');

            if (
                !Number.isFinite(Number.parseInt(parameters[amountKey])) ||
                parameters[amountKey] < 0
            )
                throw new Error('Invalid amount');
        }

        query = qs.stringify(parameters);
    }

    return `ethereum:${prefix ? prefix + '-' : ''}${target_address}${
        chain_id ? '@' + chain_id : ''
    }${function_name ? '/' + function_name : ''}${query ? '?' + query : ''}`;
}
