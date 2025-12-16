import { useState, type MouseEvent } from "react";
import type { FileMeta } from "../components/fileTypes";
import { buildRange, mergeSelection } from "../components/helpers/fileListHelpers";

export function useFileSelection(displayedFiles: FileMeta[]) {
    const [selected, setSelected] = useState<string[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const onRowClick = (
        id: string,
        index: number,
        e: MouseEvent<any>
    ) => {
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && lastSelectedIndex !== null) {
            const range = buildRange(displayedFiles, lastSelectedIndex, index);
            setSelected(prev => mergeSelection(prev, range));
            return;
        }

        if (e.shiftKey && lastSelectedIndex !== null) {
            const range = buildRange(displayedFiles, lastSelectedIndex, index);
            setSelected(range);
            return;
        }

        if (e.metaKey || e.ctrlKey) {
            setSelected(prev =>
                prev.includes(id)
                    ? prev.filter(x => x !== id)
                    : [...prev, id]
            );
            setLastSelectedIndex(index);
            return;
        }

        setSelected([id]);
        setLastSelectedIndex(index);
    };

    return {
        selected,
        setSelected,
        lastSelectedIndex,
        setLastSelectedIndex,
        onRowClick
    };
}
