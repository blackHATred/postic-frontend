import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
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
  isCollapsed: boolean;
  onToggleCollapse: (commentId: number) => void;
  collapsedComments: Record<number, boolean>;
  isLastInChain?: boolean;
}

const CommentTreeItem: React.FC<CommentItemProps> = ({
  comment,
  level,
  isCollapsed,
  onToggleCollapse,
  collapsedComments,
}) => {
  // Local state for immediate collapse toggle
  const [collapsedLocal, setCollapsedLocal] = useState(isCollapsed);
  const hasChildren = comment.children && comment.children.length > 0;
  const visibleLevel = level % MAX_NESTING_LEVEL;
  const isResetLevel = level > 0 && visibleLevel === 0;
  const repliesRef = useRef<HTMLDivElement>(null);

  const levelColors = ['#ddeffd', '#BAE0FF', '#91CAFF', '#69B1FF'];
  const lineColor = levelColors[visibleLevel % levelColors.length];
  const refer = useRef<HTMLDivElement>(null);

  // Используем useEffect с задержкой для более эффективного обновления
  useEffect(() => {
    // Не обновляем состояние, если дочерних комментариев нет
    if (!hasChildren) return;

    setCollapsedLocal(isCollapsed);
  }, [isCollapsed, hasChildren]);

  const deleteElement = () => {
    if (refer.current) refer.current.className += ' animation';
  };

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
    onToggleCollapse(comment.id);
  }, [comment.id, collapsedLocal, hasChildren, onToggleCollapse]);

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
        <CommentComponent comment={comment} onDelete={deleteElement} />

        {/* Кнопка разворачивания/сворачивания появляется только если есть дочерние комментарии */}
        {hasChildren && (
          <Button
            type='text'
            icon={collapsedLocal ? <CaretRightOutlined /> : <CaretDownOutlined />}
            onClick={handleToggleCollapse}
            className={styles.collapseButton}
          >
            {collapsedLocal ? 'Показать ответы' : 'Скрыть ответы'} ({comment.children.length})
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
          {comment.children.map((child, idx) => (
            <CommentTreeItem
              key={child.id}
              comment={child}
              level={level + 1}
              isCollapsed={!!collapsedComments[child.id]}
              onToggleCollapse={onToggleCollapse}
              collapsedComments={collapsedComments}
              isLastInChain={idx === comment.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Улучшенный вариант memo для предотвращения ненужных ререндеров
export default memo(CommentTreeItem, (prevProps, nextProps) => {
  // Сравниваем только то, что может измениться и влияет на рендеринг
  return (
    prevProps.isCollapsed === nextProps.isCollapsed &&
    prevProps.level === nextProps.level &&
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.children?.length === nextProps.comment.children?.length
  );
});
