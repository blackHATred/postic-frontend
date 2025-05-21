import React, { memo, useRef, useState, useCallback } from 'react';
import { Button } from 'antd';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import CommentComponent from '../../cards/Comment/Comment';
import styles from './styles.module.scss';
import { CommentWithChildren } from './commentTree';
import './selected_style.css';

const MAX_NESTING_LEVEL = 4;

interface CommentItemProps {
  comment: CommentWithChildren;
  level: number;
  isLastInChain?: boolean;
}
const Comm = memo(
  CommentComponent,
  (c_1, c_2) =>
    c_1.comment.id == c_2.comment.id &&
    c_1.comment.attachments == c_2.comment.attachments &&
    c_1.comment.text == c_2.comment.text,
);

const CommentTreeItem: React.FC<CommentItemProps> = ({ comment, level }) => {
  const [comm, setComm] = useState(comment);
  // Local state for immediate collapse toggle
  const [collapsedLocal, setCollapsedLocal] = useState(false);
  const hasChildren = comment.children && comment.children.length > 0;
  const visibleLevel = level % MAX_NESTING_LEVEL;
  const isResetLevel = level > 0 && visibleLevel === 0;
  const repliesRef = useRef<HTMLDivElement>(null);

  const levelColors = ['#ddeffd', '#BAE0FF', '#91CAFF', '#69B1FF'];
  const lineColor = levelColors[visibleLevel % levelColors.length];
  const refer = useRef<HTMLDivElement>(null);
  const [deletedCount, setDeletedCount] = useState(0);

  React.useEffect(() => {
    setComm(comment);
  }, [comment.children]);

  // Мемоизированный обработчик для предотвращения лишних перерисовок
  const handleToggleCollapse = useCallback(() => {
    if (!hasChildren) return;

    // Более эффективная анимация с использованием CSS-классов
    if (repliesRef.current) {
      if (!collapsedLocal) {
        // Скрываем комментарии
        repliesRef.current.classList.add(styles.collapsed);
      } else {
        // Показываем комментарии
        repliesRef.current.classList.remove(styles.collapsed);
      }
    }

    setCollapsedLocal((prev) => !prev);
  }, [comm.id, collapsedLocal, hasChildren]);

  return (
    <div className={styles.commentTreeItem} ref={refer}>
      <div className={isResetLevel ? styles.resetLevel : ''}>
        {isResetLevel && (
          <div className={styles.continuationIndicator}>
            <div className={styles.continuationLine} style={{ backgroundColor: lineColor }}></div>
            <span className={styles.levelInfo}>Продолжение ветки (уровень {level})</span>
          </div>
        )}

        {/* Используем мемоизированные компоненты, чтобы избежать ненужных перерисовок */}
        <Comm comment={comm} />

        {/* Кнопка разворачивания/сворачивания появляется только если есть дочерние комментарии */}
        {hasChildren && comm.children.length - deletedCount > 0 && (
          <Button
            type='text'
            icon={collapsedLocal ? <CaretRightOutlined /> : <CaretDownOutlined />}
            onClick={handleToggleCollapse}
            className={styles.collapseButton}
          >
            {collapsedLocal ? 'Показать ответы' : 'Скрыть ответы'} (
            {comm.children.length - deletedCount})
          </Button>
        )}
      </div>

      {/* Рендерим дочерние комментарии всегда и используем CSS-классы для анимации */}
      {hasChildren && (
        <div
          ref={repliesRef}
          className={`${styles.commentReplies} ${collapsedLocal ? styles.collapsed : ''}`}
          style={{
            borderLeft: `2px solid ${lineColor}`,
            paddingLeft: isResetLevel ? '15px' : '10px',
          }}
        >
          {comm.children.map((child, idx) => (
            <CommentTreeItem
              key={child.id}
              comment={child}
              level={level + 1}
              isLastInChain={idx === comm.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const equal_children = (c_1: CommentWithChildren, c_2: CommentWithChildren) => {
  if (c_1.children.length == c_2.children.length) {
    if (c_1.children.length == 0) return true;
    for (let i = 0; i < c_1.children.length; i++) {
      if (!equal_children(c_1.children[i], c_2.children[i])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};
// Улучшенный вариант memo для предотвращения ненужных ререндеров
export default memo(CommentTreeItem, (prevProps, nextProps) => {
  // Сравниваем только то, что может измениться и влияет на рендеринг
  return (
    prevProps.level === nextProps.level &&
    prevProps.comment.id === nextProps.comment.id &&
    equal_children(prevProps.comment, nextProps.comment)
  );
});
