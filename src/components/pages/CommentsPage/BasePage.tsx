import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import CommentList from "../../widgets/CommentList/CommentList";
import ButtonHeader from "../../widgets/Header/Header";
import { mockPosts, Post } from "../../../models/Post/types";
import PostList from "../../widgets/PostList/PostList";
import DialogBoxSummary, {
  SummaryBoxContext,
} from "../../widgets/dialogBoxes/dialogBoxSummary";
import ApiKeyBox from "../../widgets/auth/ApiKeyBox";
import { Breadcrumb } from "antd";
import CreatePostDialog from "../../widgets/CreatePostDialog/CreatePostDialog";
import PostStatusDialog from "../../widgets/PostStatusDialog/PostStatusDialog";
import { publish } from "../../logic/event";
import WelcomeDialog from "../../widgets/auth/WelcomeDialog";
import LoginDialog from "../../widgets/auth/LoginDialog";
import RegisterDialog from "../../widgets/auth/RegisterDialog";
import { getPosts } from "../../../api/api";
import MeDialog from "../../widgets/auth/MeDialog";
import Cookies from "universal-cookie";
import { WebSocketContext } from "../../../api/comments";
import { ReadyState } from "react-use-websocket";

const BasePage: React.FC = () => {
  const [showDiaAPI, setShowDiaAPI] = useState(false);
  const [showDiaSummary, setShowDiaSummary] = useState(false);
  const [showDialogStatusPost, setShowDialogStatusPost] = useState(false);
  const [showDiaCreatePost, setShowDiaCreatePost] = useState(false);
  const [showDiaMe, setShowDiaMe] = useState(false);

  const [showDiaWelcome, setShowDiaWelcome] = useState(false);
  const [showDiaLogin, setShowDiaLogin] = useState(false);
  const [showDiaRegister, setShowDiaRegister] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("1");

  const [summaryLoading, setSummaryLoading] = useState(false);

  const [postId, setPostId] = useState<string>("");

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // чтоб передавать соц сети от создания поста к статусу публикации

  const [posts, setPosts] = useState<Post[]>([]);

  const webSocketmanager = useContext(WebSocketContext);

  useEffect(() => {
    getPosts()
      .then((res: { posts: Post[] }) => {
        if (res.posts) {
          setPosts(res.posts);
        } else {
        }
      })
      .catch(() => {
        console.log("Error getting posts");
      });
  }, []);

  useEffect(() => {
    if (webSocketmanager.readyState == ReadyState.OPEN) {
      webSocketmanager.sendJsonMessage({
        type: "get_comments",
        get_comments: {
          post_union_id:  0,
          offset: "2020-03-26T13:55:57+03:00",
          max_count: 10
        },
      });
      console.log("sent");
    }
  }, [webSocketmanager.readyState]);

  const makeVisibleDialogLogin = () => {
    setShowDiaWelcome(true);
  };

  const makeVisibleDialogMe = () => {
    setShowDiaMe(true);
  };

  const makeVisibleDialogStatusPost = () => {
    setShowDialogStatusPost(true);
  };

  const makeVisibleDialogCreatePost = () => {
    setShowDiaCreatePost(true);
  };

  const handlePostCommentClick = (postId: string) => {
    setPostId(postId);
    setActiveTab("2");
  };

  // для того, чтоб сбрасывать состояние ленты и миниленты
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "1") {
      setPostId("");
    }
  };

  const getMenuButtonsFunc = () => {
    const cookies = new Cookies();
    const session = cookies.get("session");
    if (session) {
      return [
        () => {
          cookies.remove("session");
        },
      ];
    }
    return [
      () => {
        setShowDiaWelcome(false);
        setShowDiaLogin(true);
      },
      () => {
        setShowDiaWelcome(false);
        setShowDiaRegister(true);
      },
    ];
  };

  return (
    <SummaryBoxContext.Provider
      value={{
        setActive: setShowDiaSummary,
        setLoading: setSummaryLoading,
        setPostID: setPostId,
        postId: postId,
        isLoading: summaryLoading,
      }}
    >
      <div className={styles.commentPage}>
        <ButtonHeader
          OnClick1={makeVisibleDialogLogin}
          OnClick2={makeVisibleDialogStatusPost}
          OnClickCreatePost={makeVisibleDialogCreatePost}
          OnClickMe={makeVisibleDialogMe}
          activeTab={activeTab}
          onTabChange={handleTabChange} // для изменения вкладки
        />

        {activeTab === "1" ? (
          <div>
            <PostList posts={posts} onCommentClick={handlePostCommentClick} />
          </div>
        ) : (
          <div>
            {postId && (
              <Breadcrumb
                className={styles["breadcrumb"]}
                items={[
                  {
                    title: (
                      <div
                        className={styles["Post"]}
                        onClick={async () => {
                          setActiveTab("1");
                          await new Promise((res) => setTimeout(res, 1));
                          publish("PostSelected", { id: postId });
                          setPostId("");
                        }}
                      >
                        {"Пост #" + postId}
                      </div>
                    ),
                  },
                  {
                    title: "Комментарии",
                  },
                ]}
              ></Breadcrumb>
            )}

            <CommentList isLoading={false} postId={postId} />
          </div>
        )}

        <ApiKeyBox showBox={showDiaAPI} setShowBox={setShowDiaAPI} />

        <DialogBoxSummary
          title={"Суммаризация комментариев"}
          buttonText={["Повторная суммаризация"]}
          isOpen={showDiaSummary}
        />
      </div>

      <PostStatusDialog
        title={"Публикация поста"}
        buttonText={["Открыть"]}
        onOkClick={[
          () => {
            console.log("Create post dialog confirmed");
          },
        ]}
        onCancelClick={async () => {
          console.log("Create post dialog canceled");
          return "";
        }}
        setOpen={setShowDialogStatusPost}
        isOpen={showDialogStatusPost}
        selectedPlatforms={selectedPlatforms} // Передаем выбранные платформы
      />

      <CreatePostDialog
        title={"Создать пост"}
        onOkClick={[
          () => {
            console.log("Create post dialog confirmed");
            setShowDialogStatusPost(true); // открытие окна статуса
          },
        ]}
        buttonText={["Опубликовать"]}
        setOpen={setShowDiaCreatePost}
        isOpen={showDiaCreatePost}
        selectedPlatforms={selectedPlatforms} // выбранные платформы
        setSelectedPlatforms={setSelectedPlatforms}
      />

      <LoginDialog
        showBox={showDiaLogin}
        setShowBox={setShowDiaLogin}
        onOkClick={[]}
      />
      <RegisterDialog
        showBox={showDiaRegister}
        setShowBox={setShowDiaRegister}
        onOkClick={[]}
      />

      <MeDialog showBox={showDiaMe} setShowBox={setShowDiaMe} onOkClick={[]} />

      <WelcomeDialog
        showBox={showDiaWelcome}
        setShowBox={setShowDiaWelcome}
        onOkClick={getMenuButtonsFunc()}
      />
    </SummaryBoxContext.Provider>
  );
};

export default BasePage;
