const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const fs = require('fs');
const app = express();
const host = 'https://smartprogram.baidu.com';

function findTable(api_url) {
    for(let i = 0; i < api_url.length; i++) {
        superagent.get(host + api_url[i].title)
        .end(async(err,sres) => {
            let item = [];
            if (err) {
                return next(err);
            }

            let $ = cheerio.load(sres.text);
            await $('.article-entry tbody tr').each((index,element) => {
                $el = $(element).find('a');
                let it = {
                    title: $el.text(),
                    href: $el.attr('href')
                }
                item.push(it);
            });
            api_url[i]['content']=item;
            fs.writeFileSync('data/app.json', JSON.stringify(api_url));
        });
    }
}

app.get('/', (req,res,next) => {
    var api_url = [];
    superagent.get(host + '/docs/develop/framework/app-service_getcurrentpages/')//请求页面地址
        .end(async(err,sres) => {//页面获取到的数据
            if (err) {
                return next(err);
            }

            fs.open('/data/app.json', 'w+', () => {
                console.log('创建成功');
            });

            let $ = cheerio.load(sres.text); // 用cheerio解析页面数据
            let $api = $('.m-doc-sidebar-nav-selected[data-name|="api"] > ul > li');

            await $api.each((index,element) => {//下面类似于jquery的操作，前端的小伙伴们肯定很熟悉啦
                var $eleItem = $(element).find('a');
                api_url.push({
                    title: $eleItem.attr('href'),
                    content: []
                });
            });
            await findTable(api_url);
            res.send('读取数据成功');
            fs.close();
        });
});
app.listen(8811, () => {
    console.log('抓取成功~~~');
});