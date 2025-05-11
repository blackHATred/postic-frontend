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
  const [hasMoreTop, setHasMoreTop] = React.useState(false);
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

  const [shouldshowLoadTop, setShould] = React.useState(false);

  const ref = React.useRef<HTMLDivElement>(null);

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

  const onGot = (data: any[], top = true) => {
    if (data.length > 0) setAddedItems(data);
    else {
      setIsLoadingTop(false);
      setIsLoading(false);
      setIsLoadingBottom(false);
    }
    if (ref.current) {
      const max_scroll = ref.current.scrollHeight - ref.current.clientHeight;
      if (ref.current.scrollTop <= max_scroll * 0.1) {
        if (top) addNewDataTop(data);
        else {
          setIsLoadingTop(false);
          setIsLoading(false);
          setIsLoadingBottom(false);
          setAddedItems([]);
        }
      } else if (ref.current.scrollTop >= max_scroll * 0.9) {
        if (!top) addNewDataBottom(data);
        else {
          setIsLoadingTop(false);
          setIsLoading(false);
          setIsLoadingBottom(false);
          setAddedItems([]);
        }
      }
    }
  };

  const addNewDataTop = async (data: any[] = []) => {
    if (data == null) {
      data = addedItems;
    }
    setShould(true);
    setIsLoadingTop(false);
    if (data && data.length > 0 && props.data && props.data.length > 0) {
      if (data.length != props.frame_size) {
        setHasMoreTop(false);
      }

      if (ref.current) {
        setAddedTop(ref.current.scrollTop - ref.current.scrollHeight);
      }

      setHasMoreBottom(true);
      props.setData([...props.data, ...data]);
    } else if (props.data.length > 0) {
      setHasMoreTop(false);
    } else {
      setHasMoreTop(false);
    }
  };

  const addNewDataBottom = async (data: any[] = []) => {
    if (data == null) {
      data = addedItems;
    }
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
      if (props.data && props.data.length > 0) {
        if (props.data.length < props.frame_size * 3 || props.frame_size == 0) {
          setHasMoreTop(false);
          setHasMoreBottom(false);
          setIsLoadingTop(false);
          setIsLoadingBottom(false);
        } else {
          setHasMoreTop(true);
          setHasMoreBottom(true);
        }
        ref.current.scrollTop = props.initialScroll - 50;
        setAtBottom(false);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        props.getNewData(true, props.frame_size * 3).then((data) => addFirstData(data));
      }
    }
  }, [ref]);

  React.useEffect(() => {
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
      setAddedItems([]);
    }

    if (addedBottom != 0 && ref.current) {
      ref.current.scrollTop = addedBottom + ref.current.scrollHeight;

      setAddedBottom(0);
      setFinalScroll(ref.current.scrollTop);
      props.setData([...addedItems, ...props.data]);
      setAddedItems([]);
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
      if (ref.current.scrollTop <= max_scroll * 0.1 && isLoadingTop && addedItems.length > 0)
        addNewDataTop();
      else if (
        ref.current.scrollTop >= max_scroll * 0.9 &&
        isLoadingBottom &&
        addedItems.length > 0
      )
        addNewDataBottom();
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
          .then((data) => onGot(data, true));
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
          .then((data) => onGot(data, false));
      }
    }
  };

  return (
    <div className={styles.container} ref={ref} onScroll={handleScroll}>
      {shouldshowLoadTop || hasMoreTop ? (
        <div className={styles.end}>
          {hasMoreTop || isLoadingTop || addedTop != 0 ? (
            <Spin className={styles.spinner} />
          ) : (
            <Divider variant='dashed' className={styles.end}>
              <Text color={'#bfbfbf'}>Начало</Text>
            </Divider>
          )}
        </div>
      ) : (
        <></>
      )}
      {props.data &&
        props.data.length > 0 &&
        [...props.data].reverse().map((element: any) => {
          return (
            <div style={{ visibility: isLoading ? 'hidden' : 'visible' }} key={element.id}>
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
