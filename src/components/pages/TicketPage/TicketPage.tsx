import React from 'react';
import CommentList from '../../lists/CommentList/CommentList';
import { addTicket, removeTicket, replaceTicket, setTickets } from '../../../stores/commentSlice';

const TicketPage: React.FC = () => {
  return (
    <CommentList
      get_func={(state) => state.comments.tickets}
      set_func={setTickets}
      add_func={addTicket}
      remove_func={removeTicket}
      replace_func={replaceTicket}
    />
  );
};

export default TicketPage;
