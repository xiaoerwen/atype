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
import {getApisFromSideBar} from './getApisFromSideBar.js';
const app = express();

const {
    host,
    mainPage,
    savePath,
    eachApi
} = STRUCT;
const url = host + mainPage;
const paramTable = eachApi.args.fnName;

// 表格
function columnSelectorOfTable(headerMap) {
    let columnSelector = {};
    headerMap.forEach((item, index) => {
        columnSelector[item] = 'td:nth-of-type(' + (index + 1) + ')';
    });
    return columnSelector;
}

// 特殊符号需转成'-'，首尾不要有特殊符号
function fitId(name) {
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
    return name;
}

// 每个API的所有必需参数
function findAllParams($, obj) {
    let name = fitId(obj.name);
    let $el = $('#' + name);

    // 抓取解释
    let exp = $el.next().first(eachApi.desc.type).text();
    let idx = exp.indexOf(eachApi.desc.filter);
    obj.explation = exp.substr(idx + 1);

     // API为h2标题
    let hasH2 = $el.nextAll().filter(eachApi.type);
    let $hasTable;
    if (hasH2) {
        // API为h2标题时，需保证不受下面其他API的影响
        $hasTable = $el.nextUntil(eachApi.type).filter(paramTable.type);
    }
    else {
        $hasTable = $el.nextAll().filter(paramTable.type);
    }

    // 参数描述写在表格中，所以从表格读取
    if ($hasTable) {
        let param = [];
        let trow = $hasTable.first().find(paramTable.selector);
        // 因为每个表格列数、参数不一样，需做判断，后期文档改进的话可去掉这一步
        let cols = trow.first().find('td').length;
        if (cols) {
            let headerMap;
            switch (cols) {
                case 3: headerMap = paramTable.headerMap.threeCols;
                    break;
                case 4: headerMap = paramTable.headerMap.fourCols;
                    break;
                case 5:
                default: headerMap = paramTable.headerMap.fiveCols;
            }
            let columnSelector = columnSelectorOfTable(headerMap);
            trow.each((_, element) => {
                let parObj = {};
                for (let key in columnSelector) {
                    if (columnSelector.hasOwnProperty(key)) {
                        parObj[key] = $(element).find(columnSelector[key]).text();
                    }
                }
                param.push(parObj);
            });
            if (param.length) {
                obj.param = param;
            }
        }
    }
    return obj;
}

 // 遍历每个API
function findParamOfApi(apis) {
    return new Promise(resolve => {
        mapLimit(apis, 100, (api, callback) => {
            superagent.get(host + api.href)
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
            resolve(apis);
        });
    });
}

app.get('/', (_, res) => {
    // 第一步：从侧边栏抓取所有API
    getApisFromSideBar(url)
    // 第二步：抓取各个API的参数
    .then(apiData => findParamOfApi(apiData))
    .then(apiData => {
        res.send(apiData);
        // 第三步：将数据写入文件
        fs.writeFileSync(path.join(__dirname, savePath), JSON.stringify(apiData, null, 2));
        console.log(105, '写入文件成功');
    }).catch(err => {
        throw err;
    });
}).listen(8811);
