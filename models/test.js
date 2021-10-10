'use strict';
module.exports = (sequelize, DataTypes) => {
    var test = sequelize.define('test', {
        postName: {
            type: DataTypes.STRING,
        },
        postWriter: {
            type: DataTypes.STRING,
        }
    });
    return test;
};