class Plugin {
  constructor(options) {
    if (typeof options !== "object") return;

    if (options.id === void 0) {
      throw new Error("GA4WebpackPlugin requires GA_MEASUREMENT_ID");
    }

    this.callPageView = true;
    this.inject = true;

    // GA4 ID
    this.id = options.id;

    /**
     * Inject only on build mode
     * */
    if ("inject" in options) this.inject = options.inject;

    /**
     * Call Page View
     * */
    if ("callPageView" in options) this.callPageView = options.callPageView;
  }

  get snippetCode() {
    const pageView = `gtag('js', new Date());gtag('config', '${this.id}');`;
    const gtag_func =
      `<script>window.dataLayer = window.dataLayer || [];` +
      `function gtag(){dataLayer.push(arguments);}`;

    const snippet = [
      '<script async src="',
      `https://www.googletagmanager.com/gtag/js?id=${this.id}`,
      '"></script>',
    ];

    snippet.push(gtag_func);

    if (this.callPageView) {
      snippet.push(pageView);
    }

    snippet.push("</script>");

    return snippet.join("");
  }

  apply(compiler) {
    const snippet = this.snippetCode;

    /**
     * Matches <ga4.analytics <with/without spaces here> />
     * */
    const pattern = /(\<ga4\.analytics\ *\/\>)/i;

    const CYAN = "\x1b[36m";
    const RESET = "\x1b[0m";

    compiler.hooks.emit.tapAsync("GA4WebpackPlugin", (compilation, callback) => {
      for (const filename of Object.keys(compilation.assets)) {
        if (!/\.(xhtml|html?)$/i.test(filename)) continue;

        // If inject is false, nist remove the ga4 tag from html
        let script = snippet;

        if (!this.inject) {
          script = "";
        }

        const indexHtml = compilation.assets[filename];

        // Injecting..
        const source = indexHtml.source();

        let str = source;

        /**
         * We need string
         * */
        while (str instanceof Buffer) {
          str = str.toString("utf8");
          console.log(CYAN + "\nGA4 encountered buffer data. Converting..." + RESET);
        }

        const buff = Buffer.from(str.replace(pattern, script));

        // Update build index.html
        compilation.assets[filename] = {
          source: () => buff,
          size: () => buff.length,
          _valueIsBuffer: true,
          _value: buff,
          _valueAsBuffer: buff,
          _valueAsString: void 0,
        };
      }

      callback();
    });
  }
}

module.exports = Plugin;
