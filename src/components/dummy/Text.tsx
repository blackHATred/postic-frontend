import { Typography } from 'antd';

const { Text } = Typography;

const SmallText: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => (
  <Text {...props} style={{ fontSize: '12px', ...props.style }} />
);
const MediumText: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => (
  <Text {...props} style={{ fontSize: '14px', ...props.style }} />
);
const LargeText: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => (
  <Text {...props} style={{ fontSize: '16px', ...props.style }} />
);

export { SmallText, MediumText, LargeText };
