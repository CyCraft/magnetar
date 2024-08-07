/**
 * A countdown which can be restarted and resolves when the provided milliseconds have passed.
 */
export type CountdownInstance = {
  done: Promise<void>
  restart: (newDurationMs?: number) => void
  forceFinish: () => void
}

/**
 * A countdown which can be restarted and resolves when the provided milliseconds have passed.
 *
 * @param {number} ms The amount of milliseconds to count down.
 * @returns {{done: Promise<void>, restart: (newDurationMs?: number) => void}} restart will reset the countdown and start counting down again.
 * @example
 * const countdown = Countdown(1000)
 * // set up what to do when it's finished:
 * countdown.done.then(() => doSomething())
 * // call this every time to restart the countdown:
 * countdown.restart()
 * @author Adam Dorling
 * @contact https://codepen.io/naito
 */
export function Countdown(ms: number): CountdownInstance {
  let startTime = Date.now()
  let interval: any = null
  let resolveTrigger: any = null
  let duration: number = ms
  const done = new Promise<void>((resolve) => (resolveTrigger = resolve))

  function finish() {
    clearInterval(interval)
    interval = null
    if (resolveTrigger) {
      resolveTrigger()
      resolveTrigger = null
    }
  }

  function restart(newDurationMs?: number): undefined {
    if (typeof newDurationMs !== 'undefined') {
      duration = newDurationMs
    }
    startTime = Date.now()
  }

  interval = setInterval(() => {
    const now = Date.now()
    const deltaT = now - startTime

    if (deltaT >= duration) finish()
  }, 10)

  return { done, restart, forceFinish: finish }
}
