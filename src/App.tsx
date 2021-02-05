import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Loader, Title, Layout } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import Setup from './components/Setup';

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();
  const [submitting, setSubmitting] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const [ethBalance, setEthBalance] = useState(0);

  useEffect(() => {
    getBalance()
    // return () => {
    //   cleanup
    // }
  }, [])

  const submitTx = useCallback(async () => {
    setSubmitting(true);
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: '0',
            data: '0x',
          },
        ],
      });
      console.log({ safeTxHash });
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
      console.log({ safeTx });
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  }, [safe, sdk]);

  const getBalance = async() =>{
    const temp = await sdk.getSafeInfo();
    const address = temp.safeAddress;
    const res = await sdk.eth.getBalance([address]);
    const balance = parseFloat(res);
    setEthBalance(balance);
}

  return (
    <div>

      {setupDone ? (
        <Title size="md">{safe.safeAddress}</Title>       
      ) : (
      <Setup
        safe={safe}
        sdk={sdk}
        ethBalance={ethBalance}
      />
      
      )}

    </div>
    
  );
};

export default App;

