
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import mkdirp from 'mkdirp'

const _readFile = promisify(fs.readFile)
const _writeFile = promisify(fs.writeFile)

export function cwdPath (file_path: string|string[]): string {
  return path.resolve.apply(path, [process.cwd()].concat(
    file_path instanceof Array
      ? file_path.map(path => path.replace(/^\//, ''))
      : file_path
  ))
}

export async function mkdirP (file_path: string|string[]): Promise<void> {
  await mkdirp(cwdPath(file_path))
}

export async function readTextFile (file_path: string|string[], charset: string = 'utf8'): Promise<string|Buffer> {
  return await _readFile(cwdPath(file_path), charset)
}

export async function writeTextFile (file_path: string|string[], data: string|Buffer, charset: string = 'utf8'): Promise<void> {
  await mkdirP(path.dirname(cwdPath(file_path)))
  return await _writeFile(cwdPath(file_path), data, charset)
}
