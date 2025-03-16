import { Button, Modal } from 'antd';
import { FC } from 'react';
import { PropsWithChildren } from 'react';

export interface DialogBoxModelOneButtonProps{
  isOpen :  boolean,
  onOk: (...args: any) => any,
  onCancel: (...args: any) => any,
  buttonText: string,
  title: string
}

const styles = {
  mask: {
    backdropFilter: 'blur(5px)',
    boxShadow: `inset 0 0 15px #fff`
  }
}
const DialogBoxOneButton: FC<PropsWithChildren<DialogBoxModelOneButtonProps>> = (props: PropsWithChildren<DialogBoxModelOneButtonProps>) => {
    return (
      
        <Modal open={props.isOpen}
          onOk={props.onOk}
          onCancel={props.onCancel}
          title={props.title}
          styles={styles}
          footer={
            
            <Button key="submit" type="primary" onClick={props.onOk}>
              {props.buttonText}
            </Button>}
        >
          {props.children}
        </Modal>
    )
};

export default DialogBoxOneButton;

