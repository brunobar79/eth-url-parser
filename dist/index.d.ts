declare type ETHAddress = string;
declare type ENSName = string;
declare type SolidityType = string;
declare const EIP681NamedParameters: string[];
declare type EIP681Object = {
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
/**
 * Parse an Ethereum URI according to ERC-831 and ERC-681
 *
 * @param  {string} uri string.
 *
 * @return {object}
 */
declare function parse(uri: string): EIP681Object;
/**
 * Builds a valid Ethereum URI based on the initial parameters
 * @param  {object} data
 *
 * @return {string}
 */
declare function build(data: EIP681Object): string;

export { ETHAddress, ENSName, SolidityType, EIP681NamedParameters, EIP681Object, parse, build };
