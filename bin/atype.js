#!/usr/bin/env node
/**
 * @file 命令行定义
 * @author yufeng
 */
'use strict';

const program = require('commander');

// 版本信息
program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]');

// 获取MD文件路径
program
    .command('getMD <src>')
    .description('console markdown file path')
    .action(require('./atype-getFile'));


// 参数处理
program.parse(process.argv);


// todo: 统一处理不合法命令
if (!program.args.length) {
    program.help();
}
