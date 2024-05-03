const db = require("../models/database");
const Expense = db.expense;
const {getErrorResponse, getSuccessResponse} = require('../util/helper')
const { validationResult } = require("express-validator");
const { Op } = require('sequelize');

const upsert = async (req, res) => {
  const { amount, type, description, category_id, account_id, isCredit, transcationDate, moneyType, id } = req.body
  const {user_id} = res
  const validation = validationResult(req);
  let resData = {}
  let msg = ""
  if(validation?.errors?.length){
    res.send(getErrorResponse("error", validation?.errors))
    return ;
  }
  let info = { amount, type, description, user_id, category_id, account_id, isCredit, moneyType, transcationDate };
  try {
    if(id){
      msg = "updated"
      await Expense.update(info, {where:{id}})
    }else{
      msg = "added"
      await Expense.create(info)
    }
    resData = getSuccessResponse(`Expenses ${msg} successfully`)
  } catch (error) {
    resData = getErrorResponse(error.message)
  }
  res.send(resData)
};

const list = async (req, res) => {
  const {user_id} = res
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(req.query.endDate)
  const type = req.query.type
  const isExpense = req.query.isExpense
  const category = req?.query?.category ?? null
  const account = req?.query?.account ?? null
  let resData = ''
  let where = {user_id}
  try {
    if(startDate && endDate){
      where.transcationDate = {
        [Op.between]: [startDate, endDate]
      }
    }
    if(type){
      where.type = type
    }
    if(isExpense){
      where.isCredit = isExpense === "1" ? 0 : 1
    }
    if(category){
      where.category_id = {
          [Op.in]: [...category]
      }
    }
    if(account){
      where.account_id = {
          [Op.in]: [...account]
      }
    }
    const response = await Expense.findAll({where})
    resData = getSuccessResponse('',response)
  } catch (error) {
    resData = getErrorResponse(error.message)
  }
  res.send(resData)
};

const destroy = async (req, res) => {
  const {ids} = req.body
  const user_id = res.user_id
  let resData ={}
  try {
    const response = await Expense.destroy({ where: { id: ids, user_id }})
    resData = getSuccessResponse('Expenses Deleted Successfully')
  } catch (error) {
    resData = getErrorResponse(error.message)
  }
  res.send(resData)
};


module.exports = {
  upsert,
  list,
  destroy
}