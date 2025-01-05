<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- Header -->
    <div class="p-4 border-b bg-white">
      <SearchBar @search="handleSearch" />
      <SortOptions @sort="handleSort" />
    </div>
    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden p-4">
      <BookmarkTree
        :bookmarks="filteredBookmarks"
        @add-folder="addFolder"
        @add-bookmark="addBookmark"
        @chat="chat"
        @delete="deleteNode"
      />
    </div>
  </div>
</template>

<script>
import SearchBar from '../components/SearchBar.vue';
import SortOptions from '../components/SortOptions.vue';
import BookmarkTree from '../components/BookmarkTree.vue';
import { getBookmarks } from '../browser';

export default {
  components: { SearchBar, SortOptions, BookmarkTree },
  data() {
    return {
      bookmarks: [],
      filteredBookmarks: [],
    };
  },
  async mounted() {
    try {
      const data = await getBookmarks();
      this.bookmarks = data;
      this.filteredBookmarks = data;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  },
  methods: {
    findNodeById(tree, id) {
      for (const node of tree) {
        if (node.id === id) return node;
        if (node.children) {
          const childNode = this.findNodeById(node.children, id);
          if (childNode) return childNode;
        }
      }
      return null;
    },
    handleSearch(query) {
      this.filteredBookmarks = this.filterBookmarks(query);
    },
    handleSort(criteria) {
      this.filteredBookmarks = this.sortBookmarks(this.filteredBookmarks, criteria);
    },

    async addFolder(parentId, name) {
      try {
        const newFolder = await new Promise((resolve) => {
          chrome.bookmarks.create(
            { parentId, title: name },
            resolve
          );
        });
        // Update the local tree to include the new folder
        const parentNode = this.findNodeById(this.bookmarks, parentId);
        if (parentNode && parentNode.children) {
          parentNode.children.push({ ...newFolder, children: [] });
          this.filteredBookmarks = [...this.bookmarks];
        }
      } catch (error) {
        console.error('Error adding folder:', error);
      }
    },
    async addBookmark(parentId, name, url) {
      try {
        const newBookmark = await new Promise((resolve) => {
          chrome.bookmarks.create(
            { parentId, title: name, url },
            resolve
          );
        });
        // Update the local tree to include the new bookmark
        const parentNode = this.findNodeById(this.bookmarks, parentId);
        if (parentNode && parentNode.children) {
          parentNode.children.push(newBookmark);
          this.filteredBookmarks = [...this.bookmarks];
        }
      } catch (error) {
        console.error('Error adding bookmark:', error);
      }
    },

    chat(...args) {
      // Logic to rename a node
      console.log("chat with me", args)
    },
    deleteNode(id) {
      // Logic to delete a node
    },
    async filterBookmarks(query) {
      console.log(query)
      if (!query || query === '') {
        // If no query, reset to full tree
        this.filteredBookmarks = [...this.bookmarks];
        return;
      }

      try {
        // Perform search and get flat array of matching nodes
        const searchResults = await new Promise((resolve) => {
          chrome.bookmarks.search(query, resolve);
        });

        // Get the IDs of matching nodes
        const matchingIds = new Set(searchResults.map((node) => node.id));

        // Reconstruct the filtered tree
        const filterTree = (nodes) => {
          return nodes
            .map((node) => {
              if (matchingIds.has(node.id)) {
                // Include the matching node
                return { ...node, children: node.children ? filterTree(node.children) : [] };
              } else if (node.children) {
                // Include parents of matching nodes
                const filteredChildren = filterTree(node.children);
                if (filteredChildren.length > 0) {
                  return { ...node, children: filteredChildren };
                }
              }
              return null; // Exclude non-matching nodes
            })
            .filter((node) => node !== null); // Remove null nodes
        };

        this.filteredBookmarks = filterTree(this.bookmarks);
      } catch (error) {
        console.error('Error filtering bookmarks:', error);
      }
    },
    sortBookmarks(bookmarks, criteria) {
      return bookmarks.sort((a, b) => a.name.localeCompare(b.name));
    },
  },
};
</script>
