type AnyFunction = (...args: any[]) => any

/**
 * Executes given function array with given args-array deconstructed, it will always use replace the first param with whatever the response of each function was.
 *
 * @export
 * @param {AnyFunction[]} fns
 * @param {any[]} args
 * @returns {void}
 */
export function executeOnFns<Payload extends any> (
  fns: AnyFunction[],
  payload: Payload,
  otherArgs: any[]
): Payload | void {
  for (const fn of fns) {
    payload = fn(payload, ...otherArgs)
  }
  return payload
}
