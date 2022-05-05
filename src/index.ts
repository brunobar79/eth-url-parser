'use strict';

import { BigNumber } from 'bignumber.js';
import qs from 'qs';

export type ETHAddress = string;
export type ENSName = string;

export type EIP681Object = {
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
export function parse(uri): EIP681Object {
    // Verify we are dealing with a string
    if (!uri || typeof uri !== 'string') {
        throw new Error('uri must be a string');
    }

    // Verify we are dealing with an ethereum link
    if (uri.slice(0, 9) !== 'ethereum:') {
        throw new Error('Not an Ethereum URI');
    }

    const prefix_regex = '(?<prefix>[a-zA-Z]+)-';
    const address_regex =
        '(?:0x[\\w]{40})|(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})';

    // Full regex for matching
    const full_regex = `^ethereum:(?:${prefix_regex})?(?<address>${address_regex})\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*`;

    const exp = new RegExp(full_regex);
    const data = uri.match(exp);

    if (!data) {
        throw new Error('Couldn not parse the url');
    }

    const _parameters = uri.split('?');

    const parameters = _parameters.length > 1 ? _parameters.at(1) : '';
    const parameters_ = qs.parse(parameters);

    const result: EIP681Object = {
        scheme: 'ethereum',
        target_address: data.groups.address,
    };

    if (data.groups.prefix) {
        result.prefix = data.groups.prefix;
    }

    if (data.at(3)) {
        result.chain_id = data.groups.chain_id as `${number}`;
    }

    if (data.at(4)) {
        result.function_name = data.groups.function_name;
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
}: EIP681Object): string {
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
