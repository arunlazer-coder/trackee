const { expense } = require('../models')
const db = require('../models/database')
const { expense: Expense, account: Account, category: Category } = db
const { getErrorResponse, getSuccessResponse } = require('../util/helper')
const { validationResult } = require('express-validator')
const { Op, Sequelize } = require('sequelize')
const moment = require('moment')
const upsert = async (req, res) => {
    const {
        amount,
        description,
        category_id,
        account_id,
        isCredit,
        transcationDate,
        moneyType,
        id,
    } = req.body
    const { user_id } = res
    const validation = validationResult(req)
    let resData = {}
    let msg = ''
    if (validation?.errors?.length) {
        res.send(getErrorResponse('error', validation?.errors))
        return
    }
    let info = {
        amount,
        description,
        user_id,
        category_id,
        account_id,
        isCredit,
        moneyType,
        transcationDate,
    }
    try {
        if (id) {
            const expenseUpdate = await Expense.update(info, { where: { id } })
            if (!expenseUpdate.includes(0)) {
                msg = 'updated'
            }
        } else {
            const expenseInsert = await Expense.create(info)
            if (expenseInsert?.dataValues?.id) {
                msg = 'added'
            }
        }
        resData = msg
            ? getSuccessResponse(`Expenses ${msg} successfully`)
            : getErrorResponse('invalid id or content')
    } catch (error) {
        resData = getErrorResponse(error.message)
    }
    res.send(resData)
}

function filterMonthlyTransactions(transactions) {
    const monthlyTransactions = {
        monthlyIncome: [],
        monthlyExpense: [],
    }

    // Initialize objects to store income and expense for each month
    const monthlyIncome = {}
    const monthlyExpense = {}

    transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transcationDate)
        const monthName = transactionDate.toLocaleString('en-US', {
            month: 'long',
        })
        const amount = transaction.amount
        const isCredit = transaction.isCredit

        if (!monthlyIncome[monthName]) {
            monthlyIncome[monthName] = 0
        }
        if (!monthlyExpense[monthName]) {
            monthlyExpense[monthName] = 0
        }

        isCredit
            ? (monthlyIncome[monthName] += amount)
            : (monthlyExpense[monthName] += amount)
    })

    // Convert the monthlyIncome and monthlyExpense objects into arrays of objects
    // and push them into monthlyTransactions array
    Object.keys(monthlyIncome).forEach((month) => {
        monthlyTransactions.monthlyIncome.push({
            month,
            income: monthlyIncome[month],
        })
    })

    Object.keys(monthlyExpense).forEach((month) => {
        monthlyTransactions.monthlyExpense.push({
            month,
            expense: monthlyExpense[month],
        })
    })

    return monthlyTransactions
}

const list = async (req, res) => {
    const { user_id } = res
    let {
        isExpense,
        category,
        account,
        formatted: isDataFormat,
        startDate,
        endDate,
        month,
        page = 1,
        pageSize = 10,
    } = req.query

    startDate = startDate ? moment(startDate, 'YYYY-MM-DD').format('YYYY-MM-DD') : null;
    endDate = endDate ? moment(endDate, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD') : null;
    if (month) {
        startDate = moment().subtract(month - 1, 'months').startOf('month').format('YYYY-MM-DD');
        endDate = moment().subtract(month - 1, 'months').endOf('month').format('YYYY-MM-DD');
    }
    let resData = ''
    let where = { user_id }
    let order = isDataFormat ? [['transcationDate', 'ASC']] : [['transcationDate', 'DESC']]
    try {
        if (startDate && endDate) {
            where.transcationDate = {
                [Op.between]: [startDate, endDate],
            }
        }
        if (isExpense) {
            where.isCredit = isExpense !== '1'
        }
        if (category) {
            where.category_id = {
                [Op.in]: [...category],
            }
        }
        if (account) {
            where.account_id = {
                [Op.in]: [...account],
            }
        }

        const limit = parseInt(pageSize, 10)
        const offset = (parseInt(page, 10) - 1) * limit

        const response = await Expense.findAndCountAll({
            where,
            order,
            include: [
                {
                    model: Account,
                    attributes: [],
                },
                {
                    model: Category,
                    attributes: [],
                },
            ],
            attributes: {
                include: [
                    [Sequelize.col(`${Account.name}.name`), 'account'],
                    [Sequelize.col(`${Category.name}.name`), 'category'],
                ],
            },
            limit,
            offset,
        })

        const { count, rows } = response
        const totalPages = Math.ceil(count / limit)
        const currentPage = parseInt(page, 10)

        resData = getSuccessResponse('', {
            count,
            totalPages,
            currentPage,
            rows,
        })
        if (isDataFormat) {
            resData = getSuccessResponse(
                '',
                {
                    count,
                    totalPages,
                    currentPage,
                    rows: filterMonthlyTransactions(rows),
                }
            )
        }
    } catch (error) {
        resData = getErrorResponse(error.message)
    }
    res.send(resData)
}


const destroy = async (req, res) => {
    const { ids } = req.body
    const user_id = res.user_id
    let resData = {}
    try {
        await Expense.destroy({ where: { id: ids, user_id } })
        resData = getSuccessResponse('Expenses Deleted Successfully')
    } catch (error) {
        resData = getErrorResponse(error.message)
    }
    res.send(resData)
}

module.exports = {
    upsert,
    list,
    destroy,
}
