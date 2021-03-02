
import { reducePromises } from './helpers/async.helpers'
const arrayPush = Array.prototype.push

interface WhenQueue {
  when: Function
  cbFn?: Function
}

interface RunQueue {
  cbFn: Function
}

export class Watcher {
  // options
  when_queue: WhenQueue[] = []
  run_queue: RunQueue[] = []
  processing_changes = false

  // constructor (options = {}) {
  //   this.options = options
  //   this.when_queue = []
  //   this.run_queue = []
  //   this.processing_changes = false
  // }

  when (when: Function, cbFn: Function): this {
    this.when_queue.push({ when, cbFn })
    return this
  }

  run (cbFn: Function): this {
    this.run_queue.push({ cbFn })
    return this
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  process (...args: any[]): Promise<any> {
    if (this.processing_changes) return Promise.resolve()

    // const _this = this
    // const _args = arguments

    const queue = this.when_queue.filter(_ => _.when.apply(this, args))
    
    if (queue.length > 0) arrayPush.apply(queue, this.run_queue)

    this.processing_changes = true
    return reducePromises(
      queue.map(_ => ({
        run () {
          _.cbFn?.apply(this, args)
        }
      }))
    )
      .then((result) => {
        this.processing_changes = false
        return result
      })
  }
}

module.exports = Watcher
