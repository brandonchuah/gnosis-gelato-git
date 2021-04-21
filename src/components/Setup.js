import React, {useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
    Button, 
    Card, 
    Title, 
    Text,
    EthHashInfo,
    Loader,
    Divider,
    EtherscanButton
} from '@gnosis.pm/safe-react-components';

import {ethers} from 'ethers';

import {addresses} from '../config/address/addresses';
import { Task } from '@gelatonetwork/core';
const {abis} = require("../config/abi/abis");


const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


const Line = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;

  @media screen and (max-width: 768px) {
    display: block;
  }
`

const Centered = styled.main`
  position: fixed;
  top: 50%;
  left: 50%;
  /* bring your own prefixes */
  transform: translate(-50%, -50%);

`


const SAppContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 100vw;
  margin-top: 25px;

`

const TitleLine = styled.div`
  margin-right: 10px;
`

const Loading = styled.div`
  margin-right: 80px;
  margin-left: 160px;
`


export default function Setup({safe, sdk, ethBalance, provider, contracts, checkIsSetup, isSetUp}) {
    const [loading, setLoading] = useState(false);
 
  
    const provideGelatoFunds = async() => {
        const iFace = new ethers.utils.Interface(abis.gelatoCoreABI);
        const provideFundsData = iFace.encodeFunctionData("provideFunds", [safe.safeAddress])

        const txs = [
            {
                to: addresses.gelatoCore,
                value: ethers.utils.parseEther("1").toString(),
                data: provideFundsData
            }
        ]
        const params = {
            safeTxGas: 500000,
          };

        try{
            setLoading(true);
            const safeTxHash = await sdk.txs.send({txs, params});
            await wait(30000).then(() => {
                const tx = sdk.txs.getBySafeTxHash(safeTxHash);
                console.log('tx: ', tx);
                checkIsSetup(contracts);
            })

        }
        catch(error){
            setLoading(false);
            console.error(error);
        }
    }

    const firstSetup = async() => {
        const gnosisSafeContract = new ethers.Contract(
            safe.safeAddress,
            abis.iGnosisSafeABI,
            provider
        )
        const owners = await gnosisSafeContract.getOwners();
        console.log('owners: ', owners);


        const whitelistedModules = await gnosisSafeContract.getModules();
        console.log('whitelist: ', whitelistedModules);

        const iFaceGnosisSafe = new ethers.utils.Interface(abis.iGnosisSafeABI);
        const gnosisEnableModuleData = iFaceGnosisSafe.encodeFunctionData("enableModule",[
            addresses.gelatoCore
        ])
        const iFace = new ethers.utils.Interface(abis.gelatoCoreABI);
        const multiProvideData = iFace.encodeFunctionData("multiProvide", [
            addresses.gelatoExecutor, 
            [], 
            [addresses.gelatoProviderModule]]);

        const txs = [
            {
                to: safe.safeAddress,
                value: 0,
                data: gnosisEnableModuleData
            },
            {
                to: addresses.gelatoCore,
                value: ethers.utils.parseEther("0.5").toString(),
                // value: 0,
                data: multiProvideData
            }
        ]
        const params = {
            safeTxGas: 500000,
          };

        try{
            setLoading(true);
            const safeTxHash = await sdk.txs.send({txs, params});
            await wait(30000).then(() => {
                const tx = sdk.txs.getBySafeTxHash(safeTxHash);
                console.log('tx: ', tx);
                checkIsSetup(contracts);
            })

        }
        catch(error){
            setLoading(false);
            console.error(error);
        }
    }

    const onClickSetUp = async() => {
    
        const assignedExecutor = await contracts.gelatoCoreContract.executorByProvider(
            safe.safeAddress
        )
        console.log("assigned executor: ", assignedExecutor);

        const balanceOnGelato = await contracts.gelatoCoreContract.providerFunds(safe.safeAddress);
        console.log('balance on gelato: ', ethers.utils.formatEther(balanceOnGelato.toString()));
        console.log('balance on gelato: ', (balanceOnGelato.toString()));
        // console.log('need balance on gelato: ', ethers.utils.parseEther("0.5").toString())
        
        const isUserProxyModuleWhitelisted = await contracts.gelatoCoreContract.isModuleProvided(
            safe.safeAddress,
            addresses.gelatoProviderModule
        );
        console.log('user proxy whitelisted status: ', isUserProxyModuleWhitelisted);

        if(assignedExecutor === ZERO_ADDRESS && !isUserProxyModuleWhitelisted && balanceOnGelato < ethers.utils.parseEther("0.5")){
            console.log("first time setup")
            firstSetup();
        }
        else if(assignedExecutor === ZERO_ADDRESS && !isUserProxyModuleWhitelisted && balanceOnGelato > 0){
            console.log("fist time setup")
            firstSetup();
        }
        else{
            console.log("providing gelato funds")
            provideGelatoFunds();
        }
     
    }
   
    const onClickRemoveProvider = async() => {
        const iFace = new ethers.utils.Interface(abis.gelatoCoreABI);
        const removeProviderModulesData = iFace.encodeFunctionData("removeProviderModules", [
            [addresses.gelatoProviderModule]]);

        const providerAssignsExecutorData = iFace.encodeFunctionData("providerAssignsExecutor",[ZERO_ADDRESS])
        
        const txs = [
            {
                to: addresses.gelatoCore,
                value: 0,
                data: removeProviderModulesData
            },
            {
                to: addresses.gelatoCore,
                value: 0,
                data: providerAssignsExecutorData
            },
        ]
        const params = {
            safeTxGas: 500000,
          };

          try{
            setLoading(true);
            const safeTxHash = await sdk.txs.send({txs, params});
            await wait(30000).then(() => {
                const tx = sdk.txs.getBySafeTxHash(safeTxHash);
                console.log('tx: ', tx);
                checkIsSetup(contracts);
            });
           

        }
        catch(error){
            setLoading(false);
            console.error(error);
        }
    }

    async function wait(ms) {
        return new Promise(resolve => {
          setTimeout(resolve, ms);
        });
      }

    const checkState = async() => {
        const tx = await sdk.txs.getBySafeTxHash("0xb708212826bc7e9da0108e802829def000f5a629d9079f6a381c4bc3ac6f294b");
        const txR = await sdk.eth.getTransactionReceipt([
            '0xb708212826bc7e9da0108e802829def000f5a629d9079f6a381c4bc3ac6f294b',
          ]);
        console.log('txr: ', txR);
        console.log("HERHEHREHRHRHEHERHERH");
        console.log(tx);
        console.log("confirm",tx.isSuccessful)
    }

    return (
        <Centered>
        <SAppContainer>
            {/* <Title size="xs">Setup Page</Title> */}

            {/* <Button 
            size="lg" 
            color="primary" 
            iconType="settings" 
            variant="contained"
            // onClick={() => {checkIsSetup(contracts)}}
            onClick={checkState}
            >
            check
            </Button> */}

            <Divider/>
        
            <Card>
                <Text size="xl" color="primary">Gnosis Safe Address: </Text>
                <Line>
                    <TitleLine>
                <EthHashInfo textSize="lg" hash={safe.safeAddress} />
                    </TitleLine>
                <EtherscanButton value={safe.safeAddress} network="rinkeby"/>
                </Line>

                <Divider />
                
                <Line>
                    <TitleLine>
                        <Text size="xl" color="primary">ETH Balance:</Text>
                    </TitleLine>
                    <Text size="lg">{ethBalance}</Text>
                </Line>
               
               
                {
                loading ? (
                    <Line>
                    <Loading>
                      <Loader size="sm" />
                    </Loading>
                      <Button 
                      size="lg" 
                      color="secondary" 
                      iconType="resync" 
                      variant="bordered"
                      onClick={() => {checkIsSetup(contracts)}}
                      >
                      Refresh
                      </Button> 
                    </Line>

                ) : (
                    <Button 
                    size="lg" 
                    color="primary" 
                    iconType="settings" 
                    variant="contained"
                    onClick={onClickSetUp}
                    >
                    Complete Set-up
                    </Button>
                )}

                         

        </Card> 
      
           
        </SAppContainer>
        </Centered>
    )
}

// ===============for calling=================
// const iFace = new ethers.utils.Interface(abis.IERC20ABI);
// const data = iFace.encodeFunctionData("balanceOf", ["0x2F4dAcdD6613Dd2d41Ea0C578d7E666bbDAf3424"]);
// const txn = [
//     {
//       to: addresses.dai,
//       data: data
//     }
//   ];
//   console.log(sdk)
//   console.log(txn);
  
// const txResult = await sdk.eth.call(txn);

// console.log('call result: ',parseInt(txResult));
// ===============for sending=================
// const iFace = new ethers.utils.Interface(abis.IERC20ABI);
// const data = iFace.encodeFunctionData("transfer", ["0x2F4dAcdD6613Dd2d41Ea0C578d7E666bbDAf3424", ethers.BigNumber.from("1000000000000000000")])
//  const txs = [
//      {
//          to: addresses.dai,
//          value: 0,
//          data: data
//      }
//  ]
//  const params = {
//      safeTxGas: 500000,
//    };

//  const txn = await sdk.txs.send({txs, params});
//  console.log("sending transaction");
//  const tx = await sdk.txs.getBySafeTxHash(txs);
//  console.log("tx result: ", tx);
