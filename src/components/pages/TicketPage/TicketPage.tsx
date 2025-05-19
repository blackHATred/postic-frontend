import React from 'react';
import CommentList from '../../lists/CommentList/CommentList';

const TicketPage: React.FC = () => {
  return <CommentList save_redux={false} />;
};

export default TicketPage;
