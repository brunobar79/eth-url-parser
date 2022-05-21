import { Test } from 'tape';

import { EIP2400Object, ETHParserFunction } from '../src';

export const testParse2400 = (parse: ETHParserFunction) => {
    return (t: Test) => {
        t.deepEqual(
            parse(
                'ethereum:tx-0x4465e7cce3c784f264301bfe26fc17609855305213ec74c716c7561154b76fec'
            ),
            {
                scheme: 'ethereum',
                prefix: 'tx',
                transaction_hash:
                    '0x4465e7cce3c784f264301bfe26fc17609855305213ec74c716c7561154b76fec',
            } as EIP2400Object,
            'Can parse URI with payload starting with `0x`'
        );

        t.deepEqual(
            parse(
                'ethereum:tx-0x4465e7cce3c784f264301bfe26fc17609855305213ec74c716c7561154b76fec@1?method=issueAndActivateBounty(address%2Cuint256%2Cstring%2Cuint256%2Caddress%2Cbool%2Caddress%2Cuint256)&events=Transfer(!address%2C!address%2Cuint256)%3BBountyIssued(uint256)%3BContributionAdded(uint256%2C!address%2Cuint256)%3BBountyActivated(uint256%2Caddress)'
            ),
            {
                scheme: 'ethereum',
                prefix: 'tx',
                transaction_hash:
                    '0x4465e7cce3c784f264301bfe26fc17609855305213ec74c716c7561154b76fec',
                chain_id: '1',
                parameters: {
                    method: 'issueAndActivateBounty(address,uint256,string,uint256,address,bool,address,uint256)',
                    events: 'Transfer(!address,!address,uint256);BountyIssued(uint256);ContributionAdded(uint256,!address,uint256);BountyActivated(uint256,address)',
                },
            } as EIP2400Object,
            'Can parse URI with payload'
        );

        t.end();
    };
};
