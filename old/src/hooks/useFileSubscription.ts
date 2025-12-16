import { collection, onSnapshot, type Firestore } from "firebase/firestore";
import { useState, useEffect } from "react";
import type { FileMeta } from "../components/fileTypes";

export function useFilesSubscription(db: Firestore | null) {
    const [files, setFiles] = useState<FileMeta[]>([]);

    useEffect(() => {
        if (!db) return;

        const unsubscribe = onSnapshot(collection(db, "files"), snapshot => {
            const list: FileMeta[] = snapshot.docs.map(d => ({
                ...(d.data() as FileMeta),
                id: d.id
            }));
            setFiles(list);
        });

        return unsubscribe;
    }, [db]);

    return files;
}
