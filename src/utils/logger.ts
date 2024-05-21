const logWrapper = (args: any[], log: (...args: any[]) => void) => {
  log(`[@idux/theme]:`, ...args)
}

export const info = (...args: any[]): void => logWrapper(args, console.log)
export const warn = (...args: any[]): void => logWrapper(args, console.warn)
export const error = (...args: any[]): void => logWrapper(args, console.error)