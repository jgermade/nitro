
interface PromiseRunner {
  run: Function
}

async function _reducePromises (promisesList: PromiseRunner[], result?: any): Promise<any> {
  const next = promisesList.shift()

  if (next === undefined) return result

  return await _reducePromises(
    promisesList,
    await next.run(result)
  )
}

export async function reducePromises (promisesList: PromiseRunner[]): Promise<any> {
  return await _reducePromises(
    promisesList.map((run) => run instanceof Function ? { run } : run)
  )
}
