import React from 'react';
import { Button, Popover } from 'antd';
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
  className,
  disabled,
}) => {
  return withPopover ? (
    <Popover
      placement='bottom'
      content={<div className={styles['popover-content']}>{popoverContent}</div>}
      trigger='hover'
      mouseEnterDelay={0.5}
    >
      <Button
        type={type}
        icon={icon}
        color={color}
        variant={variant}
        onClick={onButtonClick}
        size={size}
        className={styles['blueButton'] + ' ' + className}
        disabled={disabled}
      >
        {text}
      </Button>
    </Popover>
  ) : (
    <Button
      type={type}
      icon={icon}
      color={color}
      variant={variant}
      onClick={onButtonClick}
      size={size}
      className={styles['blueButton'] + ' ' + className}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

export default ClickableButton;
