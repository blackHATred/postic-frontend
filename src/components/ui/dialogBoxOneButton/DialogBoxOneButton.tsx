import { Button, Flex, Modal } from 'antd';
import { FC, RefObject } from 'react';
import { PropsWithChildren } from 'react';
import { Typography } from 'antd';

export interface DialogBoxModelOneButtonProps{
  isOpen :  boolean,
  onOkClick: (...args: any) => void,
  onCancelClick: (...args: any) => void,
  buttonText: string,
  title: string,
  headerSubtext?: string,
  headerSubtextOnClick?: (...args: any) => void,
}

const styles  = {
  mask: {
    backdropFilter: 'blur(5px)',
    boxShadow: `inset 0 0 15px #fff`
  },
  content:{
    padding: "14px"
  },
  footer:{
    display: 'flex',
    justifyContent: "center",
    
  }
}

const { Text, Title } = Typography;

const DialogBoxOneButton: FC<PropsWithChildren<DialogBoxModelOneButtonProps>> = (props: PropsWithChildren<DialogBoxModelOneButtonProps>) => {
    return (
      
        <Modal open={props.isOpen}
          onOk={props.onOkClick}
          onCancel={props.onCancelClick}
          title={
              <div style={{justifyContent: "space-between", display:"flex", marginRight :35, height:32}}>
              <Title level={3}  style={{marginTop:"auto", marginBottom:"auto"}}>
                {props.title}
              </Title>
              <Text underline type="secondary" style={{marginTop:"auto", marginBottom:"auto"}} onClick={props.headerSubtextOnClick}>
                {props.headerSubtext}
              </Text>
              </div>
          }
          styles={styles}
          footer={
            
            <Button key="submit" type="primary" onClick={props.onOkClick}>
              {props.buttonText}
            </Button>}
        >
          {props.children}
        </Modal>
    )
};

export default DialogBoxOneButton;

