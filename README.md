# Convious Analytics

This is a JavaScript library, similar to Google Analytics, that should be added to your website. It allows registering events that are needed for pricing API to function.

## Installing

### By adding a `script` tag

```html
<script type="text/javascript" src="https://resources.convious.com/analytics.js"></script>
```

You can add our script to the `head` element of your website. In order to function properly, this script must be present on every page.

### Using NPM

```shell
npm install @convious/convious-analytics
```

You can also bundle the script in your JavaScript using npm/yarn.

## Initializing

> If installed by adding a script tag:

```javascript
conviousPricing.init(accountId, cookieId);
```

> If installed using npm/yarn:

```javascript
import * as conviousPricing from '@convious/convious-analytics'
conviousPricing.init(accountId, cookieId);
```

In order to function, the library must first be initialized with the ID of your Convious account and the cookie ID of the user.

Parameters:

Name | Type | Required | Description
--------- | ----------- | ----------- | -----------
`accountId` | string | yes | Account ID of your Convious account
`cookieId` | string | yes | Cookie ID of the user browsing the website

## Sending events

Once initialized, events can be sent using the library.

### Page viewed event

```javascript
conviousPricing.logPageView(refererUrl, currentUrl);
```

This event notifies that the user has visited a page in the website. In conventional websites the page visits are logged automatically and this does not need to be called directly. However, if your website is a single-page application, it must be called on each application route change.

Parameters:

Name | Type | Required | Description
--------- | ----------- | ----------- | -----------
`refererUrl` | string | yes | The URL the user is coming from
`currentUrl` | string | yes | The URL the user has arrived in

### User entered checkout event

```javascript
conviousPricing.logUserEnteredCheckout();
```

This event notifies that the user has opened a page where he can buy products or opened a html widget within a page that allows him to buy products.

### User selected date event

```javascript
conviousPricing.logUserSelectedDate();
```

This event notifies that the user has selected event date when buying a product.

### User viewed products event

```javascript
conviousPricing.logUserViewedProducts();
```

This event notifies that the user has seen a list of available products he can buy.

### User viewed prices event

```javascript
conviousPricing.logUserViewedPrices();
```

This event notifies that the user has seen prices for the products.

### User added an item to cart event

```javascript
conviousPricing.logUserAddedAnItemToCart();
```

This event notifies that the user has added a product to cart.

### Order created event

```javascript
conviousPricing.logOrderCreated({
    orderId: '<order_id>',
    items: [{
        productId: '<product_id>',
        amount: 2,
        price: 12.99,
        eventDate: new Date(2018, 4, 1),
        location: 'Almere',
    }, {
        productId: '<product_id>',
        amount: 1,
        price: 11.99,
        eventDate: new Date(2018, 4, 1),
        location: 'Almere',
    }]
});
```

This event notifies that the user has created an order.

Parameters:

Name | Type | Required | Description
--------- | ----------- | ----------- | -----------
`orderId` | string | yes | The ID of the order being made
`items.productId` | string | yes | The ID of a product in the order
`items.amount` | number | yes | The number of items of a product in the order
`items.price` | number | yes | The item price of a product in the order
`items.eventDate` | Date | no | The date when the event is taking place in case the product is time based
`items.location` | string | no | The location id where the product is being sold (in case of multiple venues at different locations)


### Transaction event

```javascript
conviousPricing.logTransaction(orderId, totalAmount);
```

This event notifies that the user has made a purchase.

Parameters:

Name | Type | Required | Description
--------- | ----------- | ----------- | -----------
`orderId` | string | yes | The ID of the order that was paid
`totalAmount` | number | yes | The total sum of the order
