const db = require('../../models/database')
const { hashSync, compareSync } = require('bcryptjs')
const {
    user: User,
    otp: Otp,
} = db
const {
    getErrorResponse,
    getSuccessResponse,
} = require('../../util/helper')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const {dashboard, stack} = require('./general')
const {generateOtpFlow} = require('./support')
const upsert = async (req, res) => {
    const validation = validationResult(req)
    const { user_name, name, password, country } = req.body
    let hashedPass = hashSync(password ?? '', 12)
    if (validation?.errors?.length) {
        res.status(200).send(getErrorResponse(validation?.errors?.[0]?.msg))
        return
    }
    let info = {
        user_name,
        name,
        country,
        password: hashedPass,
        isActive: false,
    }
    let resData = {}
    let token;
    try {
        const response = await User.create(info)
        generateOtpFlow({user_name, name, response})
        resData = getSuccessResponse(`OTP sent successfully`, {token})
    } catch (error) {
        console.log(error.message)
        resData = getErrorResponse('error', error)
    }
    res.send(resData)
}

const login = async (req, res) => {
    const { user_name, password } = req.body
    const errors = validationResult(req)
    if (errors?.errors.length) {
        res.status(200).send(getErrorResponse(errors?.errors?.[0]?.msg))
        return
    }
    let token = ''
    const userData = await User.findOne({
        where: { user_name },
    })

    let doMatch = userData ? compareSync(password, userData?.password) : false
    let resData = {}
    if (doMatch) {
        let jwtSecretKey = process.env.JWT_SECRET_KEY
        let data = {
            time: Date(),
            user_id: userData.id,
        }
        token = jwt.sign(data, jwtSecretKey, { expiresIn: '6m' })
        resData = getSuccessResponse('', {
            userData: {
                id: userData.id,
                name: userData.name,
                user_name: userData.user_name,
                country: userData.country,
                isActive: userData.isActive,
            },
            token,
        })
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
    const {name,country} = req.body
    let resData = {}
    const userData = await User.findOne({ where: { id: user_id } })
    try {
        if (req.method === 'GET') {
            resData = userData
                ? getSuccessResponse('', userData)
                : getErrorResponse('no user found')
        }
        if (req.method === 'PATCH') {
            await userData.update({
                ...(name && { name }),
                ...(country && { country }),
            });
            resData = getSuccessResponse('Profile updated successfully', userData);
        }
    } catch (error) {
        resData = getErrorResponse('something went wrong')
    }
    res.send(resData)
}


module.exports = {
    upsert,
    login,
    otpVerify,
    profile,
    dashboard,
    stack
}
