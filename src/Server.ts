
import * as http from 'http'
import * as fs from 'fs'

import { URL } from 'url'

import { cwdPath } from './fsfile'

interface ServerOptions {
  root_dir: string
  try_files?: Array<string|number>
  error_404?: null|string
}

export class Server {
  private readonly server: any

  constructor (options: ServerOptions) {
    const {
      root_dir = '.',
      // try_files = ['index.html', 404],
      // error_404 = null,
    } = options

    const cwd = process.cwd()
    // this.root_dir = root_dir
    // this.try_files = try_files
    // this.error_404 = error_404

    this.server = http.createServer((req, res) => {
      if (typeof req.url !== 'string') throw new TypeError('req.url should be a string')
      const url = new URL(req.url)

      var readStream = fs.createReadStream(cwdPath([cwd, root_dir, url.pathname]))

      // This will wait until we know the readable stream is actually valid before piping
      readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(res)
      })

      // This catches any errors that happen while creating the readable stream (usually invalid names)
      readStream.on('error', function (err) {
        res.end(err)
      })
    })
  }

  async listen (host: string, port: number): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.server(port, host, (err: any) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = Server
