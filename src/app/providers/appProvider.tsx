import React, { createContext, ReactNode, useState } from 'react';

export const AppContext = createContext({
  isModalOpen: false,
  modalContent: '',
  openModal: (content: string) => {},
  closeModal: () => {},
});

interface AppProviderProps {
  // любой реакт узел
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const openModal = (content: React.SetStateAction<string>) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
  };

  return (
    <AppContext.Provider
      value={{
        isModalOpen,
        modalContent,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
