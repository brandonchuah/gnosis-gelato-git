const gelatoCoreABI = require("@gelatonetwork/core/artifacts/contracts/gelato_core/GelatoCore.sol/GelatoCore.json").abi;
const gelatoProviderABI = require("@gelatonetwork/core/artifacts/contracts/gelato_core/GelatoProviders.sol/GelatoProviders.json").abi;
const gelatoExecutorABI = require("@gelatonetwork/core/artifacts/contracts/gelato_core/GelatoExecutors.sol/GelatoExecutors.json").abi;
const gelatoSysAdminABI = require("@gelatonetwork/core/artifacts/contracts/gelato_core/GelatoSysAdmin.sol/GelatoSysAdmin.json").abi;
const gelatoGasPriceOracleABI = require("@gelatonetwork/core/artifacts/contracts/gelato_core/GelatoGasPriceOracle.sol/GelatoGasPriceOracle.json").abi;
const gelatoUserProxyFactoryABI = require("@gelatonetwork/gelato-user-proxy/artifacts/GelatoUserProxyFactory.json").abi;
const gelatoUserProxyABI = require("@gelatonetwork/gelato-user-proxy/artifacts/GelatoUserProxy.json").abi;
const conditionUniswapV2RateStatefulABI = [
    'function getConditionData(address _userProxy,address _sellToken,uint256 _sellAmount,address _buyToken,bool _greaterElseSmaller) public pure returns(bytes memory)',
    'function ok(uint256 _taskReceiptId, bytes calldata _conditionData, uint256) public view returns(string memory)',
    'function checkRefRateUniswap(uint256 _taskReceiptId, address _userProxy, address _sellToken, uint256 _sellAmount, address _buyToken, bool _greaterElseSmaller) public view returns(string memory)',
    'function setRefRateAbsolute(address _sellToken, uint256 _sellAmount, address _buyToken, bool _greaterElseSmaller, uint256 _rateDeltaAbsolute, uint256 _idDelta) external',
    'function setRefRateRelative(address _sellToken, uint256 _sellAmount, address _buyToken, bool _greaterElseSmaller, uint256 _rateDeltaNominator, uint256 _idDelta) external',
    'function getUniswapRate(address _sellToken, uint256 _sellAmount, address _buyToken) public view returns(uint256 expectedRate)',
]
const conditionUniswapV2RateABI = [
    'function getConditionData(address _sellToken, uint256 _sellAmount, address _buyToken, uint256 _currentRefRate, bool _greaterElseSmaller) public pure returns(bytes memory)',
    'function getUniswapRate(address _sellToken, uint256 _sellAmount, address _buyToken) public view returns(uint256 expectedRate)',
    ' function checkRefRateUniswap( address _sellToken, uint256 _sellAmount, address _buyToken, uint256 _currentRefRate, bool _greaterElseSmaller)'
]
const uniswapV2ABI = require("./Uniswap_v2.json").abi
const gelatoOracleABI = ["function latestAnswer() view returns (int256)"]
const IERC20ABI = require("@gelatonetwork/core/artifacts/contracts/external/IERC20.sol/IERC20.json").abi
const iGnosisSafeABI = require("../iGnosisSafe.json").abi

module.exports = {
    abis: {
        gelatoCoreABI,
        gelatoProviderABI,
        gelatoExecutorABI,
        gelatoSysAdminABI,
        gelatoGasPriceOracleABI,
        gelatoUserProxyFactoryABI,
        gelatoUserProxyABI,
        conditionUniswapV2RateStatefulABI,
        conditionUniswapV2RateABI,
        uniswapV2ABI,
        gelatoOracleABI,
        IERC20ABI,
        iGnosisSafeABI
    },
};