type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
interface BookmarkDiff {
  added: BookmarkTreeNode[];
  removed: BookmarkTreeNode[];
  modified: { oldNode: BookmarkTreeNode; newNode: BookmarkTreeNode }[];
}

export async function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve({ title: tabs[0]?.title || '', url: tabs[0]?.url || '' });
      }
    });
  });
}

export const loadTabs = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs ?? []);
      }
    });
  });
};

export const getBookmarks = async () => {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((tree) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tree);
      }
    });
  });
}

export const findMaxBookmarkDate = (node: BookmarkTreeNode): number => {
  // Initialize maxDate with the node's dateAdded or dateGroupModified
  let maxDate = Math.max(node.dateAdded || 0, node.dateGroupModified || 0);

  // If the node has children, iterate over them and recursively find max date
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      maxDate = Math.max(maxDate, findMaxBookmarkDate(child));
    }
  }

  return maxDate;
};


/**
 * Recursively traverse the bookmark tree and build an array of paths to leaf nodes.
 * @param node The current BookmarkTreeNode being traversed.
 * @param currentPath The path constructed so far.
 * @returns An array of full paths to all leaf nodes.
 */
export const buildPathsToLeafNodes = (node: BookmarkTreeNode, currentPath: string[] = []): { url: string, title: string, path: string[] }[] => {
  // Add the current node's title to the path

  // If the node is a leaf (has a URL), return the current path
  if (node.url) {
    return [{
      url: node.url,
      title: node.title,
      path: currentPath
    }];
  }
  const newPath = [...currentPath, node.title];

  // If the node has children, recursively process them
  if (node.children && node.children.length > 0) {
    return node.children.flatMap((child) => buildPathsToLeafNodes(child, newPath));
  }

  // If the node is empty (no URL and no children), return an empty array
  return [];
};


/**
 * Diffs two BookmarkTreeNode structures and returns the differences.
 * @param oldNode The original BookmarkTreeNode.
 * @param newNode The updated BookmarkTreeNode.
 * @returns An object containing added, removed, and modified nodes.
 */
export const diffBookmarkTree = (
  oldNode: BookmarkTreeNode,
  newNode: BookmarkTreeNode
): BookmarkDiff => {
  const added: BookmarkTreeNode[] = [];
  const removed: BookmarkTreeNode[] = [];
  const modified: { oldNode: BookmarkTreeNode; newNode: BookmarkTreeNode }[] = [];

  // Helper function to map children by ID
  const mapChildrenById = (node?: BookmarkTreeNode) => {
    const map = new Map<string, BookmarkTreeNode>();
    node?.children?.forEach((child) => map.set(child.id, child));
    return map;
  };

  const oldChildrenMap = mapChildrenById(oldNode);
  const newChildrenMap = mapChildrenById(newNode);

  // Check for added and modified nodes
  for (const [newId, newChild] of newChildrenMap.entries()) {
    const oldChild = oldChildrenMap.get(newId);
    if (!oldChild) {
      // Node is newly added
      added.push(newChild);
    } else {
      // Node exists in both, check for modifications
      if (
        newChild.title !== oldChild.title ||
        newChild.url !== oldChild.url ||
        newChild.dateAdded !== oldChild.dateAdded ||
        newChild.dateGroupModified !== oldChild.dateGroupModified
      ) {
        modified.push({ oldNode: oldChild, newNode: newChild });
      }

      // Recursively diff the children of this node
      const childDiff = diffBookmarkTree(oldChild, newChild);
      added.push(...childDiff.added);
      removed.push(...childDiff.removed);
      modified.push(...childDiff.modified);
    }
  }

  // Check for removed nodes
  for (const [oldId, oldChild] of oldChildrenMap.entries()) {
    if (!newChildrenMap.has(oldId)) {
      removed.push(oldChild);
    }
  }

  return { added, removed, modified };
};


/**
 * Finds all distinct folders containing bookmarks with URLs in the tree.
 * @param node The root BookmarkTreeNode.
 * @returns An array of folder nodes that contain bookmarks with URLs.
 */
export const findFoldersWithBookmarks = (node: BookmarkTreeNode): BookmarkTreeNode[] => {
  const foldersWithBookmarks: BookmarkTreeNode[] = [];

  /**
   * Recursively check if a node has bookmarks with URLs and collect its folders.
   * @param currentNode The current node being processed.
   * @returns True if the current node or its descendants contain bookmarks with URLs.
   */
  const traverse = (currentNode: BookmarkTreeNode): boolean => {
    let hasBookmarkWithUrl = false;

    // If the node has children, recursively process them
    if (currentNode.children && currentNode.children.length > 0) {
      for (const child of currentNode.children) {
        if (traverse(child)) {
          hasBookmarkWithUrl = true;
        }
      }
    }

    // Check if this node is a folder and contains or leads to bookmarks with URLs
    if (!currentNode.url && hasBookmarkWithUrl) {
      foldersWithBookmarks.push(currentNode);
    }

    // Return true if the node itself is a bookmark with a URL
    return hasBookmarkWithUrl || !!currentNode.url;
  };

  traverse(node);

  return foldersWithBookmarks;
};


/**
 * Search for a URL in the bookmark tree and build the path back to it by following parentId references.
 * @param rootNode The root BookmarkTreeNode to start the search.
 * @param url The URL to search for.
 * @returns An array of titles representing the path to the URL, or null if the URL is not found.
 */
export const findPathToUrl = (
  rootNode: BookmarkTreeNode,
  url: string
): string[] | null => {
  const nodeMap = new Map<string, BookmarkTreeNode>();

  // Helper function to index nodes by ID for fast parent lookup
  const indexNodes = (node: BookmarkTreeNode) => {
    nodeMap.set(node.id, node);
    if (node.children) {
      node.children.forEach(indexNodes);
    }
  };

  // Helper function to search for the URL in the tree
  const searchForUrl = (node: BookmarkTreeNode): BookmarkTreeNode | null => {
    if (node.url === url) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const result = searchForUrl(child);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  // Helper function to build the path back to the root
  const buildPath = (node: BookmarkTreeNode): string[] => {
    const path: string[] = [];
    let currentNode: BookmarkTreeNode | undefined = node;
    while (currentNode) {
      if (currentNode.title) {
        path.unshift(currentNode.title); // Add titles to the path
      }
      currentNode = currentNode.parentId ? nodeMap.get(currentNode.parentId) : undefined;
    }
    return path;
  };

  // Index all nodes for parent lookup
  indexNodes(rootNode);

  // Search for the node with the given URL
  const targetNode = searchForUrl(rootNode);

  // If the URL is found, build the path; otherwise, return null
  return targetNode ? buildPath(targetNode) : null;
};
