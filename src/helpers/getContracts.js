import {addresses} from '../config/address/addresses';
import {ethers} from 'ethers';
const {abis} = require("../config/abi/abis");

// export var currentGelatoGasPrice;

const getContracts = (provider, address) => {    

     const uniswapV2Contract = new ethers.Contract(
            addresses.uniswapV2,
            abis.uniswapV2ABI,
            provider
        )  

     const gelatoUserProxyFactoryContract = new ethers.Contract(
            addresses.gelatoUserProxyFactory,
            abis.gelatoUserProxyFactoryABI,
            provider
        )
    
     const gelatoProviderContract = new ethers.Contract(
            addresses.gelatoProvider,
            abis.gelatoProviderABI,
            provider
        )

     const gelatoCoreContract = new ethers.Contract(
            addresses.gelatoCore,
            abis.gelatoCoreABI,
            provider
        )

     const proxyContract = new ethers.Contract(
            addresses.userProxy,
            abis.gelatoUserProxyABI,
            provider
        )

     const conditionUniswapV2RateStatefulContract = new ethers.Contract(
            addresses.conditionUniswapV2RateStateful,
            abis.conditionUniswapV2RateStatefulABI,
            provider
        )

     const conditionUniswapV2RateContract = new ethers.Contract(
            addresses.conditionUniswapV2Rate,
            abis.conditionUniswapV2RateABI,
            provider
        )

     const gelatoSysAdminContract = new ethers.Contract(
            addresses.gelatoCore,
            abis.gelatoSysAdminABI,
            provider
        )

     const daiContract = new ethers.Contract(
            addresses.dai,
            abis.IERC20ABI,
            provider
        )

     const wethContract = new ethers.Contract(
            addresses.weth,
            abis.IERC20ABI,
            provider
        )


    const contracts = {
        uniswapV2Contract: uniswapV2Contract,
        gelatoUserProxyFactoryContract: gelatoUserProxyFactoryContract,
        gelatoProviderContract: gelatoProviderContract,
        gelatoCoreContract: gelatoCoreContract,
        proxyContract: proxyContract,
        conditionUniswapV2RateStatefulContract: conditionUniswapV2RateStatefulContract,
        conditionUniswapV2RateContract: conditionUniswapV2RateContract,
        gelatoSysAdminContract: gelatoSysAdminContract,
        daiContract: daiContract,
        wethContract: wethContract,
    }
    return contracts;
}

export default getContracts;


    // const gelatoGasPriceOracleAddress = await gelatoSysAdminContract.gelatoGasPriceOracle();

    // const gelatoGasPriceOracle = new ethers.Contract(
    //     abis.gelatoOracleABI,
    //     gelatoGasPriceOracleAddress,
    //     provider
    // );

    // currentGelatoGasPrice = await gelatoGasPriceOracle.latestAnswer();
    // console.log('current gelato gas price: ', currentGelatoGasPrice.toString());
