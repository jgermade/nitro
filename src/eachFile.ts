
import { promisify } from 'util'
import glob from 'glob'
import minimatch from 'minimatch'

import { reducePromises } from './helpers/async.helpers'

const execGlob = promisify(glob)

export async function _matchFilesReducer (patterns: string[], options?: object, i: number = 0, matchedFiles: string[] = []): Promise<string[]> {
  const pattern = patterns[i]

  if (pattern === undefined) return matchedFiles

  if (/^!/.test(pattern)) {
    const excludeFiles = minimatch.filter(pattern)

    return await _matchFilesReducer(
      patterns,
      options,
      i + 1,
      matchedFiles.filter(excludeFiles)
    )
  }

  const _matchedFiles = await execGlob(pattern, options)

  _matchedFiles.forEach(file_path => {
    if (!matchedFiles.includes(file_path)) matchedFiles.push(file_path)
  })

  return await _matchFilesReducer(patterns, options, i + 1, matchedFiles)
}

export async function matchFiles (patterns: string|string[], options?: object): Promise<string[]> {
  if (typeof patterns === 'string') return await _matchFilesReducer(patterns.split(/ *; */), options)
  return await _matchFilesReducer(patterns, options)
}

interface EachFileOptions {
  concurrent?: boolean
}

export async function eachFile (patterns: string|string[], iteratee: Function, options: EachFileOptions = {}): Promise<any> {
  const matchedFiles = await matchFiles(patterns, options)

  if (options.concurrent === true) {
    return await Promise.all(
      matchedFiles.map(async filepath => { await iteratee(filepath) })
    )
  }

  return await reducePromises(
    matchedFiles.map(filepath => ({
      async run () { await iteratee(filepath) }
    }))
  )
}
