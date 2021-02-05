import React from 'react'
import styled from 'styled-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';

import { 
    Button, 
    Card, 
    Title, 
    Text,
    EthHashInfo,
    FixedDialog,
    Divider,
    EtherscanButton
} from '@gnosis.pm/safe-react-components';


const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

export default function Setup({safe, sdk, ethBalance}) {

    return (
        <Container>
            <Title size="xs">Setup Page</Title>
            <Divider/>
         
         
            <Card>
                <Text size="xl" color="primary">Gnosis Safe Address</Text>

                <div style={{ display: 'flex' }}>
                <EthHashInfo textSize="lg" hash={safe.safeAddress} />
                <Divider orientation="vertical" />
                <EtherscanButton value={safe.safeAddress} />
                </div>

                <Text size="xl" color="primary">ETH Balance</Text>
                <Text size="lg">{ethBalance}</Text>


                <Button 
                size="lg" 
                color="primary" 
                iconType="settings" 
                variant="contained">
                    Complete Set-up
                </Button>
            </Card>            
            
           
        </Container>
    )
}
