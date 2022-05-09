import { BigNumber } from 'bignumber.js';

export type ETHAddress = string;
export type ENSName = string;
export type SolidityType = string;
export const EIP681NamedParameters = ['value', 'gas', 'gasLimit', 'gasPrice'];

export type EIP681Object = {
    scheme: 'ethereum';
    prefix?: 'pay' | string;
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

/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 *
 * @param  {string} uri string.
 *
 * @return {object}
 */
export function parse(uri: string): EIP681Object {
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

    // Set a result object ready
    const result: EIP681Object = {
        scheme: 'ethereum',
        prefix: data.groups.prefix,
        target_address: data.groups.address,
        chain_id: data.groups.chain_id as `${number}`,
        function_name: data.groups.function_name,
    };

    // Set all the query magic
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

    // Destroy any undefined keys
    for (const key of Object.keys(result)) {
        if (result[key] === undefined) delete result[key];
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
