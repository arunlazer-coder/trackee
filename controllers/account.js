const db = require('../models/database')
const { account: Account } = db
const { getErrorResponse, getSuccessResponse } = require('../util/helper')

const upsert = async (req, res) => {
    const { name, id } = req.body
    const { user_id } = res
    let info = { name, user_id }
    let resData = {}
    let msg = ''
    try {
        if (id) {
            await Account.update(info, { where: { id } })
            msg = 'updated'
        } else {
            await Account.create(info)
            msg = 'added'
        }
        resData = getSuccessResponse(`Account ${msg} successfully`)
    } catch (error) {
        resData = getErrorResponse(error.message)
    }
    res.send(resData)
}

const list = async (req, res) => {
    let resData = {}
    const { user_id } = res
    const where = { user_id }
    try {
        const response = await Account.findAll({ where })
        resData = getSuccessResponse('', response)
    } catch (error) {
        resData = getErrorResponse(error.message)
    }
    res.send(resData)
}

const destroy = async (req, res) => {
    const { ids } = req.body
    const { user_id } = res
    let resData = {}
    try {
        await Account.destroy({ where: { id: ids, user_id } })
        resData = getSuccessResponse('Categories Deleted Successfully')
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
