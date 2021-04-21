const {ethers} = require("ethers");

const axios = require("axios");
// const { ChainId, Fetcher } = require ('@uniswap/sdk');
const GELATO_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/gelatodigital/gelato-network-rinkeby'
const {abis} = require("../config/abi/abis");

const getOrders = async(address) => {
    try{
        var address_lower = address.toLowerCase()
        const result = await axios.post(
            `${GELATO_SUBGRAPH}`,{
                query: `
                    {
                                                
                        taskReceiptWrappers(
                            where: {
                            user_contains:"${address_lower}"}) {
                            taskReceipt {
                            id
                            tasks {
                                conditions {
                                inst
                                data
                                }
                                actions {
                                addr
                                data
                                operation
                                dataFlow
                                value
                                termsOkCheck
                                }
                                selfProviderGasLimit
                                selfProviderGasPriceCeil
                            }
                            }
                            submissionHash
                            status
                        }
                                                    
                    }
                `
            }
        )
        console.log(result.data.data.taskReceiptWrappers)
        console.log('end of all ---------------------------------------')
        var receipts = result.data.data.taskReceiptWrappers;
        var condition_data = [];
        var condition_decoded = [];
        for(var x=0 ; x < result.data.data.taskReceiptWrappers.length ; x++){
            // console.log(result.data.data.taskReceiptWrappers[x].taskReceipt.id)
            if(result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].actions.length == 2){
                // result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].actions[0].addr 
                //     == "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea"
                //     &&
                if( result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].actions[1].addr
                    == "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
                    && result.data.data.taskReceiptWrappers[x].taskReceipt.id > 1400
                    && result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].conditions[0] != undefined)
                {
                    console.log(result.data.data.taskReceiptWrappers[x].taskReceipt)
    
                    // console.log(result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].conditions[0].data)
                    const _data = result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].conditions[0].data
                    // console.log(_data)
                    condition_data.push(_data)
                }
                else{
                    console.log('skip')
                }
            }else{
                console.log('skip more than 2 actions')
            }
            // console.log(result.data.data.taskReceiptWrappers[x].taskReceipt.tasks[0].conditions[0].data);
        }
        
        receipts.reverse()
        // console.log(receipts[0].status)
        condition_data.reverse()
        // console.log('start')
        // console.log(condition_data.length)

        for(var x=0; x<condition_data.length; x++){
            const iFaceCondition = new ethers.utils.Interface(abis.conditionUniswapV2RateABI);
            const decoded = iFaceCondition.decodeFunctionData("checkRefRateUniswap", condition_data[x])
            condition_decoded.push(decoded)
            // console.log(decoded)
        }
        return [condition_decoded, receipts];
    }
    catch(error){
        console.log('Invalid address')
        console.log(error)
    }
    
    

  
}

export default getOrders;

// getOrders("0x271e22eBAf356eF4db43465f73496A55500f5D95");
