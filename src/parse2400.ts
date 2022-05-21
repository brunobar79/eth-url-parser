import { EIP2400Object, REGEX } from '.';

export const parse2400 = (uri: string) => {
    const sixeightyone = new RegExp(REGEX.regex_2400);
    const data = uri.match(sixeightyone);

    if (!data) return;

    // Parse the query parameters
    // const query = data.groups.query
    //     ? data.groups.query.slice(1).split('&')
    //     : [];

    // Set a result object ready
    const result: EIP2400Object = {
        scheme: 'ethereum',
        prefix: 'tx',
        transaction_hash: '',
    };

    // Set all the query magic
    // if (query) {
    //     for (const queryEntry of query) {
    //         const variable_and_value = queryEntry.split('=');

    //         if (variable_and_value.length != 2)
    //             throw new Error(
    //                 'Query Parameter Malformat (' + queryEntry + ')'
    //             );

    //         const variable = variable_and_value.at(0);
    //         const value = processValue(variable, variable_and_value.at(1));

    //         if (EIP681NamedParameters.includes(variable)) {
    //             if (!result.parameters) result.parameters = {};

    //             result.parameters[variable] = value;
    //             continue;
    //         }

    //         if (!result.args) result.args = [];

    //         result.args.push([variable, value]);
    //     }
    // }

    // // Destroy any undefined keys
    // for (const key of Object.keys(result)) {
    //     if (result[key] === undefined) delete result[key];
    // }

    return result;
};