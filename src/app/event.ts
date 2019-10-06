export interface EventLogger {
    logEvent(eventType: string, accountId: string, cookieId: string, body: any): Promise<void>
}

export const ConsoleEventLogger: EventLogger = {
    logEvent: (eventType: string, accountId: string, cookieId: string, body: any): Promise<void> => {
        console.log(eventType, body)
        return Promise.resolve()
    }
}

interface Task<T> {
    work: () => Promise<T>
    resolve: (val: T) => void
    reject: (err: any) => void
}

class WorkQueue<T = void> {
    private tasks: Task<T>[] = []
    private running = 0

    constructor(private concurrency: number = 1) {}

    private async runTask(task: Task<T>) {
        try {
            this.running++
            const result = await task.work()
            task.resolve(result)
        } catch (e) {
            task.reject(e)
        } finally {
            this.running--
            const nextTask = this.tasks.shift()
            if (nextTask) {
                this.runTask(nextTask)
            }
        }
    }

    enqueue(work: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const task = {
                work,
                resolve,
                reject,
            }

            if (this.running < this.concurrency) {
                this.runTask(task)
            } else {
                this.tasks.push(task)
            }
        })
    }
}

function withTimeout<T>(p: Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let finished = false
        p.then(result => {
            if (!finished) {
                finished = true
                resolve(result)
            }
        }, err => {
            if (!finished) {
                finished = true
                reject(err)
            }
        })

        setTimeout(() => {
            if (!finished) {
                finished = true
                reject(new Error(`Operation timed out after ${timeout} ms`))
            }
        }, timeout)
    })
}

export class WebsocketEventLogger {
    private socket: WebSocket|null = null
    private logQueue = new WorkQueue()
    private ackHandlers: (() => void)[] = []

    constructor(private charonUrl: string) {}

    private openSocket(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            try {
                const s = new WebSocket(this.charonUrl)
                s.addEventListener('open', () => {
                    resolve(s)
                    s.removeEventListener('error', reject)
                })
                s.addEventListener('error', reject)
            } catch (e) {
                reject(e)
            }
        })
    }

    private closeSocket = () => {
        if (this.socket) {
            this.socket.close()
            this.socket.removeEventListener('error', this.closeSocket)
            this.socket.removeEventListener('close', this.closeSocket)
            this.socket.removeEventListener('message', this.handleAcks)
        }
        this.socket = null
    }

    private handleAcks = () => {
        for (let i = 0; i < this.ackHandlers.length; i++) {
            this.ackHandlers[i]()
        }
        this.ackHandlers = []
    }

    private async ensureSocketOpen() {
        if (this.socket) {
            return
        }
        this.socket = await this.openSocket()
        this.socket.addEventListener('error', this.closeSocket)
        this.socket.addEventListener('close', this.closeSocket)
        this.socket.addEventListener('message', this.handleAcks)
    }

    private expectAck() {
        return new Promise<void>(resolve => {
            this.ackHandlers.push(resolve)
        })
    }

    private async logEventJob(eventType: string, accountId: string, cookieId: string, body: any) {
        await this.ensureSocketOpen()
        const ack = this.expectAck()
        this.socket!.send(JSON.stringify({
            event_type: 'pricing_api_events',
            cookie_id: cookieId,
            event_data: {
                ...body,
                event_type: eventType,
                account_slug: accountId,
                timestamp: new Date(),
            },
        }))
        await withTimeout(ack, 500)
    }

    async logEvent(eventType: string, accountId: string, cookieId: string, body: any) {
        await this.logQueue.enqueue(() => this.logEventJob(eventType, accountId, cookieId, body))
    }
}

export function createEventLogger(): EventLogger {
    if (process.env.NODE_ENV === 'development') {
        return ConsoleEventLogger
    }

    return new WebsocketEventLogger(process.env.CHARON_URL!)
}
