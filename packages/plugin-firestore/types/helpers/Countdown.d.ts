export declare type CountdownInstance = {
    done: Promise<void>;
    restart: () => void;
};
/**
 * A countdown which can be restarted and resolves when the provided milliseconds have passed.
 *
 * @param {number} ms The amount of milliseconds to count down.
 * @returns {{done: Promise<void>, restart: () => void}} restart will reset the countdown and start counting down again.
 * @example
 * const countdown = Countdown(1000)
 * // set up what to do when it's finished:
 * countdown.done.then(() => doSomething())
 * // call this every time to restart the countdown:
 * countdown.restart()
 * @author Adam Dorling
 * @contact https://codepen.io/naito
 */
export declare function Countdown(ms: number): CountdownInstance;
