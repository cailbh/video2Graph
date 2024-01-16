// Schema、Model、Entity或者Documents的关系:Schema生成Model，Model创造Entity，Model和Entity都可对数据库操作造成影响，但Model比Entity更具操作性。
const mongoose = require('mongoose');
// 连接数据库 
mongoose.connect('mongodb://localhost:27017/conceptThread');

// 为这次连接绑定事件
const db = mongoose.connection;
db.once('error', () => console.log('Mongo connection error'));
db.once('open', () => console.log('Mongo connection successed'));
/************** 定义模式Schema **************/
const caseSchema = mongoose.Schema({
});
const caseRelSchema = mongoose.Schema({
});

/************** 定义模型Model **************/
const Models = {
    Ent: mongoose.model('Ent', caseSchema,'ent'),
    Rel: mongoose.model('tt', caseRelSchema, "rel"),
}

module.exports = Models;
