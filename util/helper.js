const moment = require('moment')

const getSuccessResponse = (msg = '', response = {}) => {
    return {
        status: true,
        msg,
        response,
    }
}

const getErrorResponse = (msg = '', response = {}) => {
    return {
        status: false,
        msg,
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

// Todo: refactor this and make it easier to leftjoin with where and selected data
// async function fetchDataWithIncludes({model, attributes, includes}) {
//     try {
      
//       const options = {
//         include: includes,
//         raw: true
//       }
//       if(attributes === 'all'){
//         options.attributes = {

//         }
//       }
//       const data = await model.findAll(options);
//       return data;
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       throw error;
//     }
//   }
  // attributes: [
  //     'id',
  //     [Sequelize.col(`${Account.name}.name`), 'accountName'],
  //     [Sequelize.col(`${Category.name}.name`), 'categoryName'],
  //     'amount',
  //     'description',
  //     'transcationDate',
  //     'moneyType',
  //     'isCredit',
  // ],
  

module.exports = {
    getErrorResponse,
    getSuccessResponse,
    isArray,
    MONTH_DATA
}
