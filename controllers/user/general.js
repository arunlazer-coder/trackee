const db = require('../../models/database')
const {
    expense: Expense,
    account: Account,
    category: Category,
} = db
const {
    getErrorResponse,
    getSuccessResponse,
    isArray,
    MONTH_DATA,
} = require('../../util/helper')
const { Op } = require('sequelize')
const moment = require('moment')
const {filterBankAndCalculateAmount, filterMonthlyTransactions, filterLatestRecord} = require('./support')

const stack = async (req, res) => {
    const {year, account_id, category_id} = req.query    
    const {user_id} = res
    try {   
        const userData = await Expense.findAll({
            attributes: ['amount', 'transcationDate', 'isCredit'],
            include: [
                {
                    model: Account,
                    as: 'trk_user_account',
                    attributes: ['name'],
                    ...(account_id ? { where: { id:account_id } } : {})
                },
                {
                    model: Category, // will create a left join
                    as: 'trk_user_category', // Alias for the association
                    attributes: ['name'],
                    ...(category_id ? { where: { id:category_id } } : {})
                },
            ],
            order: [['transcationDate', 'ASC']],
            where: {
                user_id,
                transcationDate: {
                    [Op.between]: [
                        moment.utc(`${year}-01-01`).startOf('day').toDate(),
                        moment.utc(`${year}-12-31`).endOf('day').toDate(),   
                    ],
                },

            },
        });
        res.send(getSuccessResponse('', filterMonthlyTransactions(userData)))
    } catch (error) {
        console.log('error', error.message)
        res.send(getErrorResponse(error.message))
    }
   
}

const dashboard = async (req, res) => {
    const { user_id } = res
    let resData = {}
    try {
        const userData = await Expense.findAll({
            attributes: ['amount', 'transcationDate', 'isCredit'],
            include: [
                {
                    model: Account,
                    as: 'trk_user_account',
                    attributes: ['name'],
                },
                {
                    model: Category, // will create a left join
                    as: 'trk_user_category', // Alias for the association
                    attributes: ['name'],
                },
            ],
            order: [['transcationDate', 'ASC']],
            where: {
                user_id,
                transcationDate: {
                    [Op.between]: [MONTH_DATA[6], MONTH_DATA[-1]], // Filter by createdAt within the current month
                },
            },
        })

        if (!isArray(userData)) {
            let outputData = {
                totalIncome: 0,
                totalExpense: 0,
                totalBalance: [],
                monthlyBalance: {
                    monthlyIncome: [],
                    monthlyExpense: [],
                },
                latestTransaction: [],
            }
            const accountData = await Account.findAll({ where: { user_id } })
            if (!isArray(accountData)) {
                resData = getErrorResponse('No data found', outputData)
            } else {
                outputData.totalBalance = accountData.map((bank) => {
                    return {
                        bankName: bank.name.toUpperCase(), // Convert bank name to uppercase
                        amount: 0,
                    }
                })
                resData = getSuccessResponse('', outputData)
            }
            res.send(resData)
            return
        }

        const lastOneYrData = userData.filter((transaction) => {
            const transactionDate = moment(transaction.transcationDate)
            const yearAgo = moment().subtract(12, 'months')
            return transactionDate.isSameOrAfter(yearAgo, 'day')
        })

        const currentMonthData = userData.filter((transaction) => {
            const transactionDate = moment(transaction.transcationDate)
            const startOfMonth = moment().startOf('month')
            const endOfMonth = moment().endOf('month')
            return transactionDate.isBetween(
                startOfMonth,
                endOfMonth,
                null,
                '[]'
            ) // Adjusted to include both start and end dates
        })

        const bankBalance = filterBankAndCalculateAmount(lastOneYrData)
        const monthlyBalance = filterMonthlyTransactions(lastOneYrData)
        const latestTransaction = filterLatestRecord(lastOneYrData)

        const { totalIncome, totalExpense } = currentMonthData.reduce(
            (totals, cur) => {
                cur.isCredit
                    ? (totals.totalIncome += cur.amount)
                    : (totals.totalExpense += cur.amount)
                return totals
            },
            { totalIncome: 0, totalExpense: 0 }
        )
        resData = getSuccessResponse('', {
            totalIncome,
            totalExpense,
            totalBalance: bankBalance,
            monthlyBalance,
            latestTransaction,
        })
    } catch (error) {
        console.log('userData', error.message)
        resData = getErrorResponse('something went wrong')
    }
    res.send(resData)
}

module.exports = {
    dashboard,
    stack
}
