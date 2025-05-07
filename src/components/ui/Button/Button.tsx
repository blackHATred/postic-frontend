import React, { useState } from 'react';
import { Button, Popconfirm, Popover } from 'antd';
import styles from './styles.module.scss';

export interface ClickableButtonProps {
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  text?: string;
  icon?: React.ReactNode;
  variant?: 'dashed' | 'text' | 'link' | 'outlined' | 'solid' | 'filled';
  size?: 'large' | 'middle' | 'small';
  color?:
    | 'primary'
    | 'default'
    | 'danger'
    | 'blue'
    | 'purple'
    | 'cyan'
    | 'green'
    | 'magenta'
    | 'pink'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'volcano'
    | 'geekblue'
    | 'lime'
    | 'gold';
  onButtonClick?: (...args: any) => any;
  withPopover?: boolean;
  popoverContent?: string;
  className?: string;
  disabled?: boolean;
  confirm?: boolean;
}

const ClickableButton: React.FC<ClickableButtonProps> = ({
  type = 'primary',
  text,
  icon,
  color,
  variant,
  size,
  onButtonClick,
  popoverContent,
  withPopover = false,
  confirm = false,
  className,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  return withPopover ? (
    <Popover
      placement='bottom'
      content={<div className={styles['popover-content']}>{popoverContent}</div>}
      trigger='hover'
      mouseEnterDelay={0.5}
    >
      <Popconfirm
        title='Подтвердить действие'
        onConfirm={() => {
          if (onButtonClick) onButtonClick();
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
        okText='Да'
        cancelText='Нет'
        open={open}
      >
        <Button
          type={type}
          icon={icon}
          color={color}
          variant={variant}
          size={size}
          className={styles['blueButton'] + ' ' + className}
          disabled={disabled}
          onClick={confirm ? () => setOpen(!open) : onButtonClick}
        >
          {text}
        </Button>
      </Popconfirm>
    </Popover>
  ) : (
    <Popconfirm
      title='Подтвердить действие'
      onConfirm={() => {
        if (onButtonClick) onButtonClick();
        setOpen(false);
      }}
      onCancel={() => {
        setOpen(false);
      }}
      okText='Да'
      cancelText='Нет'
      open={open}
    >
      <Button
        type={type}
        icon={icon}
        color={color}
        variant={variant}
        size={size}
        className={styles['blueButton'] + ' ' + className}
        disabled={disabled}
        onClick={confirm ? () => setOpen(!open) : onButtonClick}
      >
        {text}
      </Button>
    </Popconfirm>
  );
};

export default ClickableButton;
