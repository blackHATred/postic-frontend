import * as React from 'react';
import styles from './styles.module.scss';
import { Empty, Spin } from 'antd';
interface coolScroll {
  getObjectFromData: (data: any, index: number) => React.ReactNode;
  data: any[];
  setData: (data: any[]) => void;
  getNewData: (before: boolean, limit: number, last_object?: any, top?: boolean) => Promise<any[]>;
  initialScroll: number;
  frame_size: number;
  empty_text: string;
  refresh?: any;
}

const InfiniteScroll: React.FC<coolScroll> = (props: coolScroll) => {
  const [hasMoreTop, setHasMoreTop] = React.useState(true);
  const [hasMoreBottom, setHasMoreBottom] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingTop, setIsLoadingTop] = React.useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = React.useState(false);

  const [at_bottom, setAtBottom] = React.useState(true);
  const [scrollToBottom, setScrollToBottom] = React.useState<'no' | 'smooth' | 'instant'>('no');

  const [addedTop, setAddedTop] = React.useState(0);
  const [addedBottom, setAddedBottom] = React.useState(0);
  const [finalScroll, setFinalScroll] = React.useState(0);
  const [addedItems, setAddedItems] = React.useState<any>([]);

  const ref = React.useRef<HTMLDivElement>(null);

  const addFirstData = (data: any[]) => {
    if (data && data.length < props.frame_size) {
      setHasMoreTop(false);
    } else if (data && data.length == props.frame_size * 3) {
      setHasMoreTop(true);
    }
    if (data) props.setData(data);
    if (ref.current) {
      setScrollToBottom('instant');
      setIsLoading(false);
    }
  };

  const addNewDataTop = (data: any[]) => {
    setIsLoadingTop(false);
    if (data && props.data && props.data.length > 0) {
      if (data.length != props.frame_size) {
        setHasMoreTop(false);
      }

      if (ref.current) {
        setAddedTop(ref.current.scrollTop - ref.current.scrollHeight);
      }

      setHasMoreBottom(true);
      setAddedItems(data);
      props.setData([...props.data, ...data]);
    } else if (props.data.length > 0) {
      setHasMoreTop(false);
    }
  };

  const addNewDataBottom = (data: any[]) => {
    setIsLoadingBottom(false);
    if (data && props.data) {
      data = data.slice(1);
      if (data.length != props.frame_size) {
        setHasMoreBottom(false);
      }
      if (ref.current) {
        setAddedBottom(ref.current.scrollTop - ref.current.scrollHeight);
      }
      setHasMoreTop(true);

      setAddedItems(data);
      props.setData(props.data.slice(0, props.data.length - data.length));
    } else {
      setHasMoreBottom(false);
    }
  };

  // NOTE: Вызывается при загрузке компонента
  React.useEffect(() => {
    if (ref.current) {
      setHasMoreBottom(false);
      //Если есть данные
      if (props.data && props.data.length > 0) {
        if (props.data.length < props.frame_size || props.frame_size == 0) {
          // Загружены все объекты
          setHasMoreTop(false);
          setHasMoreBottom(false);
        }
        //ref.current.scrollTop = props.initialScroll;

        setAtBottom(true);
        ref.current.scrollTop = 1000000;
        setIsLoading(false);
      } else {
        setIsLoading(true);
        props.getNewData(true, props.frame_size * 3).then((data) => addFirstData(data));
      }
    }
  }, [ref]);

  React.useEffect(() => {
    if (!isLoading && ref.current) {
      setIsLoading(true);
      setHasMoreBottom(false);
      setHasMoreTop(false);
      setAddedTop(0);
      setAddedBottom(0);
      props.getNewData(true, props.frame_size * 3).then((data) => addFirstData(data));
    }
  }, [props.refresh]);

  React.useEffect(() => {
    if (ref.current && finalScroll != 0) {
      ref.current.scrollTop = finalScroll;
      setFinalScroll(0);
      return;
    }

    if (addedTop != 0 && ref.current) {
      ref.current.scrollTop = addedTop + ref.current.scrollHeight;
      setAddedTop(0);
      props.setData(props.data.slice(addedItems.length, props.data.length));
    }

    if (addedBottom != 0 && ref.current) {
      ref.current.scrollTop = addedBottom + ref.current.scrollHeight;

      setAddedBottom(0);
      setFinalScroll(ref.current.scrollTop);
      props.setData([...addedItems, ...props.data]);
    }

    if (scrollToBottom == 'instant' && ref.current && addedBottom == 0) {
      ref.current.scrollTop = ref.current.scrollHeight;
      setScrollToBottom('no');
      setAtBottom(true);
    } else {
      if (at_bottom && ref.current && addedBottom == 0) {
        ref.current.scrollTo({
          top: ref.current.scrollHeight,
          left: 0,
          behavior: 'smooth',
        });
        setAtBottom(true);
      }
    }
  }, [props.data]);

  const handleScroll = (event: React.UIEvent) => {
    if (ref.current) {
      const max_scroll = ref.current.scrollHeight - ref.current.clientHeight;
      setAtBottom(ref.current.scrollTop >= max_scroll - 100);
      if (
        ref.current.scrollTop <= max_scroll * 0.1 &&
        hasMoreTop &&
        !isLoadingTop &&
        scrollToBottom == 'no' &&
        !isLoading &&
        props.data &&
        props.data.length > 0 &&
        props.frame_size != 0
      ) {
        //NOTE: load more data bottom
        setIsLoadingTop(true);
        props
          .getNewData(true, props.frame_size, props.data[props.data.length - 1], true)
          .then((data) => addNewDataTop(data));
      }
      if (
        ref.current.scrollTop >= max_scroll * 0.9 &&
        hasMoreBottom &&
        !isLoadingBottom &&
        !isLoading &&
        props.data &&
        props.data.length > 0 &&
        props.frame_size != 0
      ) {
        //NOTE: load more data top
        setIsLoadingBottom(true);
        props
          .getNewData(false, props.frame_size + 1, props.data[0], false)
          .then((data) => addNewDataBottom(data));
      }
    }
  };

  return (
    <div className={styles.container} ref={ref} onScroll={handleScroll}>
      {!isLoadingTop && !isLoadingBottom && isLoading && <Spin className={styles['spin']} />}
      {isLoadingTop ? <Spin className={styles['spin']} /> : <div className={styles['spin']}></div>}
      {props.data &&
        props.data.length > 0 &&
        [...props.data].reverse().map((element: any, index: number) => {
          return (
            <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
              {props.getObjectFromData(element, index)}
            </div>
          );
        })}
      {!isLoading && props.data.length == 0 && (
        <Empty className={styles.empty} description={<span>{props.empty_text}</span>} />
      )}
      {isLoadingBottom ? (
        <Spin className={styles['spin']} />
      ) : (
        <div className={styles['spin']}></div>
      )}
    </div>
  );
};

export default InfiniteScroll;
