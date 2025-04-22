import React, { useRef } from 'react';
import { Button } from 'antd';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import CommentComponent from '../../cards/Comment/Comment';
import styles from './styles.module.scss';
import { CommentWithChildren } from './commentTree';
import './selected_style.css';
import { useAppDispatch } from '../../../stores/hooks';
import { removeComment } from '../../../stores/commentSlice';

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
  isLastInChain = false,
}) => {
  const dispatch = useAppDispatch();
  const hasChildren = comment.children && comment.children.length > 0;
  const visibleLevel = level % MAX_NESTING_LEVEL;
  const isResetLevel = level > 0 && visibleLevel === 0;

  const levelColors = ['#ddeffd', '#BAE0FF', '#91CAFF', '#69B1FF'];
  const lineColor = levelColors[visibleLevel % levelColors.length];
  const refer = useRef<HTMLDivElement>(null);

  const deleteElement = () => {
    if (refer.current) refer.current.className += ' animation';
    setTimeout(() => {
      //WARNING: Заменить на удаление комментария на уровне
      dispatch(removeComment([comment]));
    }, 1000);
  };

  return (
    <div className={styles.commentTreeItem} ref={refer}>
      <div className={isResetLevel ? styles.resetLevel : ''}>
        {isResetLevel && (
          <div className={styles.continuationIndicator}>
            <div className={styles.continuationLine} style={{ backgroundColor: lineColor }}></div>
            <span className={styles.levelInfo}>Продолжение ветки (уровень {level})</span>
          </div>
        )}
        <CommentComponent comment={comment} onDelete={deleteElement} />
        {hasChildren && (
          <Button
            type='text'
            icon={isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
            onClick={() => onToggleCollapse(comment.id)}
            className={styles.collapseButton}
          >
            {isCollapsed ? 'Показать ответы' : 'Скрыть ответы'} ({comment.children.length})
          </Button>
        )}
      </div>

      {!isCollapsed && hasChildren && (
        <div
          className={styles.commentReplies}
          style={{
            borderLeft: `2px solid ${lineColor}`,
            paddingLeft: isResetLevel ? '15px' : '10px',
          }}
        >
          {comment.children.map((child, index) => (
            <CommentTreeItem
              key={child.id}
              comment={child}
              level={level + 1}
              isCollapsed={!!collapsedComments[child.id]}
              onToggleCollapse={onToggleCollapse}
              collapsedComments={collapsedComments}
              isLastInChain={index === comment.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(CommentTreeItem);
