# eth-url-parser

Module that supports encoding / decoding of all the ethereum standard urls: [ERC-681](https://eips.ethereum.org/EIPS/eip-681) and [ERC-831](https://eips.ethereum.org/EIPS/eip-831)

This module contains two functions:

## `parse(string)`

Takes in a string of an Ethereum URL and returns an object matching that URL according to the previously mentioned standards

## `build(object)`

Takes in an object representing the different parts of the ethereum url and returns a string representing a valid ethereum url


# License

MIT

# Credits

This repo is a combination of [erc681](https://github.com/parity-js/erc681) (by [@parity-js](https://github.com/parity-js)) and [eip681](https://github.com/tokenkit/eip681/) (by [tokenkit](https://github.com/tokenkit))