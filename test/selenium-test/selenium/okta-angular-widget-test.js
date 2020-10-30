const {Builder, By, Key, until} = require('selenium-webdriver');
var assert = require('assert');
(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.manage().setTimeouts( { implicit: 10000 } );
    await driver.get('http://localhost:4200/');
    await driver.findElement(By.xpath('//button[@routerlink=\'/login\']')).click();
    await driver.findElement(By.name('username')).sendKeys('testkostyadrozdov@gmail.com');
    await driver.findElement(By.name('password')).sendKeys('Okta455099');
    await driver.findElement(By.id('okta-signin-submit')).click();
    var url = await driver.getCurrentUrl()
    console.log(url);

    sleep(5);
    await driver.findElement(By.xpath('//button[@routerlink=\'/protected\']')).click();
    sleep(5);

    var protectedEndPoint = await driver.findElement(By.xpath('//app-secure')).getText();
    console.log(protectedEndPoint);
    assert.deepStrictEqual(protectedEndPoint,'Protected endpoint!');
    await driver.findElement(By.xpath('//*[contains(text(),\'Logout\')]')).click();
    await driver.findElement(By.xpath('//button[@routerlink=\'/login\']'))
    await driver.quit();
    console.log("Test passed");

  }
   catch(err){
   console.log(err);
   console.error("Test failed!");
   await driver.quit();
   process.exit(1);
   }


  function sleep(seconds)
  {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
  }
})();
