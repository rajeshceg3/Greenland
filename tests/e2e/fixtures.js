const {test:base,expect}=require('@playwright/test');
const test=base.extend({page:async({page},use)=>{
 await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#dde9ef"/></svg>'}));
 await use(page);
}});module.exports={test,expect};
