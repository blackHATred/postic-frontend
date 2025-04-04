import { Modal } from "antd";
import ClickableButton, { ClickableButtonProps } from "../Button/Button";
import { FC } from "react";
import { PropsWithChildren } from "react";
import { Typography } from "antd";

export interface DialogBoxProps {
  isOpen: boolean;
  bottomButtons?: ClickableButtonProps[];
  onCancelClick: (...args: any) => void;
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
        <div style={{ marginRight: "10px" }}>
          {props.bottomButtons &&
            props.bottomButtons.map((object, i: number) => (
              <ClickableButton key={object.text} type="primary" {...object} />
            ))}
          {!props.bottomButtons && <span></span>}
        </div>
      }
    >
      {props.children}
    </Modal>
  );
};

export default DialogBox;
