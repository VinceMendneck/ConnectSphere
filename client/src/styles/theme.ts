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
      placeholder:text-[#6b7280] // Cor do placeholder no modo claro
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
      placeholder:text-[#9ca3af] // Cor do placeholder no modo escuro
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
      cursor-pointer
      px-3
      py-1.5
      rounded-lg
      bg-transparent
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
  auth: {
    container: `
      container
      mx-auto
      p-6
      bg-[#ffffff]
      min-h-screen
      flex
      flex-col
      items-center
    `,
    containerDark: `
      container
      mx-auto
      p-6
      bg-[#121212]
      min-h-screen
      flex
      flex-col
      items-center
    `,
    title: `
      text-xl
      font-semibold
      text-[#213547]
      mb-[50px]
    `,
    titleDark: `
      text-xl
      font-semibold
      text-[#e2e8f0]
      mb-[50px]
    `,
    input: `
      w-full
      max-w-md
      p-2.5
      border
      rounded-lg
      bg-[#ffffff]
      text-[#213547]
      border-[#e5e7eb]
      mb-3
      focus:outline-none
      focus:ring-2
      focus:ring-[#444444]
    `,
    inputDark: `
      w-full
      max-w-md
      p-2.5
      border
      rounded-lg
      bg-[#1f1f1f]
      text-[#e2e8f0]
      border-[#444444]
      mb-3
      focus:outline-none
      focus:ring-2
      focus:ring-[#555555]
    `,
    button: `
      px-4
      py-2
      rounded-lg
      bg-blue-600
      text-[#213547]
      font-semibold
      hover:text-[#4591d6]
      transition-colors
      duration-200
    `,
    buttonDark: `
      px-4
      py-2
      rounded-lg
      bg-blue-500
      text-white
      font-semibold
      hover:text-[#4591d6]
      transition-colors
      duration-200
    `,
    noUserMessage: `
      text-[#6b7280]
      mt-3
    `,
    noUserMessageDark: `
      text-[#9ca3af]
      mt-3
    `,
    link: `
      text-[#3b82f6]
      hover:text-[#1d4ed8]
    `,
  },
  hashtag: {
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
    title: `
      text-xl
      font-semibold
      text-[#213547]
    `,
    titleDark: `
      text-xl
      font-semibold
      text-[#e2e8f0]
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
    link: `
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
  },
  profile: {
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
    title: `
      text-xl
      font-semibold
      text-[#213547]
    `,
    titleDark: `
      text-xl
      font-semibold
      text-[#e2e8f0]
    `,
    info: `
      text-sm
      text-[#6b7280]
      mb-4
    `,
    infoDark: `
      text-sm
      text-[#9ca3af]
      mb-4
    `,
    bioContainer: `
      bg-[#f9fafb]
      p-4
      rounded-lg
      max-w-2xl
      mx-auto
      flex
      flex-col
      items-center
      text-center
      border
      border-[#e5e7eb]
    `,
    bioContainerDark: `
      bg-[#1f1f1f]
      p-4
      rounded-lg
      max-w-2xl
      mx-auto
      flex
      flex-col
      items-center
      text-center
      border
      border-[#444444]
    `,
    bioText: `
      text-[#213547]
      text-lg
      min-h-[96px]
      flex
      items-center
      justify-center
      w-full
    `,
    bioTextDark: `
      text-[#e2e8f0]
      text-lg
      min-h-[96px]
      flex
      items-center
      justify-center
      w-full
    `,
    tab: `
      px-4
      py-2
      rounded-lg
      font-semibold
      text-[#213547]
      bg-gray-200
      hover:text-[#4591d6]
      transition-colors
      duration-200
    `,
    tabDark: `
      px-4
      py-2
      rounded-lg
      font-semibold
      text-[#e2e8f0]
      bg-gray-700
      hover:text-[#4591d6]
      transition-colors
      duration-200
    `,
    tabActive: `
      px-4
      py-2
      rounded-lg
      bg-blue-600
      text-[#4591d6]
      hover:text-[#4591d6]
      font-semibold
      transition-colors
      duration-200
    `,
    tabActiveDark: `
      px-4
      py-2
      rounded-lg
      bg-blue-400
      text-[#4591d6]
      hover:text-[#4591d6]
      font-semibold
      transition-colors
      duration-200
    `,
    editBioButton: `
      px-4
      py-2
      rounded-lg
      bg-blue-600
      text-[#213547]
      font-semibold
      hover:text-[#4591d6]
      transition-colors
      duration-200
    `,
    editBioButtonDark: `
      px-4
      py-2
      rounded-lg
      bg-blue-500
      text-[#ffffff]
      font-semibold
      hover:text-[#4591d6]
      transition-colors
      duration-200
    `,
    postList: `
      space-y-4
    `,
    emptyMessage: `
      text-[#6b7280]
    `,
    emptyMessageDark: `
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
    cancelButton: `
      px-4
      py-2
      rounded-lg
      bg-blue-600
      text-[#213547]
      font-semibold
      hover:text-[#b81116]
      transition-colors
      duration-200
    `,
    cancelButtonDark: `
      px-4
      py-2
      rounded-lg
      bg-red-500
      text-white
      font-semibold
      hover:text-[#b81116]
      transition-colors
      duration-200
    `,
  },
  sidebar: {
    container: `
      w-64
      bg-[#ffffff]
      h-screen
      p-6
      flex
      flex-col
      border-r
      border-[#e5e7eb]
      overflow-hidden
    `,
    containerDark: `
      w-64
      bg-[#121212]
      h-screen
      p-6
      flex
      flex-col
      border-r
      border-[#444444]
      overflow-hidden
    `,
    logo: `
      text-xl
      font-semibold
      text-[#213547]
      whitespace-nowrap
    `,
    logoDark: `
      text-xl
      font-semibold
      text-[#e2e8f0]
      whitespace-nowrap
    `,
    nav: `
      flex
      flex-col
      space-y-2
    `,
    link: `
      bg-transparent
      text-[#213547]
      py-2
      px-4
      rounded
      transition-colors
      duration-200
    `,
    linkDark: `
      bg-transparent
      text-[#e2e8f0]
      py-2
      px-4
      rounded
      transition-colors
      duration-200
    `,
    button: `
      bg-transparent
      text-[#213547]
      py-2
      px-4
      rounded
      text-left
      transition-colors
      duration-200
    `,
    buttonDark: `
      bg-transparent
      text-[#e2e8f0]
      py-2
      px-4
      rounded
      text-left
      transition-colors
      duration-200
    `,
    mobileContainer: `
      fixed
      top-0
      left-0
      w-full
      bg-[#ffffff]
      px-4
      flex
      justify-between
      items-center
      border-b
      border-[#e5e7eb]
      z-50
      h-12
    `,
    mobileContainerDark: `
      fixed
      top-0
      left-0
      w-full
      bg-[#121212]
      px-4
      flex
      justify-between
      items-center
      border-b
      border-[#444444]
      z-50
      h-12
    `,
    hamburgerButton: `
      p-2
      text-gray-800
      hover:text-gray-600
    `,
    hamburgerButtonDark: `
      p-2
      text-gray-200
      hover:text-gray-400
    `,
    mobileMenu: `
      fixed
      top-[48px]
      left-0
      w-full
      bg-[#ffffff]
      flex
      flex-col
      space-y-2
      p-4
      border-b
      border-[#e5e7eb]
      z-40
    `,
    mobileMenuDark: `
      fixed
      top-[48px]
      left-0
      w-full
      bg-[#121212]
      flex
      flex-col
      space-y-2
      p-4
      border-b
      border-[#444444]
      z-40
    `,
    logoCentered: `
      flex
      items-center
      justify-center
      w-full
      text-center
      h-full
    `,
  },
};