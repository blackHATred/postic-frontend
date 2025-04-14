import React, { createContext, PropsWithChildren } from 'react';
import { notification, NotificationArgsProps } from 'antd';
import { NotificationPlacements } from 'antd/es/notification/interface';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export type NotificationPlacement = NotificationArgsProps['placement'];

interface SummaryBoxContent {
  createNotification: (type: NotificationType, title: string, description: string) => void;
}

export const NotificationContext = createContext<SummaryBoxContent>({
  createNotification: () => {
    throw new Error('NotificationContext еще не инициализирован');
  },
});

const NotificationManager: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (
    type: NotificationType,
    title: string,
    description: string,
    placement: NotificationPlacement = NotificationPlacements[4],
  ) => {
    api[type]({
      message: title,
      description: description,
      className: 'notification',
      placement,
      showProgress: true,
    });
  };

  return (
    <>
      {contextHolder}
      <NotificationContext.Provider value={{ createNotification: openNotification }}>{props.children}</NotificationContext.Provider>
    </>
  );
};
export default NotificationManager;
