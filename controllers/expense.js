const db = require('../models/database')
const { expense: Expense } = db
const { getErrorResponse, getSuccessResponse } = require('../util/helper')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

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
    const startDate = new Date(req.query.startDate)
    const endDate = new Date(req.query.endDate)
    const isExpense = req.query.isExpense
    const category = req?.query?.category ?? null
    const account = req?.query?.account ?? null
    const isDataFormat = req?.query?.formatted ?? null

    let resData = ''
    let where = { user_id }
    try {
        if (startDate && endDate) {
            where.transcationDate = {
                [Op.between]: [startDate, endDate],
            }
        }
        if (isExpense) {
            where.isCredit = isExpense === '1' ? 0 : 1
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
        const response = await Expense.findAll({ where })

        resData = getSuccessResponse('', response)
        if (isDataFormat) {
            resData = getSuccessResponse(
                '',
                filterMonthlyTransactions(response)
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
        const response = await Expense.destroy({ where: { id: ids, user_id } })
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
