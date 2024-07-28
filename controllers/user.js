const db = require('../models/database')
const { hashSync, compareSync } = require('bcryptjs')
const {
    user: User,
    otp: Otp,
    expense: Expense,
    account: Account,
    category: Category,
} = db
const {
    getErrorResponse,
    getSuccessResponse,
    isArray,
    MONTH_DATA,
} = require('../util/helper')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')
const moment = require('moment')

const upsert = async (req, res) => {
    const validation = validationResult(req)
    const { user_name, password, id, country } = req.body
    let hashedPass = hashSync(password ?? '', 12)
    if (validation?.errors?.length) {
        res.status(200).send(getErrorResponse(validation?.errors?.[0]?.msg))
        return
    }
    let info = {
        user_name,
        country,
        password: hashedPass,
        isActive: false,
    }
    let resData = {}
    let msg = ''
    try {
        const otp = Math.floor(10000 + Math.random() * 90000)
        if (id) {
            msg = 'updated'
        } else {
            const response = await User.create(info)
            const otpData = {
                user_id: response?.dataValues?.id,
                otp,
            }
            await Otp.create(otpData)
            msg = 'added'
        }
        resData = getSuccessResponse(`User successfully ${msg}`, otp)
    } catch (error) {
        resData = getErrorResponse('error', error)
    }
    res.send(resData)
}

const list = async (req, res) => {
    try {
        const response = await User.findAll()
        resData = getSuccessResponse('', response)
    } catch (error) {
        resData = getErrorResponse(error.message)
    }
    res.send(resData)
}

const login = async (req, res) => {
    const { user_name, password } = req.body
    const errors = validationResult(req)
    if (errors.length) {
        res.status(200).send(errors)
        return
    }
    let token = ''
    const userData = await User.findOne({ where: { user_name } })
    let doMatch = userData ? compareSync(password, userData?.password) : false
    let resData = {}
    if (doMatch) {
        let jwtSecretKey = process.env.JWT_SECRET_KEY
        let data = {
            time: Date(),
            user_id: userData.id,
        }
        token = jwt.sign(data, jwtSecretKey)
        resData = getSuccessResponse("",{ userData, token })
    } else {
        resData = getErrorResponse('invalid credentials')
    }
    res.send(resData)
}

const otpVerify = async (req, res) => {
    const { otp } = req.body
    const { user_id } = res
    let resData = {}
    try {
        const userData = await Otp.findOne({ where: { user_id } })
        if (otp == userData.otp) {
            await User.update({ isActive: true }, { where: { id: user_id } })
            await Otp.destroy({ where: { id: user_id } })
            resData = getSuccessResponse('Otp verified successfully')
        } else {
            resData = getErrorResponse('Invalid Otp')
        }
    } catch (error) {
        resData = getErrorResponse(error.msg)
    }
    res.send(resData)
}

const profile = async (req, res) => {
    const { user_id } = res
    let resData = {}
    try {
        const userData = await User.findOne({ where: { id: user_id } })
        if (userData) {
            resData = getSuccessResponse('',userData)
        } else {
            resData = getErrorResponse('no user found')
        }
    } catch (error) {
        resData = getErrorResponse('something went wrong')
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

const filterBankAndCalculateAmount = (transactions) => {
    const bankTransactions = {}

    transactions.forEach(({ trk_user_account, amount, isCredit }) => {
        const bankName = trk_user_account.name
        if (!bankTransactions[bankName]) {
            bankTransactions[bankName] = 0
        }
        // Add the amount if it's a credit, subtract if it's not
        isCredit
            ? (bankTransactions[bankName] += amount)
            : (bankTransactions[bankName] -= amount)
    })

    return Object.entries(bankTransactions).map(([bankName, amount]) => ({
        bankName: bankName.toUpperCase(), // Convert bank name to uppercase
        amount: amount,
    }))
}

const filterLatestRecord = (transactions) => {
    return transactions.map(
        ({ trk_user_account, trk_user_category, amount, isCredit }) => {
            return {
                amount,
                isCredit: !!isCredit,
                bankName: trk_user_account.name,
                category: trk_user_category.name,
            }
        }
    )
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
            where: {
                user_id,
                transcationDate: {
                    [Op.between]: [MONTH_DATA[6], MONTH_DATA[-1]], // Filter by createdAt within the current month
                },
            },
        })

        if (!isArray(userData)) {
            resData = getErrorResponse('No Data found')
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
        resData = getSuccessResponse('',{
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
    upsert,
    login,
    list,
    otpVerify,
    profile,
    dashboard,
}
