import type { FileMeta } from "../fileTypes";
import type { SortKey, SortOrder } from "../FileList";

export function sortFiles(
    files: FileMeta[],
    sortKey: SortKey,
    sortOrder: SortOrder
): FileMeta[] {
    const sorted = [...files].sort((a, b) => {
        let result = 0;

        switch (sortKey) {
            case "name":
                result = a.name.localeCompare(b.name);
                break;
            case "size":
                result = a.size - b.size;
                break;
            case "lastModified":
                result = a.lastModified - b.lastModified;
                break;
            case "starred":
                result = Number(a.starred) - Number(b.starred);
                break;
            case "type":
                const aType = a.name.split(".").pop()?.toLowerCase() || "";
                const bType = b.name.split(".").pop()?.toLowerCase() || "";
                result = aType.localeCompare(bType);
                break;
        }

        return sortOrder === "asc" ? result : -result;
    });

    return sorted;
}

export function buildRange(
    files: FileMeta[],
    startIndex: number,
    endIndex: number
): string[] {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return files.slice(start, end + 1).map(f => f.id);
}

export function mergeSelection(
    prev: string[],
    additional: string[]
): string[] {
    const merged = new Set([...prev, ...additional]);
    return [...merged];
}
