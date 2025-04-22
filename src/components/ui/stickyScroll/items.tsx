import React from 'react';

export interface coolScroll {
  getObjectFromData: (data: any, index: number) => React.ReactNode;
  data: any[];
}

const objects: React.FC<coolScroll> = (props: coolScroll) => {
  return (
    <div>
      {props.data &&
        props.data.length > 0 &&
        [...props.data].reverse().map((element, index) => {
          return props.getObjectFromData(element, index);
        })}
    </div>
  );
};

export default objects;
