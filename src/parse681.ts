import BigNumber from 'bignumber.js';

import { EIP681Object, ETHParserFunction, REGEX } from '.';

export const EIP681NamedParameters = ['value', 'gas', 'gasLimit', 'gasPrice'];

export const parse681: ETHParserFunction = (uri) => {
    const sixeightyone = new RegExp(REGEX.regex_681);
    const data = uri.match(sixeightyone);

    if (!data) return;

    // Parse the query parameters
    const query = data.groups.query
        ? data.groups.query.slice(1).split('&')
        : [];

    // Set a result object ready
    const result: EIP681Object = {
        scheme: 'ethereum',
        prefix: 'pay',
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
            const value = processEIP681Value(
                variable,
                variable_and_value.at(1)
            );

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
};

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
function processEIP681Value(variable: string, value: string): string {
    const isReserved = EIP681NamedParameters.includes(variable);
    const isNumber = REGEX.number_regex.test(value);

    if (isReserved && !isNumber)
        throw new Error(variable + ' needs to be a number');

    if (isNumber) {
        const match = value.match(REGEX.number_regex).groups;

        value = new BigNumber(
            `${match.major}${match.minor ? '.' + match.minor : ''}${
                match.exponent ? 'e+' + match.exponent : ''
            }`,
            10
        ).toString();
    }

    return value;
}
