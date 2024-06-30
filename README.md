# ga4-webpack-plugin

The ga4-webpack-plugin simplifies injecting the Google Analytics 4 (GA4) snippet into your HTML using Webpack.

## Install

Install the plugin via npm: `npm i --save-dev ga4-webpack-plugin`

## Setup

Add the plugin to your webpack configuration:

```js
// webpack.config.js

const GA4WebpackPlugin = require('ga4-webpack-plugin');

module.exports = {
  // ... other webpack configuration options

  plugins: [
    new GA4WebpackPlugin({
      // Your GA4 Measurement ID (required)
      id: "GA_MEASUREMENT_ID",

      // Whether to inject the GA4 snippet into HTML (default: true)
      inject: true,

      // Automatically trigger a page view on load (default: true)
      callPageView: true
    })
  ]
}

```

> Note: Ensure you replace "GA_MEASUREMENT_ID" with your actual GA4 Measurement ID.

In your index.html, include <ga4.analytics /> where you want the GA4 snippet injected. This step is crucial for the plugin to function correctly.

## Injected HTML

The plugin injects the following code into your HTML:

```html
<!-- Google Analytics 4 (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Optionally, you can enable callPageView: true in the plugin options to automatically trigger the page view. This adds:

```js
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID');
```

to your injected code.
