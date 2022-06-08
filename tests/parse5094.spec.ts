import { Test } from 'tape';

import { EIP5094Object, ETHParserFunction } from '../src';

export const testParse5094 = (parse: ETHParserFunction) => {
    return (t: Test) => {
        t.deepEqual(
            parse(
                'ethereum:network-add@137/?chain_name=Polygon%20Mainnet&rpc_url=https%3A%2F%2Frpc-polygon.com&rpc_url=https%3A%2F%2Frpc-mainnet.matic.network&name=Matic&symbol=MATIC&decimals=18&explorer_url=https%3A%2F%2Fpolygonscan.com'
            ),
            {
                scheme: 'ethereum',
                prefix: 'networkadd',
                chain_id: '137',
                parameters: {
                    chain_name: 'Polygon Mainnet',
                    rpc_url: [
                        'https://rpc-polygon.com',
                        'https://rpc-mainnet.matic.network',
                    ],
                    name: 'Matic',
                    symbol: 'MATIC',
                    decimals: 18,
                    explorer_url: ['https://polygonscan.com'],
                },
            } as EIP5094Object,
            'Can parse matic mainnet url'
        );

        t.end();
    };
};
