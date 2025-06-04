// client/src/styles/theme.ts
export const theme = {
  home: {
    container: "container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen",
    header: "flex justify-between items-center mb-6",
    title: "text-3xl font-bold text-gray-800 dark:text-white",
    themeToggleButton:
      "px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition",
    postFormContainer: "mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow",
    textarea:
      "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none",
    postFormFooter: "flex justify-between items-center mt-2",
    charCount: "text-sm text-gray-500 dark:text-gray-400",
    postButton:
      "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed",
    noUserMessage: "text-gray-600 dark:text-gray-300 mb-6",
    link: "text-blue-500 hover:underline",
    postList: "space-y-4",
    emptyPostMessage: "text-gray-600 dark:text-gray-300",
    postContainer: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow",
    postContent: "text-gray-800 dark:text-gray-200",
    postMeta: "text-sm text-gray-500 dark:text-gray-400 mt-2",
    hashtagLink: "text-blue-500 hover:underline",
  },
  auth: {
    container: "container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center",
    title: "text-2xl font-bold text-gray-800 dark:text-white mb-6",
    input: "w-full max-w-md p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500",
    button: "w-full max-w-md bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition",
    noUserMessage: "text-gray-600 dark:text-gray-300 mt-4",
    link: "text-blue-500 hover:underline",
  },
};