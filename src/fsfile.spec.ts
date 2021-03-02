/* eslint-disable import/first */

import mkdirp from 'mkdirp'
import {
  cwdPath,
  mkdirP,
} from './fsfile'

jest.mock('mkdirp')

const cwd = process.cwd()

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

test('mkdirP', async () => {
  // mkdirp.mockReturnValue(Promise.resolve())

  await mkdirP('foo/bar')

  expect(mkdirp).toHaveBeenCalledTimes(1)
  expect(mkdirp).toHaveBeenCalledWith(`${cwd}/foo/bar`)
})
