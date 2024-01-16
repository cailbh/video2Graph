/* eslint-disable no-unused-vars */
// 可能是我的node版本问题，不用严格模式使用ES6语法会报错
"use strict";
const models = require('./db');
const express = require('express');
const router = express.Router();

// 获取数据
router.get('/api/ent/getData', (req, res) => {
    // 通过模型去查找数据库
    models.Ent.find((err, data) => {
        if (err) {
            res.send(err);
        } else {
             
            res.send(data);
        }
    });
});
router.get('/api/rel/getData', (req, res) => {
    // 通过模型去查找数据库
    models.Rel.find((err, data) => {
        if (err) {
            res.send(err);
        } else {
             
            res.send(data);
        }
    });
});
module.exports = router;