import { PropsWithChildren } from 'react';
import React from 'react';
import { FC } from 'react';
import { Spin } from 'antd';
import { blue } from '@ant-design/colors';

export interface BlueDashedTextBoxProps {
  isLoading: boolean;
}

const BlueDashedTextBox: FC<PropsWithChildren<BlueDashedTextBoxProps>> = (props: PropsWithChildren<BlueDashedTextBoxProps>) => {
  const BackgroundStyle: React.CSSProperties = {
    background: blue[0],
    borderStyle: 'dashed',
    borderColor: blue[2],
    borderRadius: '5px',
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      {props.isLoading && <Spin />}
      {!props.isLoading && <div style={BackgroundStyle}>{props.children}</div>}
    </div>
  );
};

export default BlueDashedTextBox;
