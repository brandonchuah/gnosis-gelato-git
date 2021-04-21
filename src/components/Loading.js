import React from 'react';
import styled from 'styled-components';
import { 
   
    Loader,
   
} from '@gnosis.pm/safe-react-components';

const Centered = styled.main`
  position: fixed;
  top: 50%;
  left: 50%;
  /* bring your own prefixes */
  transform: translate(-50%, -50%);

`

export default function Loading() {
    return (
        <Centered>
            <Loader size="md" />
        </Centered>
        )
}
