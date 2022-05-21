declare type ETHAddress = string;
declare type ENSName = string;
declare type SolidityType = string;
declare type EIP681Object = {
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
declare type EIP2400Object = {
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
        method: string;
        events: string;
    }>;
};
declare type EIP5094Object = {
    scheme: 'ethereum';
    prefix: 'networkadd';
    /**
     * Chain id of the chain that ought to be added to the users wallet.
     */
    chain_id?: `${number}`;
    /**
     * Named variables
     */
    parameters: {
        rpc_url: string | string[];
        chain_name: string;
    } & Partial<{
        name: string;
        symbol: string;
        decimals: number;
        explorer_url: string | string[];
        icon_url: string | string[];
    }>;
};
declare type ETHObject = EIP681Object | EIP2400Object | EIP5094Object;
declare const REGEX: {
    ethereum_regex: string;
    number_regex: RegExp;
    prefix_regex: string;
    address_regex: string;
    regex_generic: string;
    regex_681: string;
    regex_2400: string;
    regex_5094: string;
};
/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 *
 * @param  {string} uri string.
 *
 * @return {object}
 */
declare function parse(uri: string): ETHObject;
/**
 * Builds a valid Ethereum URI based on the initial parameters
 * @param  {object} data
 *
 * @return {string}
 */
declare function build(data: EIP681Object): string;

export { ETHAddress, ENSName, SolidityType, EIP681Object, EIP2400Object, EIP5094Object, ETHObject, REGEX, parse, build };
