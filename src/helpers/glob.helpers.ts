
import { makeRe } from 'minimatch'

export function matchFilter (filters: string|string[]): Function {
  if (typeof filters === 'string') return matchFilter(filters.trim().split(/ *; */))

  const _filters = filters.map(
    pattern => {
      return pattern[0] === '!'
        ? {
            exclusion: true,
            re: makeRe(pattern.substr(1)),
          }
        : { re: makeRe(pattern) }
    }
  )

  return (file_path: string): boolean => {
    var matched = false
    
    _filters.forEach(_ => {
      const { exclusion = false, re } = _
      if (exclusion) {
        if (matched && re.test(file_path)) matched = false
      } else if (!matched && re.test(file_path)) {
        matched = true
      }
    })
    
    return matched
  }
}
