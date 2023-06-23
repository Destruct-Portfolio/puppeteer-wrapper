export class EnhancedPuppeteerForCrawlee {
    page;
    logger;
    constructor(config) {
        const { page, logger } = config;
        this.page = page;
        this.logger = logger;
    }
    async navigate(url) {
        if (!this.page)
            return;
        await this.page
            .goto(url, { waitUntil: "networkidle2" })
            .then(() => {
            this.logger.info(`Navigated to [${url}].`);
        })
            .catch(() => {
            this.logger.error(`Navigation to [${url}] failed.`);
        });
    }
    async getLink(config) {
        const { selector } = config;
        if (!this.page)
            return '';
        const link = await this.page.$eval(selector, (el) => {
            return el.getAttribute("href") || '';
        })
            .catch((error) => {
            this.logger.error(`${error} | ${this.page.url()}`);
            return "";
        });
        this.logger.info(`Extracted link [${link}] from [${selector}].`);
        return link;
    }
    async getAttribute(config) {
        const { selector, attribute } = config;
        if (!this.page)
            return '';
        const attr = await this.page.$eval(selector, (el) => {
            return el.getAttribute(attribute) || '';
        })
            .catch((error) => {
            this.logger.error(`${error} | ${this.page.url()}`);
            return "";
        });
        this.logger.info(`Extracted attribute [${attr}] from [${selector}].`);
        return attr;
    }
    async click(config) {
        const { selector } = config;
        if (!this.page)
            return;
        await this.page
            .waitForSelector(selector)
            .then(async () => {
            if (!this.page)
                return;
            await this.page
                .click(selector, {
                delay: Math.random() * 100 + 100,
            })
                .then(() => {
                this.logger.info(`Clicked on [${selector}].`);
            })
                .catch((error) => {
                this.logger.error(`${error} | While clicking on [${selector}] | ${this.page.url()}`);
            });
        })
            .catch(() => {
            this.logger.error(`Timeout waiting for element [${selector}].`);
        });
    }
    async type(config) {
        const { selector, text } = config;
        if (!this.page)
            return;
        await this.page
            .waitForSelector(selector)
            .then(async () => {
            if (!this.page)
                return;
            await this.page.type(selector, text, {
                delay: Math.random() * 100 + 100,
            })
                .then(() => {
                this.logger.info(`Typed: "${text}" into [${selector}].`);
            })
                .catch((error) => {
                this.logger.error(`${error} | ${this.page.url()}`);
            });
        })
            .catch(() => {
            this.logger.error(`Timeout waiting for element [${selector}].`);
        });
    }
    async getText(config) {
        const { selector, parser } = config;
        if (!this.page)
            return "";
        const text = await this.page
            .$eval(selector, (el) => {
            return el.textContent || "";
        })
            .catch((error) => {
            this.logger.error(`${error} | ${this.page.url()}`);
            return "";
        });
        this.logger.info(`Extracted text [${text}] from [${selector}].`);
        if (parser) {
            return parser(text);
        }
        return text;
    }
    async exists(config) {
        const { selector } = config;
        if (!this.page)
            return false;
        const el = await this.page.$(selector);
        return !!el;
    }
    async selectFromListingBasedOnValue(config) {
        const { selector, value } = config;
        const option = `${selector}[value='${value}']`;
        this.logger.info(`Selected option [${option}]`);
        await this.click({ selector: option });
    }
    async getValuesFromListing(config) {
        const { selector, parser } = config;
        if (!this.page)
            return [];
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
            this.logger.error(`${error} | ${this.page.url()}`);
            return [];
        });
        this.logger.info(`Extracted values [${values}] from [${selector}].`);
        if (parser) {
            return values.map((value) => parser(value));
        }
        return values;
    }
    async getKeyValueFromListing(config) {
        const { selector: list_selector, key_selector, value_selector } = config;
        if (!this.page)
            return [];
        const selectors = { key_selector, value_selector };
        const values = await this.page
            .$$eval(list_selector, (els, selectors) => {
            let penalties = [];
            for (const el of els) {
                const penalty_name = el.querySelector(selectors.key_selector)?.textContent || "";
                const penalty_rate = el.querySelector(selectors.value_selector)?.textContent || "";
                penalties.push({
                    name: penalty_name,
                    rate: penalty_rate,
                });
            }
            return penalties;
        }, selectors)
            .catch((error) => {
            this.logger.error(`${error} | ${this.page.url()}`);
            return [];
        });
        this.logger.info(`Extracted values [${values}] from [${list_selector}].`);
        return values;
    }
    async login(config) {
        const { user_selector, user_info, pass_selector, pass_info, login_selector } = config;
        await this.type({ selector: user_selector, text: user_info });
        await this.type({ selector: pass_selector, text: pass_info });
        await this.click({ selector: login_selector });
    }
}
