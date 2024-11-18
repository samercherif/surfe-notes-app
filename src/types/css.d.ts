declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'tailwindcss/colors' {
  const colors: {
    [key: string]: {
      [key: number]: string
    }
  }
  export default colors
}
