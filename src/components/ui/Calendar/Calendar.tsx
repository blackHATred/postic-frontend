import React from 'react';
import { Calendar, theme } from 'antd';
import type { Dayjs } from 'dayjs';

interface CustCalendarProps {
  onPanelChange?: (date: Dayjs | null) => void;
}

const CustCalendar: React.FC<CustCalendarProps> = ({ onPanelChange }) => {
  const { token } = theme.useToken();

  const wrapperStyle: React.CSSProperties = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };

  return (
    <div style={wrapperStyle}>
      <Calendar fullscreen={false} onPanelChange={onPanelChange} />
    </div>
  );
};

export default CustCalendar;
