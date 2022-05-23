# eth-url-parser

[![npm](https://img.shields.io/npm/v/eth-url-parser.svg)](https://npmjs.com/package/eth-url-parser) [![npm](https://img.shields.io/npm/dm/eth-url-parser.svg)](https://npmjs.com/package/eth-url-parser) ![typescript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF) ![CircleCI branch](https://img.shields.io/circleci/project/github/brunobar79/eth-url-parser/master.svg)

Module that supports parsing / building of all the different ethereum standard urls: [ERC-681](https://eips.ethereum.org/EIPS/eip-681) and [ERC-831](https://eips.ethereum.org/EIPS/eip-831)

This module contains two functions which allows you to:

- [Parsing Ethereum URLs](#parsing-an-ethereum-url)
- [Building Ethereum URLs](#building-an-ethereum-url)

## TLDR;

Takes in a string of an Ethereum URL and returns an object matching that URL according to the previously mentioned standards
When given input such as:

```url
ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@1/mint?value=2.014e18&gas=4.5e4&gasPrice=50&uint256=1e3&uint256=1.234e3
```

The returned object looks like this:

```typescript
{
    scheme: 'ethereum',
    prefix: 'pay',
    target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD', // ENS names are also supported!
    chain_id: '1',
    function_name: 'mint',
    parameters: {
        'value': '2014000000000000000', // (in WEI)
        'gas': '45000', // can be also gasLimit
        'gasPrice': '50',
    },
    args: [
        ['uint256', '1000'],
        ['uint256', '1234'],
    ]
}
```

## Getting started

To get started simply add `eth-url-parser` to your `package.json` or run one of the following commands:

```sh
# NPM
npm install eth-url-parser --save
# Yarn
yarn add eth-url-parser
# PNPM
pnpm add eth-url-parser
```

And that's it! You are now ready to get started building and parsing Ethereum URLs.

## Usage

To get started import the package

```typescript
import { parse, build } from 'eth-url-parser';
```

### Parsing an Ethereum URL

Parsing an ethereum url can be done with the following code segment:

```typescript
import { parse, build } from 'eth-url-parser';

const parsedUrl = parse('ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@1/mint?value=2.014e18&gas=4.5e4&gasPrice=50&uint256=1e3&uint256=1.234e3');

console.log(parsedUrl.scheme); // 'ethereum'
console.log(parsedUrl.prefix); // 'pay'
console.log(parsedUrl.target_address); // '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
console.log(parsedUrl.chain_id); // '1'
console.log(parsedUrl.function_name); // 'mint'
console.log(parsedUrl.parameters.value); // '2014000000000000000'
console.log(parsedUrl.parameters.gas); // '45000'
console.log(parsedUrl.parameters.gasPrice); // '50'
console.log(parsedUrl.args[0]); // ['uint256', '1000']
console.log(parsedUrl.args[1]); // ['uint256', '1234']
```

The returned value stored in `parsedUrl` is typed using [EIP681Object](#eip681object) and would look as follows:

```typescript
{
    scheme: 'ethereum',
    prefix: 'pay',
    target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
    chain_id: '1',
    function_name: 'mint',
    parameters: {
        'value': '2014000000000000000',
        'gas': '45000',
        'gasPrice': '50',
    },
    args: [
        ['uint256', '1000'],
        ['uint256', '1234'],
    ]
}
```

## Building an Ethereum URL

Build an Ethereum URL takes in an object (of type [EIP681Object](#eip681object)) representing the different parts of the Ethereum URL and returns a string representing a valid Ethereum URL

```typescript
import { parse, build } from 'eth-url-parser';

const url = build({
    scheme: 'ethereum',
    prefix: 'pay',
    target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
});
            
console.log(url); // 'ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD'
```

The above method additionally allows for more complex URLs to be built such as but not limited to:

```typescript
import { parse, build } from 'eth-url-parser';

const url = build({
    scheme: 'ethereum',
    prefix: 'pay',
    target_address: '0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD',
    chain_id: '1',
    function_name: 'mint',
    parameters: {
        'value': '2014000000000000000',
        'gas': '45000',
        'gasPrice': '50',
    },
    args: [
        ['uint256', '1000'],
        ['uint256', '1234'],
    ]
});

console.log(url); // 'ethereum:pay-0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD@1/mint?value=2.014e18&gas=4.5e4&gasPrice=50&uint256=1e3&uint256=1.234e3'
```

## Types

### EIP681Object

An object representing a parsed/buildable Ethereum compatible URL

```typescript
export type EIP681Object = {
    scheme: 'ethereum';
    prefix?: 'pay' | string;
    target_address: ETHAddress | ENSName; // Target Address in the format `0x1234DEADBEEF5678ABCD1234DEADBEEF5678ABCD` or `doge-to-the-moon.eth`
    chain_id?: `${number}`; // The chain at which this action should be performed
    function_name?: string; // The function the user is aiming to execute
    parameters?: Partial<{
        value: `${number}`;
        gas: `${number}`;
        gasPrice: '${number}';
    }>;
    args?: [SolidityType, string][]; // Arguments to the function the user wishes to execute
};
```

## License

MIT

## Credits

This repo is an inspired combination of [erc681](https://github.com/parity-js/erc681) (by [@parity-js](https://github.com/parity-js)) and [eip681](https://github.com/tokenkit/eip681/) (by [tokenkit](https://github.com/tokenkit))
