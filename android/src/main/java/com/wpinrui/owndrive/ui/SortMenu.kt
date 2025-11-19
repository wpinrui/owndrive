package com.wpinrui.owndrive.ui

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import com.wpinrui.owndrive.SortKey
import com.wpinrui.owndrive.SortOrder

@Composable
fun SortMenu(
    sortKey: SortKey,
    sortOrder: SortOrder,
    showStarredFirst: Boolean,
    expanded: Boolean,
    onDismissRequest: () -> Unit,
    onSortKeySelected: (SortKey) -> Unit,
    onToggleStarredFirst: () -> Unit
) {
    DropdownMenu(
        expanded = expanded,
        onDismissRequest = onDismissRequest
    ) {
        DropdownMenuItem(
            text = { Text("Sort by Name") },
            onClick = {
                onSortKeySelected(SortKey.NAME)
                onDismissRequest()
            },
            trailingIcon = {
                if (sortKey == SortKey.NAME) {
                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                }
            }
        )

        DropdownMenuItem(
            text = { Text("Sort by Size") },
            onClick = {
                onSortKeySelected(SortKey.SIZE)
                onDismissRequest()
            },
            trailingIcon = {
                if (sortKey == SortKey.SIZE) {
                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                }
            }
        )

        DropdownMenuItem(
            text = { Text("Sort by Last Modified") },
            onClick = {
                onSortKeySelected(SortKey.LAST_MODIFIED)
                onDismissRequest()
            },
            trailingIcon = {
                if (sortKey == SortKey.LAST_MODIFIED) {
                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                }
            }
        )

        DropdownMenuItem(
            text = { Text("Sort by Starred") },
            onClick = {
                onSortKeySelected(SortKey.STARRED)
                onDismissRequest()
            },
            trailingIcon = {
                if (sortKey == SortKey.STARRED) {
                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                }
            }
        )

        DropdownMenuItem(
            text = { Text("Sort by Type") },
            onClick = {
                onSortKeySelected(SortKey.TYPE)
                onDismissRequest()
            },
            trailingIcon = {
                if (sortKey == SortKey.TYPE) {
                    Text(if (sortOrder == SortOrder.ASC) "▲" else "▼")
                }
            }
        )

        HorizontalDivider()

        DropdownMenuItem(
            text = {
                Text(if (showStarredFirst) "⭐ Starred Files First" else "🗄️ Default File Order")
            },
            onClick = {
                onToggleStarredFirst()
                onDismissRequest()
            }
        )
    }
}
