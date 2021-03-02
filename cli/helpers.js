
const path = require('path')
const { exec } = require('child_process')

const minimatch = require('minimatch')

async function _reducePromises (promisesList, result) {
  const next = promisesList.shift()

  if (!next) return result

  return _reducePromises(
    promisesList,
    await next.run(result)
  )
}

function _round (num, decimals) {
  var _pow = Math.pow(10, decimals)
  return Math.round(num * _pow) / _pow
}

module.exports = {

  async reducePromises (promisesList) {
    return await _reducePromises(
      promisesList.map((run) => run instanceof Function ? { run } : run)
    )
  },

  matchFilters (filters) {
    const _filters = filters.map(
      (pattern) => {
        return pattern[0] === '!'
          ? {
            exclusion: true,
            matches: minimatch.filter(pattern.substr(1)),
          }
          : { matches: minimatch.filter(pattern) }
      }
    )

    return (filepath) => {
      var matched = false
      
      _filters.forEach(
        (_) => {
          if (_.exclusion) {
            if (matched && _.matches(filepath)) matched = false
          } else if (!matched && _.matches(filepath)) {
            matched = true
          }
        }
      )
      
      return matched
    }
  },

  reducePatterns (patternList) {
    const patterns = []
    var current = null

    patternList.forEach((param, i) => {
      if (i % 2) {
        current.command = param
        patterns.push(current)
      } else {
        current = {
          pattern: param.trim(),
        }
      }
    })

    return patterns
  },

  getFileENV (filepath, options = {}) {
    const { cwd = null } = options

    const parsed = path.parse(filepath)

    return {
      FILE_BASE: parsed.base,
      FILE_NAME: parsed.name,
      FILE_EXT: parsed.ext,
      FILE_PATH: filepath,
      FILE_DIR: parsed.dir,
      FILE_CWD: cwd || '.',
      FILE_CWDPATH: path.relative(
        process.cwd(),
        cwd ? path.resolve(cwd, filepath) : filepath
      ),
      FILE_CWDDIR: path.relative(
        process.cwd(),
        cwd ? path.resolve(cwd, parsed.dir) : parsed.dir
      ) || '.',
      FILE_ROOTPATH: cwd
        ? path.resolve(process.cwd(), cwd, filepath)
        : path.resolve(process.cwd(), filepath)
      ,
    }
  },

  runCommand (command, options = {}) {
    return new Promise(function (resolve, reject) {
      const cp = exec(command, {
        env: options.env
          ? {
            ...process.env,
            ...options.env,
          }
          : (options.orphan_env || process.env),
      }, (err, _stdout, _stderr) => {
        if (err) reject(err)
        resolve()
      })
      if (options.stdout) cp.stdout.pipe(process.stdout)
      if (options.stderr || options.stdout) cp.stderr.pipe(process.stderr)
    })
  },

  getmSeconds (time) {
    if (time > 1000) return _round(time / 1000, 2) + 's'
    return _round(time, 2) + 'ms'
  },

}
