/**
 * @file findAllApi.js
 * @author caixiaowen
 */

import superagent from 'superagent';
import cheerio from 'cheerio';
import mapLimit from 'async/mapLimit';

const host = 'https://smartprogram.baidu.com';
const mainPage = '/docs/develop/framework/app-service_getcurrentpages/';

// 第一步：从页面的chapter栏抓取API下各个分类
export function findApiCategories(apiData) {
    return new Promise(resolve => {
        superagent.get(host + mainPage) // 请求页面地址
        .end((err, sres) => { // 页面获取到的数据
            if (err) {
                throw err;
            }

            let $ = cheerio.load(sres.text); // 用cheerio解析页面数据
            let $api = $('.m-doc-sidebar-nav-selected[data-name|="api"] > ul > li');

            $api.each((index, element) => {
                let $eleItem = $(element).find('a');
                apiData.push({
                    name: $eleItem.attr('href'),
                    apis: []
                });
            });
            resolve();
        });
    });
}

// 第二步：依次抓取每个分类下的所有API
export function findApiOfCategory(apiData) {
    return new Promise(resolve => {
        // 并发处理多个请求
        mapLimit(apiData, 100, (category, callback) => {
            superagent.get(host + category.name)
            .end((err, sres) => {
                let item = [];
                if (err) {
                    throw err;
                }

                let $ = cheerio.load(sres.text);
                $('.article-entry tbody tr').each((index, element) => {
                    let $el = $(element).find('a');
                    let it = {
                        name: $el.text(),
                        href: $el.attr('href')
                    };
                    item.push(it);
                });
                category.apis = item;
                callback();
            });
        }, err => {
            if (err) {
                throw err;
            }
            resolve();
        });
    });
}
