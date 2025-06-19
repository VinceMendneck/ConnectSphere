export const theme = {
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
      items-center
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
      items-center
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
  },
};