// Runs inside a Web Worker: a separate thread with no access to the page, the DOM, or
// localStorage. If learner code loops forever, only this thread is stuck, and the page
// stops it (see runner.ts).
import { checkCode, type RunRequest } from './checker'

addEventListener('message', (event: MessageEvent<RunRequest>) => {
  postMessage(checkCode(event.data))
})
