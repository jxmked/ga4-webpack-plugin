export interface Ga4WebpackPluginOptions {
  /**
   * Google Measurement ID (GA4). (Required)
   * */
  id: string;

  /**
   * Inject GA4 or not? Useful if you don't want to add analytics
   * during development mode. When set to false, <ga4.analytics />
   * will be remove automatically from html files. (True by default)
   * */
  inject?: boolean;

  /**
   * Call page view? Automatically call page view to add records to
   * analytics while viewing the page. Useful if you like to override
   * when/where to call the page view. (True by default)
   * */
  callPageView?: boolean;
}

export declare class Ga4WebpackPlugin {
  constructor(options: Ga4WebpackPluginOptions);
}
