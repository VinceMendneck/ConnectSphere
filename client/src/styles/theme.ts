// client/src/styles/theme.ts
export const theme = {
  home: {
    container: 'flex-1 p-4 bg-[#ffffff] dark:bg-[#4b5563] min-h-screen w-full',
    header: 'flex justify-between items-center mb-4',
    title: 'text-2xl font-semibold text-[#213547] dark:text-[#e2e8f0]',
    themeToggleButton:
      'px-3 py-1 bg-[#f9f9f9] dark:bg-[#1f2937] text-[#213547] dark:text-[#ffffff] text-sm rounded-full hover:bg-[#e5e7eb] dark:hover:bg-[#374151] transition',
    postFormContainer: 'mb-4 bg-[#ffffff] dark:bg-[#374151] p-4 rounded-lg shadow-sm border border-[#e5e7eb] dark:border-[#6b7280]',
    textarea:
      'w-full p-3 border rounded-lg bg-[#ffffff] dark:bg-[#374151] dark:text-[#e2e8f0] dark:border-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none',
    postFormFooter: 'flex justify-between items-center mt-2',
    charCount: 'text-sm text-[#6b7280] dark:text-[#9ca3af]',
    postButton:
      'bg-[#6b7280] text-[#ffffff] px-3 py-1.5 rounded-lg hover:bg-[#4b5563] transition disabled:bg-[#9ca3af] disabled:cursor-not-allowed text-sm',
    noUserMessage: 'text-[#6b7280] dark:text-[#9ca3af] mb-4',
    link: 'text-[#3b82f6] hover:text-[#1d4ed8] dark:hover:text-[#2563eb]',
    postList: 'space-y-4',
    emptyPostMessage: 'text-[#6b7280] dark:text-[#9ca3af]',
    postContainer: 'bg-[#ffffff] dark:bg-[#374151] p-4 rounded-lg shadow-sm border border-[#e5e7eb] dark:border-[#6b7280]',
    postContent: 'text-[#213547] dark:text-[#e2e8f0]',
    postMeta: 'text-sm text-[#6b7280] dark:text-[#9ca3af] mt-2',
    hashtagLink: 'text-[#3b82f6] hover:text-[#1d4ed8] dark:hover:text-[#2563eb]',
  },
  auth: {
    container: 'container mx-auto p-6 bg-[#ffffff] dark:bg-[#4b5563] min-h-screen flex flex-col items-center',
    title: 'text-xl font-semibold text-[#213547] dark:text-[#e2e8f0]',
    input:
      'w-full max-w-md p-2.5 border rounded-lg bg-[#ffffff] dark:bg-[#374151] dark:text-[#e2e8f0] dark:border-[#6b7280] mb-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]',
    button:
      'w-full max-w-md bg-[#6b7280] text-[#ffffff] px-3 py-1.5 rounded-lg hover:bg-[#4b5563] transition text-sm',
    noUserMessage: 'text-[#6b7280] dark:text-[#9ca3af] mt-3',
    link: 'text-[#3b82f6] hover:text-[#1d4ed8] dark:hover:text-[#2563eb]',
  },
  hashtag: {
    container: 'flex-1 p-4 bg-[#ffffff] dark:bg-[#4b5563] min-h-screen w-full',
    title: 'text-xl font-semibold text-[#213547] dark:text-[#e2e8f0]',
    postList: 'space-y-4',
    emptyPostMessage: 'text-[#6b7280] dark:text-[#9ca3af]',
    postContainer: 'bg-[#ffffff] dark:bg-[#374151] p-4 rounded-lg shadow-sm border border-[#e5e7eb] dark:border-[#6b7280]',
    postContent: 'text-[#213547] dark:text-[#e2e8f0]',
    postMeta: 'text-sm text-[#6b7280] dark:text-[#9ca3af] mt-2',
    link: 'text-[#3b82f6] hover:text-[#1d4ed8] dark:hover:text-[#2563eb]',
  },
  sidebar: {
    container: 'w-64 bg-[#ffffff] dark:bg-[#4b5563] h-screen p-6 flex flex-col border-r border-[#e5e7eb] dark:border-[#6b7280]',
    logo: 'text-xl font-semibold text-[#213547] dark:text-[#e2e8f0] mb-6 whitespace-nowrap',
    nav: 'flex flex-col space-y-2',
    link: 'text-[#213547] dark:text-[#e2e8f0] hover:bg-[#f3f4f6] dark:hover:bg-[#374151] px-4 py-2 rounded-lg text-sm',
    button: 'text-[#213547] dark:text-[#e2e8f0] hover:bg-[#f3f4f6] dark:hover:bg-[#374151] px-4 py-2 rounded-lg text-left text-sm',
  },
};