// Vite の ?raw で CSS を文字列として読むための宣言。
declare module '*.css?raw' {
  const text: string
  export default text
}
