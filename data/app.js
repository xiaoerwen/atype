const express = require('express');
const cheerio = require('cheerio');
const async = require('async');
const superagent = require('superagent');
const fs = require('fs');
const path = require('path');
const app = express();
const host = 'https://smartprogram.baidu.com';
const formData = require('./form.js');
var api_url = [];

function findData() {
    return new Promise((resolve) => {
        superagent.get(host + '/docs/develop/framework/app-service_getcurrentpages/')//请求页面地址
        .end((err, sres) => {//页面获取到的数据
            if (err) {
                return next(err);
            }
            console.log(111);

            let $ = cheerio.load(sres.text); // 用cheerio解析页面数据
            let $api = $('.m-doc-sidebar-nav-selected[data-name|="api"] > ul > li');

            $api.each((index, element) => {
                var $eleItem = $(element).find('a');
                api_url.push({
                    title: $eleItem.attr('href'),
                    content: []
                });
            });
            findTable().then(() => {
                console.log(333);
                fs.writeFileSync(path.join(__dirname, 'app.json'), JSON.stringify(api_url, null, 2));
                resolve();
            }).catch((err) => {
                throw err;
            });
        });
    });
}

function readTable(url) {
    return new Promise((resolve) => {
        superagent.get(host + url.title)
        .end((err, sres) => {
            let item = [];
            if (err) {
                return next(err);
            }

            let $ = cheerio.load(sres.text);
            $('.article-entry tbody tr').each((index, element) => {
                $el = $(element).find('a');
                let it = {
                    title: $el.text(),
                    href: $el.attr('href')
                }
                item.push(it);
            });
            url.content = item;
            resolve(url);
        });
    });
}

function findTable() {
    return new Promise((resolve) => {
        let len = api_url.length;
        for(let i = 0; i < len; i++) {
            console.log(222);
            (()=>{readTable(api_url[i]).then((res) => {
                api_url[i] = res;
                if (i == len - 1) {
                    resolve();
                }
            }).catch((err) => {
                throw err;
            });})();
        }
    });
}

app.get('/', async(req, res, next) => {
    findData().then(() => {
        console.log(444);
        formData.form();
    }).catch((err) => {
        throw err;
    });

    res.send('读取数据成功');
});

app.listen(8811, () => {
    console.log('抓取成功~~~');
});