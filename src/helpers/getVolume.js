import {ethers} from 'ethers';
import { addresses } from '../config/address/addresses';


const axios = require("axios");
const { ChainId, Fetcher } = require ('@uniswap/sdk');
const SELL_AMOUNT = ethers.utils.parseEther("1");
const chainId = ChainId.RINKEBY //change on network change
const MAINNET_WETH = ethers.utils.getAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); //change on network change
const MAINNET_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
const RINKEBY_WETH = ethers.utils.getAddress('0xc778417e063141139fce010982780140aa0cd5ab');
// const RINKEBY_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/crypto-steve-ng/uniswapv2rinkeby'
const RINKEBY_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/jmahhh/uniswap-v2-rinkeby'

export const getTicker = async(address) => {
    try{
        const result = await axios.post(
            `${RINKEBY_SUBGRAPH}`,{
                query: `
                    {
                        token(id: "${address}"){
                        symbol
                        }
                    }
                `
            }
        )
        console.log('subgraph result: ', result);
        return result.data.data.token.symbol
    }
    catch(error){
        console.log('Invalid address')
    }
}


export const getRate = async(address_A, address_B, conditionUniswapV2RateContract) => {
    try{
        const A_B_RATE = await conditionUniswapV2RateContract.getUniswapRate(
            address_A,
            SELL_AMOUNT,
            address_B);
            
            return ethers.utils.formatEther(A_B_RATE);
    }
    catch(error){
        console.log('getRate error');
        return 0;
    }

}


