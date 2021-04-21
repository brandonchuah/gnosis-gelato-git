import React, { useCallback, useState, useEffect } from 'react';
import {ethers} from 'ethers';
import styled from 'styled-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

import { Button, Loader, Title, Layout } from '@gnosis.pm/safe-react-components';
import Setup from './components/Setup';
import Trade from './components/Trade';
import Loading from './components/Loading';
import getContracts from './helpers/getContracts';
import {addresses} from './config/address/addresses';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
//"homepage": "./"

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const SAppContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 100vw;
`

const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();
  const [submitting, setSubmitting] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();

  const [contracts, setContracts] = useState<Object>();
  const [ethBalance, setEthBalance] = useState("");

  useEffect(() => {
    getBalance();
    getProvider();
   
  }, [isSetup]);

  const checkIsSetup = async(contractsObj: { uniswapV2Contract?: ethers.Contract; gelatoUserProxyFactoryContract?: ethers.Contract; gelatoProviderContract?: ethers.Contract; gelatoCoreContract: any; proxyContract?: ethers.Contract; conditionUniswapV2RateStatefulContract?: ethers.Contract; conditionUniswapV2RateContract?: ethers.Contract; gelatoSysAdminContract?: ethers.Contract; daiContract?: ethers.Contract; wethContract?: ethers.Contract; }) => {
    const info = await sdk.getSafeInfo();
    const address = info.safeAddress;

    const assignedExecutor = await contractsObj.gelatoCoreContract.executorByProvider(
        address
    )
    console.log("assigned executor: ", assignedExecutor);

    const balanceOnGelato = await contractsObj.gelatoCoreContract.providerFunds(address);
    console.log('balance on gelato: ', ethers.utils.formatEther(balanceOnGelato.toString()));
    
    const isUserProxyModuleWhitelisted = await contractsObj.gelatoCoreContract.isModuleProvided(
        address,
        addresses.gelatoProviderModule
    );
    console.log('user proxy whitelisted status: ', isUserProxyModuleWhitelisted);

    if(assignedExecutor != ZERO_ADDRESS && isUserProxyModuleWhitelisted && balanceOnGelato > ethers.utils.parseEther("0.1"))
        setIsSetup(true);
    setLoading(false);
}

  const setUpContracts = async(ethProvider: ethers.providers.JsonRpcProvider) => {
    const contractsObj =  getContracts(ethProvider);
    setContracts(contractsObj);
    await checkIsSetup(contractsObj);
  }

  const getProvider = () => {
    const ethProvider = new ethers.providers.JsonRpcProvider( "https://rinkeby.infura.io/v3/8aa85020fddd4d75bc65b6fbebea2eb6", "rinkeby");
    console.log(ethProvider);
    setProvider(ethProvider);
    setUpContracts(ethProvider);
    // console.log("hello");
    // console.log(ethProvider);
  }

  const getBalance = async() =>{
    const info = await sdk.getSafeInfo();
    const address = info.safeAddress;
    const res = await sdk.eth.getBalance([address]);
    const balance = ethers.utils.formatEther(ethers.BigNumber.from(res))
    setEthBalance(balance);
}

if (loading === true){
  return <Loading/>
}
else if(isSetup){
  return (
    <SAppContainer>
      <Trade
        sdk={sdk}
        safe={safe}
        contracts={contracts}
        provider={provider}
      />    
    </SAppContainer>

)} 
else{
  return(
    <Setup
      safe={safe}
      sdk={sdk}
      ethBalance={ethBalance}
      provider={provider}
      contracts={contracts}
      checkIsSetup={checkIsSetup}
      isSetUp={isSetup}
    />

  )
}
    
    

}





export default App;


// const submitTx = useCallback(async () => {
//   setSubmitting(true);
//   try {
//     const { safeTxHash } = await sdk.txs.send({
//       txs: [
//         {
//           to: safe.safeAddress,
//           value: '0',
//           data: '0x',
//         },
//       ],
//     });
//     console.log({ safeTxHash });
//     const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
//     console.log({ safeTx });
//   } catch (e) {
//     console.error(e);
//   }
//   setSubmitting(false);
// }, [safe, sdk]);