import * as React from 'react';
import styles from './styles.module.scss';
import { Divider, Empty, Spin, Typography } from 'antd';
interface InfiniteScroll {
  getObjectFromData: (data: any) => React.ReactNode;
  data: any[];
  setData: (data: any[]) => void;
  getNewData: (
    before: boolean,
    limit: number,
    last_object?: any,
    top?: boolean,
    marked_as_ticket?: boolean,
  ) => Promise<any[]>;
  initialScroll: number;
  setInitialScroll: (scroll: number) => void;
  frame_size: number;
  empty_text: string;
}
const { Text } = Typography;

const InfiniteScroll: React.FC<InfiniteScroll> = (props: InfiniteScroll) => {
  const [hasMoreTop, setHasMoreTop] = React.useState(true);
  const [hasMoreBottom, setHasMoreBottom] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingTop, setIsLoadingTop] = React.useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = React.useState(false);

  const [at_bottom, setAtBottom] = React.useState(false);
  const [scrollToBottom, setScrollToBottom] = React.useState<'no' | 'smooth' | 'instant'>('no');

  const [addedTop, setAddedTop] = React.useState(0);
  const [addedBottom, setAddedBottom] = React.useState(0);
  const [finalScroll, setFinalScroll] = React.useState(0);
  const [addedItems, setAddedItems] = React.useState<any>([]);

  const [shouldshowLoadTop, setShould] = React.useState(true);

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!(hasMoreTop || isLoadingTop) && ref.current) {
      ref.current.scrollTop = ref.current.scrollTop + 50;
    }
  }, [hasMoreTop, isLoadingTop]);

  const addFirstData = (data: any[]) => {
    if (data && data.length == props.frame_size * 3) {
      setHasMoreTop(true);
    } else {
      setHasMoreTop(false);
      setHasMoreBottom(false);
    }
    if (data && data.length > 0) props.setData(data);
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
          setIsLoadingTop(false);
          setIsLoadingBottom(false);
        }
        ref.current.scrollTop = props.initialScroll;
        setAtBottom(false);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        props.getNewData(true, props.frame_size * 3).then((data) => addFirstData(data));
      }
    }
  }, [ref]);

  React.useEffect(() => {
    if (ref.current) setShould(ref.current.scrollHeight <= ref.current.clientHeight);
    if (ref.current && finalScroll != 0) {
      ref.current.scrollTop = finalScroll;
      setFinalScroll(0);
      return;
    }
    if (!isLoading && ref.current && props.data.length == 0) {
      setIsLoading(true);
      setHasMoreBottom(false);
      setHasMoreTop(false);
      setAddedTop(0);
      setAddedBottom(0);
      props.getNewData(true, props.frame_size * 3).then((data) => addFirstData(data));
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
      props.setInitialScroll(ref.current.scrollTop);
      const max_scroll = ref.current.scrollHeight - ref.current.clientHeight;
      setAtBottom(ref.current.scrollTop >= max_scroll * 0.1);
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
          .getNewData(false, props.frame_size, props.data[0], false)
          .then((data) => addNewDataBottom(data));
      }
    }
  };

  return (
    <div className={styles.container} ref={ref} onScroll={handleScroll}>
      {hasMoreTop || isLoadingTop ? (
        <Spin className={styles.spinner} />
      ) : props.frame_size != 0 && !shouldshowLoadTop ? (
        <Divider
          className={styles.end}
          variant='dashed'
          style={{ borderColor: 'rgb(140,140,140)' }}
        >
          <Text color={'#bfbfbf'}>Начало</Text>
        </Divider>
      ) : (
        <></>
      )}
      {props.data &&
        props.data.length > 0 &&
        [...props.data].reverse().map((element: any, index: number) => {
          return (
            <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} key={index}>
              {props.getObjectFromData(element)}
            </div>
          );
        })}
      {!isLoading && props.data.length == 0 && (
        <Empty className={styles.empty} description={<span>{props.empty_text}</span>} />
      )}
      {isLoadingBottom ? (
        <Spin className={styles['spinner']} />
      ) : (
        <div className={styles['spinner']}></div>
      )}
    </div>
  );
};

export default InfiniteScroll;
