import { Page } from "puppeteer";
import { Log } from "crawlee";
import { EnhancedPuppeteerI, ScraperConfigT, SelectorT } from "../interfaces/scraper";


export class EnhancedPuppeteerForCrawlee implements EnhancedPuppeteerI {
  public page: Page;
  public logger: Log;

  constructor(config: ScraperConfigT) {
    const { page, logger } = config;

    this.page = page;
    this.logger = logger;
  }
  
  public async navigate(url: string) {
    if (!this.page) return;
    await this.page
      .goto(url, { waitUntil: "networkidle2" })
      .then(() => {
        this.logger.info(`Navigated to [${url}].`);
      })
      .catch(() => {
        this.logger.error(`Navigation to [${url}] failed.`);
      });

  }
  public async getLink(config: SelectorT) {
    const { selector } = config
    if (!this.page) return '';
    const link = await this.page.$eval(selector, (el) => {
      return el.getAttribute("href") || '';
    })
      .catch((error)=>{
        this.logger.error(`${error} | ${this.page!.url()}`)
        return ""
      })
    this.logger.info(`Extracted link [${link}] from [${selector}].`);
    return link 
  }

  public async getAttribute(config: SelectorT<{ attribute: string }>) {
    const { selector, attribute } = config
    if (!this.page) return '';
    const attr = await this.page.$eval(selector, (el) => {
      return el.getAttribute(attribute) || '';
    })
      .catch((error)=>{
        this.logger.error(`${error} | ${this.page!.url()}`)
        return ""
      })
    this.logger.info(`Extracted attribute [${attr}] from [${selector}].`);
    return attr
  }

  public async click(config: SelectorT) {
    const { selector } = config;
    if (!this.page) return;
    await this.page
      .waitForSelector(selector)
      .then(async () => {
        if (!this.page) return;
        await this.page
          .click(selector, {
            delay: Math.random() * 100 + 100,
          })
          .then(() => {
            this.logger.info(`Clicked on [${selector}].`);
          })
          .catch((error) => {
            this.logger.error(
              `${error} | While clicking on [${selector}] | ${this.page!.url()}`
            );
          });
      })
      .catch(() => {
        this.logger.error(`Timeout waiting for element [${selector}].`);
      });
  }

  public async type(config: SelectorT<{ text: string }>) {
    const { selector, text } = config
    if (!this.page) return;
    await this.page
      .waitForSelector(selector)
      .then(async () => {
        if (!this.page) return;
        await this.page.type(selector, text, {
          delay: Math.random() * 100 + 100,
        })
        .then(()=>{
          this.logger.info(`Typed: "${text}" into [${selector}].`);
        })
        .catch((error)=>{
          this.logger.error(`${error} | ${this.page!.url()}`)
        })

      })
      .catch(() => {
        this.logger.error(`Timeout waiting for element [${selector}].`);
      });
  }

  public async getText(config: SelectorT<{ parser?: (text: string) => string }>) {
    const { selector, parser } = config
    if (!this.page) return "";
    const text = await this.page
      .$eval(selector, (el) => {
        return el.textContent || "";
      })
      .catch((error) => {
        this.logger.error(`${error} | ${this.page!.url()}`);
        return "";
      });
    this.logger.info(`Extracted text [${text}] from [${selector}].`);
    if (parser) {
      return parser(text);
    }
    return text;
  }

  public async exists(config: SelectorT) {
    const { selector } = config;
    if (!this.page) return false;
    const el = await this.page.$(selector);
    return !!el;
  }

  public async selectFromListingBasedOnValue(config: SelectorT<{ value: string }>) {
    const { selector, value } = config
    const option = `${selector}[value='${value}']`;
    this.logger.info(`Selected option [${option}]`);
    await this.click({ selector: option });
  }

  public async getValuesFromListing(config: SelectorT<{parser?: (_: string) => string}>) {
    const { selector, parser } = config
    if (!this.page) return [];
    await this.page.waitForSelector(selector);
    const values = await this.page
      .$$eval(selector, (els) => {
        let values = [];

        for (const el of els) {
          values.push(el.getAttribute("value") || "");
        }

        return values;
      })
      .catch((error) => {
        this.logger.error(`${error} | ${this.page!.url()}`);
        return [];
      });

    this.logger.info(`Extracted values [${values}] from [${selector}].`);
    if (parser) {
      return values.map((value) => parser(value));
    }
    return values;
  }

  public async getKeyValueFromListing(config: SelectorT<{ key_selector: string, value_selector: string }>) {
    const { selector: list_selector, key_selector, value_selector } = config
    if (!this.page) return [];
    const selectors = { key_selector, value_selector };
    const values = await this.page
      .$$eval(
        list_selector,
        (els, selectors) => {
          let penalties = [];

          for (const el of els) {
            const penalty_name =
              el.querySelector(selectors.key_selector)?.textContent || "";
            const penalty_rate =
              el.querySelector(selectors.value_selector)?.textContent || "";

            penalties.push({
              name: penalty_name,
              rate: penalty_rate,
            });
          }

          return penalties;
        },
        selectors
      )
      .catch((error) => {
        this.logger.error(`${error} | ${this.page!.url()}`);
        return [];
      });

    this.logger.info(`Extracted values [${values}] from [${list_selector}].`);

    return values;
  }

  public async login(config: {
    user_selector: string,
    user_info: string,
    pass_selector: string,
    pass_info: string,
    login_selector: string
  }) {
    const {
      user_selector,
      user_info,
      pass_selector,
      pass_info,
      login_selector
      
    } = config 
    await this.type({ selector: user_selector, text: user_info })
    await this.type({ selector: pass_selector, text: pass_info })
    await this.click({ selector: login_selector})
  }
}

