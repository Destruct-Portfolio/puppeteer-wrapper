import { Page } from "puppeteer";
import { EnhancedPuppeteerI, SelectorT } from "../interfaces/scraper.js";
import { Logger } from "@destruct/logger";
export declare class EnhancedPuppeteer implements EnhancedPuppeteerI {
    page: Page;
    logger: Logger;
    constructor(config: {
        page: Page;
        logger: Logger;
    });
    navigate(url: string): Promise<void>;
    getLink(config: SelectorT): Promise<string>;
    getAttribute(config: SelectorT<{
        attribute: string;
    }>): Promise<string>;
    click(config: SelectorT): Promise<void>;
    type(config: SelectorT<{
        text: string;
    }>): Promise<void>;
    getText(config: SelectorT<{
        parser?: (text: string) => string;
    }>): Promise<string>;
    exists(config: SelectorT): Promise<boolean>;
    selectFromListingBasedOnValue(config: SelectorT<{
        value: string;
    }>): Promise<void>;
    getValuesFromListing(config: SelectorT<{
        parser?: (_: string) => string;
    }>): Promise<string[]>;
    getKeyValueFromListing(config: SelectorT<{
        key_selector: string;
        value_selector: string;
    }>): Promise<{
        name: string;
        rate: string;
    }[]>;
    login(config: {
        user_selector: string;
        user_info: string;
        pass_selector: string;
        pass_info: string;
        login_selector: string;
    }): Promise<void>;
}
