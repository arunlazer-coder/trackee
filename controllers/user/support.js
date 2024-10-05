const db = require('../../models/database')
const { otp: Otp } = db
const sendOtp = require('../../util/sendOtp')
const jwt = require('jsonwebtoken')

const filterMonthlyTransactions = (transactions) => {
    const monthlyTransactions = {
        monthlyIncome: [],
        monthlyExpense: [],
    }

    // Initialize objects to store income and expense for each month
    let monthlyIncome = {}
    let monthlyExpense = {}
    let months = Array.from({ length: 12 }, (e, i) => 
        new Date(0, i).toLocaleString('en', { month: 'long' })
      );
    months.forEach((x) => { {monthlyIncome[x] = 0; monthlyExpense[x] = 0} })

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

const generateOtpFlow = async ({user_name, name, response}) => {
    const otp = Math.floor(10000 + Math.random() * 90000)
    await sendOtp({to:user_name, name}, otp);
    await Otp.create({
        user_id: response?.dataValues?.id,
        otp,
    })
    return jwt.sign({  time: Date(),  user_id: response?.dataValues?.id, }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' })
}

module.exports = {
    filterMonthlyTransactions,
    filterBankAndCalculateAmount,
    filterLatestRecord,
    generateOtpFlow
}
