import { useState, useCallback } from "react";
import { CollisionDialog } from "../components/CollisionDialog";
import type { FileMeta } from "../components/fileTypes";

export type CollisionAction = "replace" | "skip" | "rename";

export interface CollisionInfo {
  fileName: string;
  existingFile: FileMeta;
  newFile: File;
  isStarred: boolean;
  resolve: (action: CollisionAction) => void;
}

export const useCollisionResolver = () => {
  const [collision, setCollision] = useState<CollisionInfo | null>(null);

  const resolveCollision = useCallback(
    (
      fileName: string,
      existingFile: FileMeta,
      newFile: File,
      isStarred: boolean
    ): Promise<CollisionAction> => {
      return new Promise((resolve) => {
        setCollision({
          fileName,
          existingFile,
          newFile,
          isStarred,
          resolve: (action) => {
            setCollision(null);
            resolve(action);
          },
        });
      });
    },
    []
  );

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const CollisionDialogComponent = collision ? (
    <CollisionDialog
      isOpen={true}
      fileName={collision.fileName}
      existingFileDate={formatDate(collision.existingFile.lastModified)}
      newFileDate={formatDate(collision.newFile.lastModified)}
      isStarred={collision.isStarred}
      onAction={collision.resolve}
      onClose={() => collision.resolve("skip")}
    />
  ) : null;

  return {
    resolveCollision,
    CollisionDialogComponent,
  };
};

