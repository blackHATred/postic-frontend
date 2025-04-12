import { FC, useState } from "react";
import { Typography, Input, Divider, Avatar, Button } from "antd";
import DialogBox from "../../ui/dialogBox/DialogBox";
import styles from "./styles.module.scss";

import { validateMinLength } from "../../../utils/validation";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";

import FileUploader from "../CreatePostDialog/FileUploader";
import { setAnswerDialog } from "../../../stores/commentSlice";
import { RightOutlined } from "@ant-design/icons";
import { SendOutlined } from "@ant-design/icons/lib/icons";
import { CommentReply, mockAnswers } from "../../../models/Comment/types";
import { Reply } from "../../../api/api";

const { Text } = Typography;

const AnswerDialog: FC = () => {
  const [replyText, setReplyText] = useState(""); // Состояние для текста поста
  const [validationErrors, setValidationErrors] = useState<string[]>([]); // Состояние для ошибок валидации
  const [fileIDs, setFilesIDs] = useState<string[]>([]); // ID загруженных изображений
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.comments.answerDialog.isOpen);
  const team_id = useAppSelector((state) => state.teams.globalActiveTeamId);

  const selectedComment = useAppSelector(
    (state) => state.comments.selectedComment
  );

  const answers = mockAnswers;

  const setQuickAnswer = (q_ans: string) => {
    setReplyText(q_ans);
  };

  const onOk = () => {
    const errors: string[] = [];

    if (fileIDs.length === 0) {
      const postTextError = validateMinLength(replyText, 3);
      if (postTextError) {
        errors.push(postTextError);
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const req: CommentReply = {
      team_id: team_id,
      comment_id: Number(selectedComment?.id),
      text: replyText,
      attachments: fileIDs,
    };
    console.log("Ответ на коммент", req);
    Reply(req);
    dispatch(setAnswerDialog(false));
  };

  const onCancel = async () => {
    dispatch(setAnswerDialog(false));
  };

  const addFileIDs = (id: string, file: any) => {
    setFilesIDs([...fileIDs, id]);
  };

  return (
    <DialogBox
      bottomButtons={[
        {
          icon: <SendOutlined />,
          text: "Отправить",
          onButtonClick: onOk,
        },
      ]}
      isOpen={isOpen}
      onCancelClick={onCancel}
      title={"Ответ на комментарий"}
      isCenter={true}
    >
      <div className={styles["comment-header"]}>
        <Avatar
          src={null}
          onError={() => {
            console.log("img-error");
            return true;
          }}
        />
        <div className={styles["comment-author"]}>
          <Text strong>
            {selectedComment?.username
              ? selectedComment?.username
              : selectedComment?.id}
          </Text>
          <Text type="secondary" className={styles["comment-time"]}>
            {selectedComment?.created_at
              ? dayjs(selectedComment?.created_at).format("DD.MM.YYYY HH:mm")
              : "Дата не указана"}{" "}
            | tg
          </Text>
        </div>
      </div>
      <Text>{selectedComment?.text}</Text>

      {selectedComment?.text ? (
        <div>
          <Divider>Быстрый ответ</Divider>
          <div className={styles["answers"]}>
            {answers.map((answer, answerIndex) =>
              answer.answers.map((text, index) => (
                <Button
                  shape="round"
                  key={`${answerIndex}-${index}`}
                  icon={<RightOutlined />}
                  type="default"
                  onClick={() => setQuickAnswer(text)}
                >
                  {text}
                </Button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div></div>
      )}

      <Divider>Свой ответ</Divider>

      <div className={styles["post"]}>
        <div className={styles["post-text"]}>
          <Input.TextArea
            rows={3}
            placeholder="Введите текст ответа"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>
        {/* Отображение ошибок валидации */}
        {validationErrors.length > 0 && (
          <div style={{ marginTop: 5 }}>
            {validationErrors.map((error, index) => (
              <Text key={index} style={{ color: "red", display: "block" }}>
                {error}
              </Text>
            ))}
          </div>
        )}

        <FileUploader addFiles={addFileIDs} removeFile={() => {}} />
      </div>
    </DialogBox>
  );
};

export default AnswerDialog;
function validateNotEmptyArray(selectedPlatforms: string[]): string | null {
  return selectedPlatforms.length > 0
    ? null
    : "Не выбраны платформы для публикации.";
}
