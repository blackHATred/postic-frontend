import * as React from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import styles from "./styles.module.scss";
import { current } from "@reduxjs/toolkit";
import { mockPosts } from "../../../models/Post/types";
import { getPosts } from "../../../api/api";
import { ScrollEventData } from "react-virtualized";
import { Spin } from "antd";
import PostComponent from "../Post/Post";
import { randomInt } from "crypto";
import { useScrollTo } from "react-scroll-to-bottom";
import { ignore } from "antd/es/theme/useToken";
import { start } from "repl";

interface scrollInterface {}

interface coolScroll {
  object: React.ReactNode[];
  getNewData: () => number;
  doSmoothScroll: boolean;
  smoothScrollTarget: number;
  scrollAmount: number;
  setScroll: (scroll: number) => void;
}

const RowVirtualizerDynamic: React.FC<coolScroll> = (props: coolScroll) => {
  const fetchData = async (force = false) => {
    // whatever virtualization we are using we have to scroll to the last index after appending the list if implementing reverse infinite scrolling
    setIsLoading(true);

    setHasMoreQuotes({
      bottom: true,
    });

    scrollRef.current = props.getNewData();

    setTimeout(() => setIsLoading(false), 100);
  };
  const maxElementHeight = 2000;

  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMoreQuotes, setHasMoreQuotes] = React.useState({
    bottom: true,
  });

  const bottomRef = React.useRef(null);
  const topRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<number>(undefined);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const count = props.object.length;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => maxElementHeight,
    initialOffset: props.scrollAmount * maxElementHeight,
    overscan: 0,
    enabled: true,
  });

  React.useEffect(() => {
    parentRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      parentRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [parentRef.current]);

  React.useEffect(() => {
    // On scroll to item
    if (props.doSmoothScroll && props.smoothScrollTarget) {
      setTimeout(
        () =>
          virtualizer.scrollToIndex(props.smoothScrollTarget, {
            align: "start",
            behavior: "smooth",
          }),
        100
      );
    }
  }, [props.doSmoothScroll]);

  React.useEffect(() => {
    //On new items in array
    //virtualizer.scrollToIndex(props.scrollAmount, { align: "start" });
    virtualizer.getVirtualItems().forEach((el) => {
      virtualizer.measureElement(virtualizer.elementsCache.get(el.key));
    });
    if (count && scrollRef.current) {
      const ref = scrollRef.current;
      if (ref) {
        virtualizer.scrollToIndex(ref, { align: "start" });
        setHasMoreQuotes({ bottom: true });
      }
      scrollRef.current = undefined;
    } else {
      //new items added not to top

      if (
        topRef.current &&
        topRef.current.getBoundingClientRect().bottom <=
          window.innerHeight + maxElementHeight
      ) {
        console.log(
          topRef.current.getBoundingClientRect().bottom,
          window.innerHeight
        );
        //at bottom of screen
        virtualizer.scrollToIndex(count - 1, { align: "end" });
      }
    }
  }, [count]);

  React.useEffect(() => {
    // On go to top
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (
            entry.target.id === "bottom" &&
            hasMoreQuotes.bottom &&
            !isLoading
          ) {
            fetchData();
          }
        }
      });
    });
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMoreQuotes, hasMoreQuotes.bottom, isLoading]);

  const handleScroll = () => {
    if (virtualizer.scrollOffset) {
      const x = virtualizer.getVirtualItemForOffset(virtualizer.scrollOffset);
      if (x && x.key) {
        const y = virtualizer.elementsCache.get(x?.key);
        if (x?.index && y && y.getBoundingClientRect().top) {
          props.setScroll(x.index);
        }
      }
    }
  };

  return (
    <div className="container" style={{ width: "100%", height: "100%" }}>
      <div
        ref={parentRef}
        className="List"
        style={{
          height: `100%`,
          width: `100%`,
          overflow: "auto",
        }}
      >
        <div
          ref={topRef}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <div id="bottom" ref={bottomRef} />

          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              id={`item-${virtualRow.index}`}
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {props.object[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RowVirtualizerDynamic;
