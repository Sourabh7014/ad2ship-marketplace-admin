"use client";

import React, { createContext, useState, ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalContextType {
  openModal: <T = any, R = any>(
    content: React.ComponentType<any>,
    data?: T,
    options?: ModalOptions,
    onClose?: (result: R) => void
  ) => void;
  closeModal: <R = any>(result?: R) => void;
}

export interface ModalOptions {
  size?: ModalSize;
  showCloseButton?: boolean;
}

export const ModalContext = createContext<ModalContextType | undefined>(
  undefined
);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] =
    useState<React.ComponentType<any> | null>(null);
  const [modalData, setModalData] = useState<any | null>(null);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});
  const [onCloseCallback, setOnCloseCallback] = useState<
    ((result: any) => void) | null
  >(null);

  const openModal = (
    content: React.ComponentType<any>,
    data: any = {},
    options?: ModalOptions,
    onClose: ((result: any) => void) | null = null
  ) => {
    console.log("Modal opened with options:", options);
    setModalContent(() => content); 
    setModalData(data);
    setModalOptions(options || {});
    setOnCloseCallback(() => onClose); 
    setIsModalOpen(true);
  };

  const closeModal = (result: any = null) => {
    setIsModalOpen(false);
    if (onCloseCallback) {
      onCloseCallback(result);
    }
    
    setTimeout(() => {
      setModalContent(null);
      setModalData(null);
      setOnCloseCallback(null);
    }, 300);
  };

  const dynamicContent = modalContent
    ? React.createElement(modalContent, {
        ...modalData,
        onConfirm: closeModal, 
      })
    : null;

  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "w-[95vw] sm:max-w-[850px] md:max-w-[950px] lg:max-w-[1050px]",
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent
          className={sizeClasses[modalOptions.size ?? "md"]}
          showCloseButton={modalOptions.showCloseButton ?? true}
        >
          {dynamicContent}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
};
