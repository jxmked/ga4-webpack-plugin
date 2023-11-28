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

    compiler.hooks.emit.tapAsync(
      "GA4WebpackPlugin",
      (compilation, callback) => {
        for (const filename of Object.keys(compilation.assets)) {
          if (!filename.endsWith(".html")) continue;

          // If inject is false, nist remove the ga4 tag from html
          let script = snippet;

          if (!this.inject) {
            script = "";
          }

          const indexHtml = compilation.assets[filename];

          // Injecting..
          let modifiedContent;
          const source = indexHtml.source();

          try {
            modifiedContent = source.replace(pattern, script);
          } catch (err) {
            const stringSource = source.toString();
            modifiedContent = new Buffer(stringSource.replace(pattern, script));
          }

          // Update build index.html
          compilation.assets[filename] = {
            source: () => modifiedContent,
            size: () => modifiedContent.length,
          };
        }

        callback();
      },
    );
  }
}

module.exports = Plugin;
