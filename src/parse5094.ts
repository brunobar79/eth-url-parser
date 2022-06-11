import { EIP5094Object, ETHParserFunction, REGEX } from '.';

export const EIP5094NamedParameters = [
    'chain_name',
    'name',
    'symbol',
    'decimals',
];

export const EIP5094NamedListParameters = [
    'rpc_url',
    'explorer_url',
    'icon_url',
];

export const parse5094: ETHParserFunction = (uri) => {
    const sixeightyone = new RegExp(REGEX.regex_5094);
    const data = uri.match(sixeightyone);

    if (!data) return;

    // Parse the query parameters
    const query = data.groups.query
        ? data.groups.query.slice(1).split('&')
        : [];

    // Set a result object ready
    const result: EIP5094Object = {
        scheme: 'ethereum',
        prefix: 'networkadd',
        chain_id: data.groups.chain_id as `${number}`,
        parameters: {
            chain_name: undefined,
            rpc_url: undefined,
        },
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
            const value = decodeURIComponent(variable_and_value.at(1));

            if (EIP5094NamedParameters.includes(variable)) {
                if (variable == 'decimals') {
                    result.parameters[variable] = Number.parseInt(value);
                    continue;
                }

                result.parameters[variable] = value;
                continue;
            }

            if (EIP5094NamedListParameters.includes(variable)) {
                if (!result.parameters[variable])
                    result.parameters[variable] = [];

                result.parameters[variable].push(value);
            }
        }
    }

    if (!result.parameters.chain_name)
        throw new Error('EIP-5094: Missing chain_name');

    if (!result.parameters.rpc_url)
        throw new Error('EIP-5094: Missing rpc_url');

    // Destroy any undefined keys
    for (const key of Object.keys(result)) {
        if (result[key] === undefined) delete result[key];
    }

    return result;
};
