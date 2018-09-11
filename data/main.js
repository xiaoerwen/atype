/**
 * @file main.js
 * @author caixiaowen
 */

import express from 'express';
import cheerio from 'cheerio';
import superagent from 'superagent';
import mapLimit from 'async/mapLimit';
import fs from 'fs';
import path from 'path';
// 结构化配置
import {STRUCT} from './config.js';
// 捕获所有API的前提方法，提取出去，可做改进
import {findApiCategories, findApiOfCategory} from './findAllApi.js';
const app = express();

let apiData = [];
const paramTable = STRUCT.args[0];
const nameColumn = 'td:nth-of-type(' + (paramTable.headerMap.indexOf('name') + 1) + ')';
const typeColumn = 'td:nth-of-type(' + (paramTable.headerMap.indexOf('type') + 1) + ')';
const requireColumn = 'td:nth-of-type(' + (paramTable.headerMap.indexOf('required') + 1) + ')';
const defaultColumn = 'td:nth-of-type(' + (paramTable.headerMap.indexOf('default') + 1) + ')';

// 每个API的所有必需参数
function findAllParams($, obj) {
    // 文档中唯一一条例外数据
    if (obj.name === 'requestPolymerPayment 百度电商开放平台：产品介绍') {
        obj.name = 'requestPolymerPayment';
    }
    let name = obj.name;
    // 特殊符号需转成'-'，首尾不要有特殊符号
    let p = /[\.\,\(\)]/g;
    if (p.test(name)) {
        name = name.replace(p, '-');
        let p3 = /[\-*]$/g;
        while (p3.test(name)) {
            name = name.replace(p3, '');
        }
        let p2 = /[\[\]\ ]/g;
        if (p2.test(name)) {
            name = name.replace(p2, '');
        }
    }
    let $el = $('#' + name);
    // 抓取解释
    let exp = $el.next().first('p').text();
    let idx = exp.indexOf('：');
    obj.explation = exp.substr(idx + 1);

    // API为h2标题
    let hasH2 = $el.nextAll().filter(STRUCT.type);
    let $hasTable;
    if (hasH2) {
        // API为h2标题时，需保证不受下面其他API的影响
        $hasTable = $el.nextUntil(STRUCT.type).filter(paramTable.type);
    }
    else {
        $hasTable = $el.nextAll().filter(paramTable.type);
    }
    // 参数描述写在表格中，所以从表格读取
    if ($hasTable) {
        let param = [];
        $hasTable.first().find(paramTable.selector).each((index, element) => {
            let $required = $(element).find(requireColumn);
            if ($required.text() === '是' || $required.text() === '否') {
                let $param = $(element).find(nameColumn);
                let $type = $(element).find(typeColumn);
                let $default = $(element).find(defaultColumn);
                let parObj = {
                    'param': $param.text(),
                    'type': $type.text(),
                    'isRequired': $required.text(),
                    'default': $default.text()
                };
                param.push(parObj);
            }
        });
        if (param.length) {
            obj.param = param;
        }
    }
    return obj;
}

// 遍历每个API
function findParamOfApi(apis) {
    return new Promise(resolve => {
        mapLimit(apis, 100, (api, callback) => {
            superagent.get(api.href)
            .end((err, sres) => {
                if (err) {
                    throw err;
                }

                let $ = cheerio.load(sres.text);
                // 读取所需参数
                api = findAllParams($, api);
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

// 第三步：遍历所有API各自的必需参数
function mapApiForParam() {
    let allApi = [];
    let len = apiData.length;
    for (let i = 0; i < len; i++) {
        // 挨个读取API的必需参数
        allApi.push(findParamOfApi(apiData[i].apis));
    }
    // 必须等到数据全部抓完才返回结果
    return Promise.all(allApi);
}

app.get('/', (req, res) => {
    res.send('开始读取数据');
    // 第一步：从页面的chapter栏抓取API下各个分类
    findApiCategories(apiData)
    // 第二步：抓取每个分类下的所有API
    .then(() => findApiOfCategory(apiData))
     // 第三步：抓取所有API各自的必需参数
    .then(() => mapApiForParam())
    .then(() => {
        // 第四步：将数据写入文件
        fs.writeFileSync(path.join(__dirname, STRUCT.savePath), JSON.stringify(apiData, null, 2));
        console.log(105, '写入文件成功');
    }).catch(err => {
        throw err;
    });
}).listen(8811);
