import { useState, useCallback } from "react";
import { FileSizeConfirmationDialog } from "../components/FileSizeConfirmationDialog";
import { formatFileSize } from "../components/helpers/fileHelpers";

export interface FileSizeConfirmationInfo {
  fileName: string;
  fileSize: number;
  warningLimit: number;
  resolve: (proceed: boolean) => void;
}

export const useFileSizeConfirmation = () => {
  const [confirmation, setConfirmation] = useState<FileSizeConfirmationInfo | null>(null);

  const confirmFileSize = useCallback(
    (
      fileName: string,
      fileSize: number,
      warningLimit: number
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmation({
          fileName,
          fileSize,
          warningLimit,
          resolve: (proceed) => {
            setConfirmation(null);
            resolve(proceed);
          },
        });
      });
    },
    []
  );

  const FileSizeDialogComponent = confirmation ? (
    <FileSizeConfirmationDialog
      isOpen={true}
      fileName={confirmation.fileName}
      fileSize={formatFileSize(confirmation.fileSize)}
      warningLimit={formatFileSize(confirmation.warningLimit)}
      onConfirm={() => confirmation.resolve(true)}
      onCancel={() => confirmation.resolve(false)}
    />
  ) : null;

  return {
    confirmFileSize,
    FileSizeDialogComponent,
  };
};

