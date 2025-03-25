import { Button, Flex, Modal } from "antd";
import { FC, RefObject } from "react";
import { PropsWithChildren } from "react";
import { Typography } from "antd";

export interface DialogBoxProps {
  isOpen: boolean;
  onOkClick: ((...args: any) => void)[];
  onCancelClick: (...args: any) => void;
  buttonText?: string[];
  title: string;
  headerSubtext?: string;
  headerSubtextOnClick?: (...args: any) => void;
  isCenter?: boolean;
}

const { Text, Title } = Typography;

const DialogBox: FC<PropsWithChildren<DialogBoxProps>> = (
  props: PropsWithChildren<DialogBoxProps>
) => {
  const styles = {
    mask: {
      backdropFilter: "blur(5px)",
      boxShadow: `inset 0 0 15px #fff`,
    },
    content: {
      padding: "14px",
    },

    footer: {
      display: (props.isCenter && "flex") || "",
      justifyContent: (props.isCenter && "center") || "",
    },
  };

  return (
    <Modal
      open={props.isOpen}
      onCancel={props.onCancelClick}
      title={
        <div
          style={{
            justifyContent: "space-between",
            display: "flex",
            marginRight: 35,
            height: 32,
          }}
        >
          <Title level={3} style={{ marginTop: "auto", marginBottom: "auto" }}>
            {props.title}
          </Title>
          <Text
            underline
            type="secondary"
            style={{ marginTop: "auto", marginBottom: "auto" }}
            onClick={props.headerSubtextOnClick}
          >
            {props.headerSubtext}
          </Text>
        </div>
      }
      styles={styles}
      footer={
        <div>
          {props.buttonText &&
            props.buttonText.map((object, i: number) => (
              <Button
                key={object}
                type="primary"
                onClick={props.onOkClick[i]}
                style={{ marginRight: "10px" }}
              >
                {object}
              </Button>
            ))}
          {!props.buttonText && <span></span>}
        </div>
      }
    >
      {props.children}
    </Modal>
  );
};

export default DialogBox;
