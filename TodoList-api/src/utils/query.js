const Op = require('./../models').Sequelize.Op;

function addStringQuery(key, sequelizeQuery, queryJson){
    if(queryJson[key]){
        sequelizeQuery[key] = {
            [Op.like]: queryJson[key].replaceAll('%20', ' ')
        }
    }
}

function addDateQuery(key, sequelizeQuery, queryJson){
    if(!(queryJson[`${key}`] || queryJson[`${key}_gt`] || queryJson[`${key}_lt`] || queryJson[`${key}_gte`] || queryJson[`${key}_lte`]))
        return;
    let dateQuery = {};
    if(queryJson[`${key}`]){
        dateQuery[Op.eq] = new Date(queryJson[key])
    }
    if(queryJson[`${key}_gt`]){
        dateQuery[Op.gt] = new Date(queryJson[`${key}_gt`])
    }
    if(queryJson[`${key}_lt`]){
        dateQuery[Op.lt] = new Date(queryJson[`${key}_lt`])
    }
    if(queryJson[`${key}_gte`]){
        dateQuery[Op.gte] = new Date(queryJson[`${key}_gte`])
    }
    if(queryJson[`${key}_lte`]){
        dateQuery[Op.lte] = new Date(queryJson[`${key}_lte`])
    }
    sequelizeQuery[key] = dateQuery;
}

function addNumberQuery(key, sequelizeQuery, queryJson){
    if(!(queryJson[`${key}`] || queryJson[`${key}_gt`] || queryJson[`${key}_lt`] || queryJson[`${key}_gte`] || queryJson[`${key}_lte`]))
        return;
    let numQuery = {};
    if(queryJson[`${key}`]){
        numQuery[Op.eq] = queryJson[key]
    }
    if(queryJson[`${key}_gt`]){
        numQuery[Op.gt] = queryJson[`${key}_gt`]
    }
    if(queryJson[`${key}_lt`]){
        numQuery[Op.lt] = queryJson[`${key}_lt`]
    }
    if(queryJson[`${key}_gte`]){
        numQuery[Op.gte] = queryJson[`${key}_gte`]
    }
    if(queryJson[`${key}_lte`]){
        numQuery[Op.lte] = queryJson[`${key}_lte`]
    }
    sequelizeQuery[key] = numQuery;
}

function addBooleanQuery(key, sequelizeQuery, queryJson){
    if(queryJson[key]){
        sequelizeQuery[key] = JSON.parse(queryJson[key])
    }
}

module.exports = {addStringQuery, addNumberQuery, addDateQuery, addBooleanQuery}