# V15.4 — All Cross-Database Matches

Cross-Database Similar Questions no longer limits the result selector to 10/20/50. It defaults to **All matches**.

The engine collects every qualifying Professional Licensure → Global pair, then sorts all matches by similarity before rendering. Exact and high-confidence conceptual matches are preserved.

For very large databases, the UI may render a large result set; the underlying IndexedDB database remains the source of truth.
