import React from 'react';
import { Collapse, CollapseProps } from 'antd';

interface PlatformSettingsProps {
  selectedPlatforms: string[];
}

const PlatformSettings: React.FC<PlatformSettingsProps> = ({ selectedPlatforms }) => {
  const allItems: CollapseProps['items'] = [
    {
      key: 'vk',
      label: 'VK',
      children: <p>Длина поста - не более 16 384 символа</p>,
    },
    {
      key: 'tg',
      label: 'Telegram',
      children: (
        <p>Длина поста - не более 4096 символа. При наличии файлов длина поста - не более 1024</p>
      ),
    },
  ];

  const filteredItems = allItems.filter(
    (item) => item.key && selectedPlatforms.includes(item.key as string),
  );

  return filteredItems.length > 0 ? <Collapse items={filteredItems} /> : null;
};

export default PlatformSettings;
