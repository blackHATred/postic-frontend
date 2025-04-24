import { PropsWithChildren } from 'react';
import React from 'react';
import { FC } from 'react';
import { Divider, Spin } from 'antd';

export interface BlueDashedTextBoxProps {
  isLoading: boolean;
}

const BlueDashedTextBox: FC<PropsWithChildren<BlueDashedTextBoxProps>> = (
  props: PropsWithChildren<BlueDashedTextBoxProps>,
) => {
  const BackgroundStyle: React.CSSProperties = {
    //background: '#f0f0f0',
    //borderStyle: 'dashed',
    //borderColor: '#8c8c8c',
    borderRadius: '10px',
    minHeight: '50px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      {props.isLoading && <Spin />}
      {!props.isLoading && (
        <div>
          <Divider style={{ margin: '10px' }} />
          <div style={BackgroundStyle}>{props.children}</div>
        </div>
      )}
    </div>
  );
};

export default BlueDashedTextBox;
