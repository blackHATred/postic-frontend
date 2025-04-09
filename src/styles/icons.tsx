import {
  LiaTelegram,
  LiaTwitter,
  LiaVk,
  LiaQuestionCircle,
} from "react-icons/lia";

export const getIcon = (platform: string) => {
  switch (platform) {
    case "vk":
      return LiaVk;
    case "tg":
      return LiaTelegram;
    case "twitter":
      return LiaTwitter;
  }
  return LiaQuestionCircle;
};
