import { Page } from "puppeteer";
import { AsyncMethod } from "./shared.js"
import { Log } from "crawlee";
import { Logger } from "@destruct/logger";

export type ScraperConfigT = {
    page: Page;
    logger: Log;
};

export type SelectorT<ExtraInfoT extends {} = {}> = {
    selector: string
} & ExtraInfoT

export interface EnhancedPuppeteerI {

    // Navigation
    navigate: AsyncMethod<string, void>

    // Input Interactions
    click: AsyncMethod<SelectorT<{ with_navigation?: boolean }>, void>
    type: AsyncMethod<SelectorT<{ text: string }>, void>

    // DOM Interactions
    getText: AsyncMethod<SelectorT<{ parser?: (text: string) => string }>, string>
    getLink: AsyncMethod<SelectorT, string>
    getAttribute: AsyncMethod<SelectorT<{ attribute: string }>, string>

    getValuesFromListing: AsyncMethod<SelectorT , string[]>
    getKeyValueFromListing: AsyncMethod<SelectorT<{ key_selector: string, value_selector: string }> , {[key: string]: string}[]>

    selectFromListingBasedOnValue: AsyncMethod<SelectorT<{ value: string }> ,void>

    // DOM Checks
    exists: AsyncMethod<SelectorT, boolean>

    // special features
    login: AsyncMethod<{
        user_selector: string,
        user_info: string,
        pass_selector: string,
        pass_info: string,
        login_selector: string
    }, void>
}