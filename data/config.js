/**
* @file config.js
* @author caixiaowen
*/

export const STRUCT = {
    host: 'https://smartprogram.baidu.com',
    mainPage: '/docs/develop/tutorial/codedir/',
    // 数据保存路径
    savePath: 'apiData.json',
    // 侧边栏
    sideBar: {
        selector: '[data-name|="api"]',
        type: 'li',
        allApi: {
            // 获取侧边栏的所有API
            selector: '.m-doc-h2-children>li',
            type: 'a',
            attribute: 'href'
        }
    },
    // 每个API的页面
    eachApi: {
        // API为h2标题
        type: 'h2',
        desc: {
            type: 'p',
            filter: '：'
        },
        args: {
            // 第一个为参数表格
            paramTable: {
                type: 'table',
                selector: 'tbody > tr',
                headerMap: {
                    three: ['name', 'type', 'desc'],
                    four: ['name', 'type', 'required', 'desc'],
                    five: ['name', 'type', 'required', 'default', 'desc']
                }
            },
            // 第二个为返回值表格
            returnTable: {
                type: 'table',
                headerMap: ['name', 'type', 'desc']
            }
        }
    }
};
