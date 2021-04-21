import React, {useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
    Button, 
    Card, 
    Dot,
    Title, 
    Text,
    EthHashInfo,
    Loader,
    Divider,
    TextField,
    FixedIcon,
    Icon,
    EtherscanButton,
    Switch
} from '@gnosis.pm/safe-react-components';

import {ethers} from 'ethers';

import {addresses} from '../config/address/addresses';
import {getTicker, getRate} from '../helpers/getVolume';
import getOrders from '../helpers/getOrders';
import { create } from 'domain';
import { type } from 'os';
const {abis} = require("../config/abi/abis");
const { Action, Condition, Operation, Task, GelatoProvider } = require("@gelatonetwork/core");
const BigNumber = require('bignumber.js');



const Line = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;

  @media screen and (max-width: 768px) {
    display: block;
  }
`
const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 25px;
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
  margin-right: 15px;
`

const AlignRight = styled.div`
  margin-left: 300px;
`

const AlignRightButton = styled.div`
  margin-left: 20px;
`

export default function Trade({sdk, safe, contracts, provider}) {
    const [tokenAddress_sell, setTokenAddress_sell] = useState('');
    const [tokenAddress_buy, setTokenAddress_buy] = useState('');
    const [sellAmount, setSellAmount] = useState(0);
    const [rateInput, setRateInput] = useState(0);
    const [uniswapRate, setUniswapRate] = useState("");
    const [isLarger, setIsLarger] = useState(true);
    const [ticker, setTicker] = useState([]);
    const [ordersCard, setOrdersCard] = useState([]);

    const onSellAddressChange = async(e) => {
        setTokenAddress_sell(e.target.value);
        const tokenTicker = await getTicker(e.target.value);
        if(tokenTicker){
            ticker[0] = tokenTicker;
        }
        else{
            ticker[0] = "Invalid Address"
        }

    }

    const onBuyAddressChange = async(e) => {
        setTokenAddress_buy(e.target.value);
        const tokenTicker = await getTicker(e.target.value);
        if(tokenTicker){
            ticker[1] = tokenTicker;
        }
        else{
            ticker[1] = "Invalid Address"
        }

    }

    const onSellAmountChange = async(e) => {
        var amt = e.target.value
        var parsed = amt * 10 ** 18
        setSellAmount(parsed.toString())
    }

    const onClickGetRate = async() => {
        try{ 
        console.log('rateInput: ', rateInput);
        console.log('sellAmount: ', sellAmount.toString());
        console.log('tokenAddress sell: ', tokenAddress_sell);
        console.log('tokenAddress buy: ', tokenAddress_buy);
        console.log('isLarger: ', isLarger);
        console.log('ticker 0: ', ticker[0]);
        console.log('ticker 1: ', ticker[1]);


        const rate = await getRate(tokenAddress_sell, tokenAddress_buy, contracts.conditionUniswapV2RateContract)

        console.log("rate: ", rate);
        setUniswapRate(rate)
        }catch(error){
            setUniswapRate("Rate not found")
            console.log("No token found")
        }

    }

    const createTask = async() => {
        const iFaceIERC20 = new ethers.utils.Interface(abis.IERC20ABI);
        const approveTokenData = iFaceIERC20.encodeFunctionData("approve", [
            addresses.uniswapV2,
            sellAmount
        ]);    

        const action_approveSellToken = new Action({
            addr: tokenAddress_sell,
            data: approveTokenData,
            operation: Operation.Call,
        });

        const iFaceUNI = new ethers.utils.Interface(abis.uniswapV2ABI);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const tokenPath = [tokenAddress_sell, tokenAddress_buy];
        const expiryDate = nowInSeconds + 900;
        const swapExactTokensForTokensData = iFaceUNI.encodeFunctionData("swapExactTokensForTokens", [
            sellAmount, 
            0, 
            tokenPath, 
            safe.safeAddress, 
            expiryDate])

        const action_swapTokensUniswap = new Action({
            addr: addresses.uniswapV2,
            data: swapExactTokensForTokensData,
            operation: Operation.Call, // This Action must be executed via the UserProxy
        });


        const rate = await getRate(tokenAddress_sell, tokenAddress_buy, contracts.conditionUniswapV2RateContract)
        const rate_parseEther = ethers.utils.parseEther(rate);
        const percentage = rateInput / 100;
        const calc_execution_rate = isLarger 
        ? Math.round(rate_parseEther * (1 + percentage))
        : Math.round(rate_parseEther * (1 - percentage));
        const execution_rate = new BigNumber(calc_execution_rate).toFixed()
        // const execution_rate = calc_execution_rate
        // console.log(typeof execution_rate)

        console.log("rate_parseEther: ", rate_parseEther.toString())
        console.log('rate: ', rate);
        console.log('percentage: ',percentage);
        console.log('calc exec rate: ', calc_execution_rate);;
        // console.log('exec rate: ', ethers.utils.formatEther(execution_rate));
        console.log('exec rate: ', execution_rate);

        const condition_uniRate = new Condition({
            inst: addresses.conditionUniswapV2Rate,
            data: await contracts.conditionUniswapV2RateContract.getConditionData(
                tokenAddress_sell,
                sellAmount,
                tokenAddress_buy,
                execution_rate,
                isLarger
            ),
        });
        const estimatedGasPerExecution = ethers.BigNumber.from("700000"); 

        const task_tradeOnUniswap = new Task({
            // All the conditions have to be met
            // conditions: [condition_uniRate],
            conditions: [condition_uniRate],

            // These Actions have to be executed in the same TX all-or-nothing
            actions: [
            //   action_setRefRateRelative,
            //   action_checkRefRateUniswap,
            action_approveSellToken,
            action_swapTokensUniswap
            ],
            selfProviderGasLimit: estimatedGasPerExecution, 
            selfProviderGasPriceCeil: 0, 
        });

        return task_tradeOnUniswap;
    }

    const createTransferTask = async() => {
        const iFace = new ethers.utils.Interface(abis.IERC20ABI);
        const transferData = iFace.encodeFunctionData("transfer", [
            "0x2F4dAcdD6613Dd2d41Ea0C578d7E666bbDAf3424",
            ethers.utils.parseEther("1")
        ]);

        const DAI_ADDRESS = "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea";

        const actionTransfer = new Action({
            addr: DAI_ADDRESS,
            data: transferData,
            operation: Operation.Call,
        });

        const estimatedGasPerExecution = ethers.BigNumber.from("700000"); 

        const task_transfer = new Task({
            conditions: [],
            actions: [actionTransfer],
            selfProviderGasLimit: estimatedGasPerExecution, 
            selfProviderGasPriceCeil: 0, 
        });

        return task_transfer;
    }

    const onClickSubmit = async() => {
        try{
           
            const task_transfer = await createTask();
            
            const myGelatoProvider = new GelatoProvider({
                addr: safe.safeAddress, 
                module: addresses.gelatoProviderModule
            });

            console.log('provider: ',myGelatoProvider);

            const canSubmit = await contracts.gelatoCoreContract.canSubmitTask(
                safe.safeAddress,
                myGelatoProvider,
                task_transfer,
                0
            );
            console.log('can submit: ',canSubmit);

            const iFaceGelatoCore = new ethers.utils.Interface(abis.gelatoCoreABI);
            const submitTaskToGelatoData = iFaceGelatoCore.encodeFunctionData(
                "submitTask",
                [
                 myGelatoProvider,
                 task_transfer,
                 0,  
                ]
            )

            const txs = [
                {
                    to: addresses.gelatoCore,
                    value: 0,
                    data: submitTaskToGelatoData
                }
            ]
            const params = {
                safeTxGas: 500000,
            };


            const safeTxHash = await sdk.txs.send({txs, params});

        }
        catch(error){
            alert('Transaction failed')
            console.error(error);
        }
    }

    const showOrders = async() => {
        const res = await getOrders(safe.safeAddress);
        console.log(safe.safeAddress)
        var temp_card = [];

        if(res !== undefined){
            const receipts = res[1];
            const conditions = res[0];

            temp_card.push(
                <Card>
                    <Line>
                        <Text size="lg">Order history </Text>
                        <Button 
                        size="lg" 
                        color="secondary" 
                        iconType="resync" 
                        variant="bordered"
                        onClick={() => {showOrders()}}
                        >
                        Refresh
                        </Button> 
                    </Line>
                </Card>
            )

            for(var x=0; x<conditions.length; x++){
                temp_card.push(<Divider/>)

                temp_card.push(
                    <Card>
                    <Line>
                        <TitleLine>
                            <Text size="xl" color="primary">Sell: </Text>
                        </TitleLine>
                        <Text size="lg">{conditions[x]._sellToken}</Text>
                    </Line>
                        <FixedIcon type={'chevronDown'} />
                    <Line>
                        <TitleLine>
                            <Text size="xl" color="primary">Buy: </Text>
                        </TitleLine>
                        <Text size="lg">{conditions[x]._buyToken}</Text>
                    </Line>
                    <Line>
                        <TitleLine>
                            <Text size="xl" color="primary">Amount: </Text>
                        </TitleLine>
                        <Text size="lg">{ethers.utils.formatEther(conditions[x]._sellAmount)}</Text>
                    </Line>
                    <Line>
                        <TitleLine>
                            <Text size="xl" color="primary">Rate: </Text>
                        </TitleLine>
                        {conditions[x]._greaterElseSmaller == true ? 
                            <Text size="lg"> {">"} </Text> :
                            <Text size="lg"> {"<"} </Text>
                        }
                        <Text size="lg">{ethers.utils.formatEther(conditions[x]._currentRefRate)}</Text>
                    </Line>
                    
                    <Line>
                    <EtherscanButton value={receipts[x].submissionHash} network="rinkeby" />
                    {receipts[x].status == "execSuccess" 
                        ? <AlignRight><Icon size="sm" type="check" color="primary" /></AlignRight>
                        : receipts[x].status == "execReverted" 
                            ? <AlignRight><Icon size="sm" type="cross" color="error" /></AlignRight>
                            : <AlignRight><Icon size="sm" type="allowances" color="rinkeby" /></AlignRight>
                    }

                    </Line>



                </Card>
                )
            }
        }else{
            temp_card.push(
                <Card>
                    <Line>
                        <Text size="lg"> No order history </Text>
                        <Button 
                        size="lg" 
                        color="secondary" 
                        iconType="resync" 
                        variant="bordered"
                        onClick={() => {showOrders()}}
                        >
                        Refresh
                        </Button> 
                    </Line>
                </Card>
            )
        }
        setOrdersCard(temp_card)
        console.log(res)
    }

    

    useEffect(() => {
        showOrders();
      }, []);

    return (
        <SAppContainer>
        <Card>
           <Line>
            <TitleLine>
                <form noValidate autoComplete="off" >
                    <TextField
                    id="standard-name"
                    label="Token Address"
                    value={tokenAddress_sell}
                    onChange={(e) => {onSellAddressChange(e)}}
                    />
                </form>
            </TitleLine>
            <TitleLine>
            <FixedIcon type={'chevronRight'} />            
            </TitleLine>
          
                <form noValidate autoComplete="off" >
                    <TextField
                    id="standard-name"
                    label="Token Address"
                    value={tokenAddress_buy}
                    onChange={(e) => {onBuyAddressChange(e)}}
                    />
                </form>
            </Line>    

            <Divider/>
            <Line>
                <TitleLine>
                <Button 
                    size="md" 
                    color="primary" 
                    iconType="search" 
                    variant="contained"
                    // onClick={() => {checkIsSetup(contracts)}}
                    onClick={onClickGetRate}
                >
                Get Current Rate
                </Button>
                </TitleLine>
                <form noValidate autoComplete="off">
                    <TextField
                    id="standard-name"
                    label="Rate"
                    readOnly
                    value={uniswapRate}
                    />
                </form>
            </Line>


        </Card>
        <Divider />
        <Card>
            <Line>
            <TitleLine>
                    <Text size="xl"> Convert </Text>
            </TitleLine>

            <TitleLine>
                <form noValidate autoComplete="off" >
                    <TextField
                    id="standard-name"
                    label="Amount"
                    onChange={(e) => {onSellAmountChange(e)}}
                    />
                </form>
            </TitleLine>

            <TitleLine>
                    <Text size="xl"> of </Text>
            </TitleLine>
                
            <TitleLine>
                <form noValidate autoComplete="off">
                        <TextField
                        id="standard-name"
                        readOnly
                        value={ticker[0]}
                        />
                </form>
            </TitleLine>

            <TitleLine>
                <Text size="xl"> to </Text>
            </TitleLine>

                <form noValidate autoComplete="off">
                        <TextField
                        id="standard-name"
                        readOnly
                        value={ticker[1]}
                        />
                </form>

            </Line>

            <Line>
            <TitleLine>
                <Text size="xl">when the rate is </Text>
            </TitleLine>

            <TitleLine>
                <form noValidate autoComplete="off" >
                        <TextField
                        id="standard-name"
                        label="Percentage"
                        onChange={(e) => (setRateInput(e.target.value))}
                        />
                </form>
            </TitleLine>

                <Text size="xl">% Lower</Text>

                <Switch checked={isLarger} onChange={setIsLarger} />
            
                <Text size="xl">Higher than current rate</Text>
                  
                <AlignRightButton>
                    <Button 
                        size="lg" 
                        color="primary" 
                        variant="contained"
                        onClick={onClickSubmit}
                    > Submit </Button>

                </AlignRightButton>

            </Line>



        </Card>



          

        <Divider />

       

        
           {ordersCard}
     
        
        </SAppContainer>

    )
}
