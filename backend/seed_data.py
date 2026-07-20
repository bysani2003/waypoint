"""A starter Subject so the app has content on first load. Users add their own beyond this."""

SEED_SUBJECT = {
    "name": "DSA Interview Patterns",
    "description": "The recurring patterns behind most coding-interview problems, from two pointers to dynamic programming.",
}

SEED_MODULES = [
    {"name": "Two Pointers", "tag": "Arrays", "difficulty": 1,
     "summary": "Use two indices moving toward/away from each other to avoid nested loops, typically on sorted data."},
    {"name": "Sliding Window", "tag": "Arrays", "difficulty": 2,
     "summary": "Maintain a window over a contiguous range, expanding/shrinking it to track a running condition in O(n)."},
    {"name": "Fast & Slow Pointers", "tag": "Linked Lists", "difficulty": 2,
     "summary": "Two pointers moving at different speeds to detect cycles or find midpoints in linear structures."},
    {"name": "Binary Search", "tag": "Search", "difficulty": 2,
     "summary": "Repeatedly halve a sorted search space; generalizes to 'search on the answer' problems."},
    {"name": "DFS / Backtracking", "tag": "Trees & Graphs", "difficulty": 3,
     "summary": "Explore all paths recursively, undoing choices (backtracking) when a branch fails constraints."},
    {"name": "BFS", "tag": "Trees & Graphs", "difficulty": 2,
     "summary": "Level-by-level traversal using a queue; used for shortest paths in unweighted graphs."},
    {"name": "Union-Find", "tag": "Graphs", "difficulty": 3,
     "summary": "Track disjoint sets with union/find operations, near O(1) with path compression + union by rank."},
    {"name": "Dynamic Programming - 1D", "tag": "DP", "difficulty": 3,
     "summary": "Break a problem into overlapping subproblems along one dimension, memoize or tabulate."},
    {"name": "Dynamic Programming - 2D", "tag": "DP", "difficulty": 4,
     "summary": "Extend DP to two changing dimensions (e.g. two strings/sequences, grid paths)."},
    {"name": "Heap / Priority Queue", "tag": "Trees", "difficulty": 3,
     "summary": "Maintain a partially ordered structure to repeatedly extract min/max in O(log n)."},
    {"name": "Topological Sort", "tag": "Graphs", "difficulty": 3,
     "summary": "Order nodes in a DAG so every edge points forward; used for dependency resolution."},
    {"name": "Trie", "tag": "Trees", "difficulty": 3,
     "summary": "Prefix tree for efficient string prefix search/insertion, common in autocomplete-style problems."},
    {"name": "Monotonic Stack", "tag": "Stacks", "difficulty": 3,
     "summary": "Maintain a stack in increasing/decreasing order to solve 'next greater/smaller element' problems in O(n)."},
    {"name": "Greedy", "tag": "General", "difficulty": 2,
     "summary": "Make the locally optimal choice at each step; requires proving it leads to a global optimum."},
    {"name": "Bit Manipulation", "tag": "General", "difficulty": 2,
     "summary": "Use bitwise operations for space/time-efficient tricks (XOR pairing, bitmasks for subsets)."},
]
