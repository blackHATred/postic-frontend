import React from "react";
import BlueButton from "../../ui/Button/Button";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

const ButtonHeader: React.FC = () => {
  return (
    <div>
      {/* Кнопка с текстом и иконкой */}
      <BlueButton text="Скачать" icon={<DownloadOutlined />} />

      {/* Кнопка с текстом и другой иконкой */}
      <BlueButton text="Загрузить" icon={<UploadOutlined />} />

      {/* Кнопка только с текстом (без иконки) */}
      <BlueButton text="Без иконки" />
    </div>
  );
};

export default ButtonHeader;
