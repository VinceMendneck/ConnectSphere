export const theme = {
  home: {
    container: `
      flex-1
      p-4
      bg-[#ffffff]
      min-h-screen
      w-full
    `,
    containerDark: `
      flex-1
      p-4
      bg-[#121212]
      min-h-screen
      w-full
    `,
    header: `
      flex
      justify-between
      items-center
      mb-4
    `,
    title: `
      text-2xl
      font-semibold
      text-[#213547]
    `,
    titleDark: `
      text-2xl
      font-semibold
      text-[#e2e8f0]
    `,
    themeToggleButton: `
      theme-toggle
      cursor-pointer
      p-1
      rounded-full
      bg-transparent
      text-gray-800
      border-none
      outline-none
    `,
    themeToggleButtonDark: `
      theme-toggle
      cursor-pointer
      p-1
      rounded-full
      bg-[#ffffff]
      text-yellow-500
      border-none
      outline-none
    `,
    postFormContainer: `
      mb-4
      bg-[#ffffff]
      p-4
      rounded-lg
      shadow-sm
      border
      border-[#e5e7eb]
    `,
    postFormContainerDark: `
      mb-4
      bg-[#1f1f1f]
      p-4
      rounded-lg
      shadow-sm
      border
      border-[#444444]
    `,
    textarea: `
      w-full
      p-3
      border
      rounded-lg
      bg-[#ffffff]
      text-[#213547]
      border-[#e5e7eb]
      focus:outline-none
      focus:ring-2
      focus:ring-[#444444]
      resize-none
    `,
    textareaDark: `
      w-full
      p-3
      border
      rounded-lg
      bg-[#1f1f1f]
      text-[#e2e8f0]
      border-[#444444]
      focus:outline-none
      focus:ring-2
      focus:ring-[#555555]
      resize-none
    `,
    postFormFooter: `
      flex
      justify-between
      items-center
      mt-2
    `,
    charCount: `
      text-sm
      text-[#6b7280]
    `,
    charCountDark: `
      text-sm
      text-[#9ca3af]
    `,
    postButton: `
      primary
      cursor-pointer
      px-3
      py-1.5
      rounded-lg
      bg-[#ffffff]
      text-[#213547]
      border-none
      outline-none
    `,
    postButtonDark: `
      primary
      cursor-pointer
      px-3
      py-1.5
      rounded-lg
      bg-[var(--button-primary-bg)]
      text-[var(--button-primary-text)]
      border-none
      outline-none
      hover:bg-[#444444]
    `,
    noUserMessage: `
      text-[#6b7280]
      mb-4
    `,
    noUserMessageDark: `
      text-[#9ca3af]
      mb-4
    `,
    link: `
      bg-transparent
      hover:text-gray-700
    `,
    postList: `
      space-y-4
    `,
    emptyPostMessage: `
      text-[#6b7280]
    `,
    emptyPostMessageDark: `
      text-[#9ca3af]
    `,
    postContainer: `
      bg-[#ffffff]
      p-4
      rounded-lg
      shadow-sm
      border
      border-[#e5e7eb]
    `,
    postContainerDark: `
      bg-[#1f1f1f]
      p-4
      rounded-lg
      shadow-sm
      border
      border-[#444444]
    `,
    postContent: `
      text-[#213547]
    `,
    postContentDark: `
      text-[#e2e8f0]
    `,
    postMeta: `
      text-sm
      text-[#6b7280]
      mt-2
    `,
    postMetaDark: `
      text-sm
      text-[#9ca3af]
      mt-2
    `,
    hashtagLink: `
      text-[#3b82f6]
      hover:text-[#1d4ed8]
    `,
    likeButton: `
      flex
      items-center
      space-x-1
      text-gray-500
      hover:text-red-500
    `,
    likeButtonDark: `
      flex
      items-center
      space-x-1
      text-gray-400
      hover:text-red-400
    `,
    likedButton: `
      flex
      items-center
      space-x-1
      text-red-500
    `,
    likedButtonDark: `
      flex
      items-center
      space-x-1
      text-red-400
    `,
    imageUploadButton: `
      cursor-pointer
      px-3
      py-1.5
      rounded-lg
      bg-[var(--button-primary-bg)]
      text-[var(--button-primary-text)]
      border-none
      outline-none
      hover:bg-[#444444]
      hover:text-[var(--button-primary-text-hover)]
    `,
    imageUploadButtonLight: `
      cursor-pointer
      px-3
      py-1.5
      rounded-lg
      bg-transparent
      text-[#213547]
      border-none
      outline-none
    `,
    imageContainer: `
      max-width: 320px
      width: 100%
      margin: 0 auto
      padding: 4px
    `,
  },
}