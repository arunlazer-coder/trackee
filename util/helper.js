const moment = require('moment')

const getSuccessResponse = (msg = '', response = {}) => {
    return {
        status: true,
        msg,
        response,
    }
}

const getErrorResponse = (errorMsg = '', response = {}) => {
    return {
        status: false,
        errorMsg,
        response,
    }
}

const MONTH_DATA = {}
for (let i = 6; i >= -1; i--) {
    MONTH_DATA[i] = moment().subtract(i, 'months').startOf('month').toDate()
}

const isArray = (data) => {
    return data && Array.isArray(data) && data.length
}
module.exports = {
    getErrorResponse,
    getSuccessResponse,
    isArray,
    MONTH_DATA,
}
