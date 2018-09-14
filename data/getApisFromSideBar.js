/**
 * @file getApiFromMark.js
 * @author caixiaowen
 */

import superagent from 'superagent';
import cheerio from 'cheerio';
import {STRUCT} from './config';

// const url = STRUCT.host;
const sideBar = STRUCT.sideBar;
const allApi = sideBar.allApi;

export function getApisFromSideBar(url) {
    return new Promise(resolve => {
        superagent.get(url)
        .end((err, sres) => {
            if (err) {
                throw err;
            }

            let $ = cheerio.load(sres.text);
            let $sideBar = $(sideBar.type + sideBar.selector);
            let apis = getAllApisName($, $sideBar);
            // 去掉几个中文
            let p = /[a-zA-Z]/g;
            for (let i = 0; i < apis.length; i++) {
                if (!p.test(apis[i].name)) {
                    apis.splice(i, 1);
                }
            }
            resolve(apis);
        });
    });
}

function getAllApisName($, $sideBar) {
    let apis = [];
    $sideBar.find(allApi.selector).each((_, element) => {
        let $el = $(element);
        let each = {
            name: $el.find(allApi.type).text(),
            href: $el.find(allApi.type).attr(allApi.attribute)
        };
        apis.push(each);
    });
    return apis;
}
