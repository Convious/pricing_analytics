import 'core-js/features/promise'
import { EventLogger, createEventLogger } from './event'

let accId: string
let cId: string
let eventLogger: EventLogger

function logEvent(eventType: string, body: any): Promise<void> {
    if (!eventLogger) {
        throw new Error('Convious Analytics have not been initialized. Please call init() first.')
    }

    return eventLogger.logEvent(eventType, accId, cId, body)
}

export function logPageView(refererUrl: string, currentUrl: string) {
    return logEvent(
        'PageViewed',
        {
            referer_url: refererUrl,
            current_url: currentUrl,
            browser_info: {
                screen: {
                    height: window.screen ? window.screen.height : 'unknown',
                    width: window.screen ? window.screen.width : 'unknown',
                    orientation: window.screen && window.screen['orientation'] ?
                        window.screen['orientation'].type : 'unknown',
                },
                user_agent: navigator.userAgent,
                platform: navigator.platform,
            }
        }
    )
}

export function logUserEnteredCheckout() {
    return logEvent('UserEnteredCheckout', {})
}

export function logUserSelectedDate() {
    return logEvent('UserSelectedDate', {})
}

export function logUserViewedProducts() {
    return logEvent('UserViewedProducts', {})
}

export function logUserViewedPrices() {
    return logEvent('UserViewedPrices', {})
}

export function logUserAddedAnItemToCart() {
    return logEvent('UserAddedAnItemToCart', {})
}

export interface OrderItem {
    productId: string
    amount: number
    price: number
    eventDate?: Date
    location?: string
}

export interface OrderData {
    orderId: string
    items: OrderItem[]
}

export function logOrderCreated(orderData: OrderData) {
    return logEvent('OrderCreated', {
        order_id: orderData.orderId,
        items: orderData.items.map(i => ({
            product_id: i.productId,
            amount: i.amount,
            price: i.price,
            event_date: i.eventDate,
            location: i.location,
        }))
    })
}

export function logTransaction(orderId: string, totalAmount: number) {
    return logEvent('OrderPaird', {
        order_id: orderId,
        total_amount: totalAmount,
    })
}

export function init(accountId: string, cookieId: string): void {
    accId = accountId
    cId = cookieId
    eventLogger = createEventLogger()
    logPageView(document.referrer, window.location.href)
}
