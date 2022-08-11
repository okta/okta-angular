export const waitForLoad = async (element, elementName) => {
  try {
    await browser.waitUntil(
      async () => element.then(el => el.isDisplayed()), 
      5000, 
      `wait for ${elementName || 'element'} to load`
    );
  } catch (err) {
    console.error(`${elementName || 'element'} has not been displayed after 5s`);
    console.log('[DEBUG] Console: ', await browser.getLogs('browser'));
    console.log('[DEBUG] URL: ', await browser.getUrl());
    console.log('[DEBUG] Body: ', await (await $('body')).getHTML());
    throw err;
  }
};
