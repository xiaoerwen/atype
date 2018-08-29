const fs = require('fs');
const path = require('path');

function formData(data) {
    let origin = data;
    origin.forEach((item, index) => {
        let title = item.title;
        title = title.substr(0, title.length - 1);
        title = title.substr(title.lastIndexOf('/') + 1);
        origin[index].title = title;
        let api = item.content;
        api.forEach((item, index) => {
            api[index] = 'swan.' + item.title;
        });
    });
    console.log(origin);
    return origin;
}

exports.form = function() {
    return new Promise((resolve) => {
        fs.readFile(path.join(__dirname, "./app.json"), (err, data) => {
            if (err) {
                throw err;
            }
        
            console.log('读取文件成功');
            let output = formData(JSON.parse(data));
            resolve(output);
        });
    })
    .then((res) => {
        fs.writeFile(path.join(__dirname, "./api.txt"), JSON.stringify(res, null, 2), (err, data) => {
            if (err) {
                throw err;
            }
            console.log('写入成功');
        });
    });
}
