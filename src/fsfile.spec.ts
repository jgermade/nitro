/* eslint-disable import/first */

jest.mock('mkdirp')

import mkdirp from 'mkdirp'
import {
  cwdPath,
  mkdirP,
} from './fsfile'

const cwd = process.cwd()

describe('cwdPath', () => {
  test
    .each([
      ['foo/bar', `${cwd}/foo/bar`],
      [['foo', 'bar'], `${cwd}/foo/bar`],
      [['foo/', 'bar'], `${cwd}/foo/bar`],
      [['foo', '/bar'], `${cwd}/foo/bar`],
      [['foo/', '/bar'], `${cwd}/foo/bar`],
      [['foo/', '/bar/'], `${cwd}/foo/bar`],
    ])(
      '%s => %s',
      (input, result) => {
        expect(cwdPath(input)).toBe(result)
      },
    )
})

describe('mkdirP', () => {
  test('invocation', async () => {
    await mkdirP('foo/bar')

    expect(mkdirp).toHaveBeenCalledTimes(1)
    expect(mkdirp).toHaveBeenCalledWith(`${cwd}/foo/bar`)
  })
})
