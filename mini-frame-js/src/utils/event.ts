import { EventEmitter as Event } from 'events'

// TODO: 这个类型会报 TS4058 错误，暂时改成any
const EventEmitter = Event as any
export default new Event() as any
export { EventEmitter }
