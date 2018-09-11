/**
* @file config.js
* @author caixiaowen
*/

export const STRUCT = {
    name: 'api',
    // API为h2标题
    type: 'h2',
    args: [{
        // 第一个为参数表格
        name: 'param-table',
        type: 'table',
        selector: 'tbody > tr',
        headerMap: ['name', 'type', 'required', 'default', 'desc']
    }, {
        // 第二个为返回值表格
        name: 'return-table',
        type: 'table',
        headerMap: ['name', 'type', 'desc']
    }],
    // 数据保存路径
    savePath: 'apiData.json'
};
