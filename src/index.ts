import { BigNumber } from 'bignumber.js';

import { parse681 } from './parse681';
import { parse2400 } from './parse2400';
import { parse5094 } from './parse5094';

export type ETHAddress = string;
export type ENSName = string;
export type SolidityType = string;

export type EIP681Object = {
    scheme: 'ethereum';
    prefix?: 'pay';
    /**
     * Target Address in the format `0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD` or `doge-to-the-moon.eth`
     */
    target_address: ETHAddress | ENSName;
    /**
     * The chain at which this action should be performed
     * If undefined assume the current user's chain.
     */
    chain_id?: `${number}`;
    /**
     * The function the user is aiming to execute
     */
    function_name?: string;
    /**
     * Named variables
     */
    parameters?: Partial<{
        value: `${number}`;
        gas: `${number}`;
        gasPrice: `${number}`;
    }>;
    /**
     * Function Arguments
     * These arguments are fed to the function that is to be executed
     */
    args?: [SolidityType, string][];
};

export type EIP2400Object = {
    scheme: 'ethereum';
    prefix: 'tx';
    /**
     * Transaction Hash in the format `0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD`
     */
    transaction_hash: ETHAddress;
    /**
     * The chain at which this action should be performed
     * If undefined assume the current user's chain.
     */
    chain_id?: `${number}`;
    /**
     * Named variables
     */
    parameters?: Partial<{
        method: string; // not 100% sure what these types are
        events: string; // not 100% sure what these types are
    }>;
};

export type EIP5094Object = {
    scheme: 'ethereum';
    prefix: 'networkadd';
    /**
     * Chain id of the chain that ought to be added to the users wallet.
     */
    chain_id: `${number}`;
    /**
     * Named variables
     */
    parameters: {
        rpc_url: string[];
        chain_name: string;
    } & Partial<{
        name: string;
        symbol: string;
        decimals: number;
        explorer_url: string[];
        icon_url: string[];
    }>;
};

export type ETHObject = EIP681Object | EIP2400Object | EIP5094Object;

const ethereum_regex = '^ethereum:';
const number_regex =
    /^(?<major>[+-]?\d+)(?:\.(?<minor>\d+))?(?:[Ee](?<exponent>\d+))?$/;
const prefix_regex = '(?<prefix>[a-zA-Z]+)-';
const address_regex =
    '(?:0x[\\w]{40})|(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})';
const txaddress_regex = '0x[\\w]{64}';

// Full regex for matching
const regex_generic = '${ethereum_regex}(?:${prefix_regex})'; // Check if it matches eip-831 aka "An ethereum URL"
const regex_681 = `${ethereum_regex}(?:pay-)?(?<address>${address_regex})\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*(?<query>\\?.*)?`;
const regex_2400 = `${ethereum_regex}tx-(?<address>${txaddress_regex})\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*(?<query>\\?.*)?`;
const regex_5094 = `${ethereum_regex}network-add\\@?(?<chain_id>[\\w]*)*\\/?(?<query>\\?.*)?`;

export const REGEX = {
    ethereum_regex,
    number_regex,
    prefix_regex,
    address_regex,
    txaddress_regex,
    regex_generic,
    regex_681,
    regex_2400,
    regex_5094,
};

/**
 * Cleanup any unresolved values in the query parameters
 *
 * Converts '2014000000000000000' to '2.014e18'
 *
 * @param {string} variable string.
 * @param {string} value string.
 *
 * @return {string}
 */
function stringifyValue(variable: string, value: string): string {
    const isNumber = !Number.isNaN(value) && !value.toString().startsWith('0x');

    if (isNumber) {
        value = new BigNumber(value, 10)
            .toExponential()
            .replace('+', '')
            .replace(/e0$/, '')
            .replace(/e1$/, '0');
    }

    return value;
}

export type ETHParserFunction = (_uri: string) => ETHObject | undefined;
const supported_specs: ETHParserFunction[] = [parse2400, parse5094, parse681];

/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 *
 * @param  {string} uri string.
 *
 * @return {object}
 */
export const parse: ETHParserFunction = (uri) => {
    // Verify we are dealing with a string
    if (!uri || typeof uri !== 'string') {
        throw new Error('uri must be a string');
    }

    // Verify we are dealing with an ethereum link
    if (uri.slice(0, 9) !== 'ethereum:') {
        throw new Error('Not an Ethereum URI');
    }

    // Figure out what spec this is, and have it parse it!
    for (const parseFunc of supported_specs) {
        const result = parseFunc(uri);

        if (result) return result;
    }

    // const twentyfourhundred = new RegExp(regex_2400);
    // const twentyfourhundred_match = uri.match(twentyfourhundred);
    // if (twentyfourhundred_match) {

    //     return;
    // }

    // const fiftyninetyfour = new RegExp(regex_5094);
    // const fiftyninetyfour_match = uri.match(fiftyninetyfour);

    // if (fiftyninetyfour_match) {

    //     return;
    // }

    throw new Error('Unknown Ethereum Standard');
};

/**
 * Builds a valid Ethereum URI based on the initial parameters
 * @param  {object} data
 *
 * @return {string}
 */
export function build(data: EIP681Object): string {
    let query: string[] = [];

    const queryParameters = []
        .concat(
            Object.keys(data.parameters || {}).map((key) => [
                key,
                data.parameters[key],
            ]),
            data.args
        )
        .filter((value) => !!value);

    query = queryParameters.map(
        (data) =>
            `${data.at(0)}=${encodeURIComponent(
                stringifyValue(data.at(0), data.at(1))
            )}`
    );

    return `ethereum:${data.prefix ? data.prefix + '-' : ''}${
        data.target_address
    }${data.chain_id ? '@' + data.chain_id : ''}${
        data.function_name ? '/' + data.function_name : ''
    }${query.length > 0 ? '?' + query.join('&') : ''}`;
}
