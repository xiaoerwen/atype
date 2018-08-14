/**
 * @file 命令行定义
 * @author yufeng
 */
// node path模块
const path = require('path');
const fs = require('fs');

/**
 * 用于判断目录是否存在
 *
 * @param {string} path 文件目录
 * @return {boolean} 判断结果
 */
function isExist(path) {
    return fs.existsSync(path);
}

/**
 * 文件类型是否匹配
 *
 * @param {string} filename 文件名
 * @param {string} suffix 文件后缀名
 * @return {boolean} 判断结果
 */
function isFileType(filename, suffix) {
    let nameArr = filename.split('.');
    let len = nameArr.length;
    return nameArr[len - 1] === suffix;
}

/**
 * 在指定目录中查找制定类型文件
 *
 * @param {string} dir 待查找目录
 * @param {string} suffix 待查找文件类型
 * @param {Array} dirResults 收集结果
 */
function lookForFile(dir, suffix, dirResults) {
    if (!isExist(dir)) {
        console.log('路径错误');
        return;
    }
    // 根据文件路径读取文件，返回文件列表
    try {
        let files = fs.readdirSync(dir);

        // 遍历读取到的文件列表
        files.forEach(filename => {
            if (filename.indexOf('.') !== 0 && filename !== 'node_modules') {
                // 获取当前文件的绝对路径
                let fileDir = path.join(dir, filename);
                // 根据文件路径获取文件信息，返回一个fs.Stats对象
                let stats = fs.statSync(fileDir);
                // 是文件夹
                let isDir = stats.isDirectory();

                if (!isDir && isFileType(filename, suffix)) {
                    dirResults.push(fileDir);
                }
                if (isDir) {
                    // 递归，如果是文件夹，继续遍历该文件夹下面的文件
                    lookForFile(fileDir, suffix, dirResults);
                }
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}

exports = module.exports = src => {

    let dirResults = [];
    lookForFile(src, 'md', dirResults);

    console.log(dirResults);

};
