var webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
var chromeCapabilities = webdriver.Capabilities.chrome();

var browser = new webdriver.Builder().forBrowser('chrome')
                                         .setChromeOptions(new chrome.Options().addArguments(
                                              "--headless",
                                              "--disable-dev-shm-usage",
                                              "--verbose",
                                              "--disable-web-security",
                                              "--ignore-certificate-errors",
                                              "--allow-running-insecure-content",
                                              "--allow-insecure-localhost",
                                              "--no-sandbox",
                                              "--disable-gpu"
                                         ))
                                         .build();
var assert = require('assert');
(async function example() {
    try {

        browser.manage().setTimeouts( { implicit: 10000 } );
        browser.get('http://localhost:9000/');

        await browser.wait(webdriver.until.elementLocated(webdriver.By.xpath('//button[@routerlink=\'/login\']')), 10000).click();

        await browser.wait(webdriver.until.elementLocated(webdriver.By.name('username')), 10000).sendKeys(`${process.env.SIW_TEST_USER_EMAIL}`);

        await browser.wait(webdriver.until.elementLocated(webdriver.By.name('password')), 10000).sendKeys(`${process.env.SIW_TEST_USER_PASSWORD}`);

        await browser.wait(webdriver.until.elementLocated(webdriver.By.id('okta-signin-submit')), 10000).click();

        await browser.wait(webdriver.until.elementLocated(webdriver.By.xpath('//button[@routerlink=\'/protected\']')), 10000).click();

        var protectedEndPoint = await browser.wait(webdriver.until.elementLocated(webdriver.By.xpath('//app-secure[text()="Protected endpoint!"]')), 10000).getText();

        console.log(protectedEndPoint);
        assert.deepStrictEqual(protectedEndPoint,'Protected endpoint!');

        await browser.wait(webdriver.until.elementLocated(webdriver.By.xpath('//*[contains(text(),"Home")]')), 10000).click();
        await browser.wait(webdriver.until.elementLocated(webdriver.By.xpath('//*[contains(text(),"Logout")]')), 10000).click();

        await browser.quit();
        console.log("Test passed");

    }
    catch(err){
        await browser.quit();
        await console.error(err);
        process.exit(1);
    }
    

})();