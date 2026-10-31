import { useContext, useCallback } from "react";
import { ModalContext } from "@/components/modal-provider";
import {
  ConfirmDialog,
  ConfirmDialogOptions,
} from "@/components/ui/confirm-dialog";

export const useConfirm = () => {
  const modalContext = useContext(ModalContext);
  if (!modalContext) {
    throw new Error("useConfirm must be used within a ModalProvider");
  }

  const { openModal, closeModal } = modalContext;

  const confirm = useCallback(
    (options: ConfirmDialogOptions) => {
      return new Promise((resolve) => {
        openModal(
          ConfirmDialog,
          { options },
          { size: "sm", showCloseButton: false },
          (result: boolean) => resolve(result)
        );
      });
    },
    [openModal]
  );

  return confirm;
};
