import { useState, useEffect } from "react";
import type { SortKey, SortOrder } from "../components/FileList";
import { SORT_KEY_STORAGE, SORT_ORDER_STORAGE } from "../constants";

export function useSortPreferences(defaultKey: SortKey, defaultOrder: SortOrder) {
    const [sortKey, setSortKey] = useState<SortKey>(
        (localStorage.getItem(SORT_KEY_STORAGE) as SortKey) || defaultKey
    );
    const [sortOrder, setSortOrder] = useState<SortOrder>(
        (localStorage.getItem(SORT_ORDER_STORAGE) as SortOrder) || defaultOrder
    );

    useEffect(() => {
        localStorage.setItem(SORT_KEY_STORAGE, sortKey);
        localStorage.setItem(SORT_ORDER_STORAGE, sortOrder);
    }, [sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (key === sortKey) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    return { sortKey, sortOrder, handleSort };
}
