import { BigNumber } from 'bignumber.js';

export type ETHAddress = string;
export type ENSName = string;
export type SolodityType = string;
export const EIP681NamedParameters = ['value', 'gas', 'gasLimit', 'gasPrice'];

export type EIP681Object = {
    scheme: 'ethereum';
    prefix?: 'pay' | string;
    target_address: ETHAddress | ENSName;
    function_name?: string;
    chain_id?: `${number}`;
    /**
     * Named variables
     */
    parameters?: Partial<{
        value: `${number}`;
        gas: `${number}`;
        gasPrice: '${number}';
    }>;
    /**
     * Function Arguments
     */
    args?: [SolodityType, string][];
};

const number_regex =
    /^(?<major>[+-]?\d+)(?:\.(?<minor>\d+))?(?:[Ee](?<exponent>\d+))?$/;
const prefix_regex = '(?<prefix>[a-zA-Z]+)-';
const address_regex =
    '(?:0x[\\w]{40})|(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})';

// Full regex for matching
const full_regex = `^ethereum:(?:${prefix_regex})?(?<address>${address_regex})\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*(?<query>\\?.*)?`;

/**
 * Cleanup any unresolved values in the query parameters
 *
 * Converts '2.014e18' to '2014000000000000000'
 *
 * @param {string} variable string.
 * @param {string} value string.
 *
 * @return {string}
 */
function processValue(variable: string, value: string): string {
    const isReserved = EIP681NamedParameters.includes(variable);
    const isNumber = number_regex.test(value);

    if (isReserved && !isNumber)
        throw new Error(variable + ' needs to be a number');

    if (isNumber) {
        const match = value.match(number_regex).groups;

        value = new BigNumber(
            `${match.major}${match.minor ? '.' + match.minor : ''}${
                match.exponent ? 'e+' + match.exponent : ''
            }`,
            10
        ).toString();
    }

    return value;
}

function stringifyValue(variable: string, value: string): string {
    const isNumber = value.match(/^\d+$/); // Should really be the javascript version but ¯\_(ツ)_/¯ for now

    if (isNumber) {
        value = new BigNumber(value, 10)
            .toExponential()
            .replace('+', '')
            .replace(/e0$/, '')
            .replace(/e1$/, '0');
    }

    return value;
}

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

    const exp = new RegExp(full_regex);
    const data = uri.match(exp);

    if (!data) {
        throw new Error('Couldn not parse the url');
    }

    // Parse the query parameters
    const query = data.groups.query
        ? data.groups.query.slice(1).split('&')
        : [];

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

    if (query) {
        for (const queryEntry of query) {
            const variable_and_value = queryEntry.split('=');

            if (variable_and_value.length != 2)
                throw new Error(
                    'Query Parameter Malformat (' + queryEntry + ')'
                );

            const variable = variable_and_value.at(0);
            const value = processValue(variable, variable_and_value.at(1));

            if (EIP681NamedParameters.includes(variable)) {
                if (!result.parameters) result.parameters = {};

                result.parameters[variable] = value;
                continue;
            }

            if (!result.args) result.args = [];

            result.args.push([variable, value]);
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
export function build(data: EIP681Object): string {
    let query: string[] = [];

    console.log('args', data.args);

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
