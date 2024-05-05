const db = require("../models/database");
const Category = db.category;
const {getErrorResponse, getSuccessResponse} = require('../util/helper')

const upsert = async (req, res) => {
  const { name,id } = req.body
  const {user_id} = res
  let info = { name, user_id };
  let resData ={}
  let msg =""
  try {
    if(id){
      await Category.update(info, {where:{id}})
      msg="updated"
    } else{
      await Category.create(info)
      msg="added"
    }
    resData = getSuccessResponse(`Category ${msg} successfully`)
  } catch (error) {
    resData = getErrorResponse(error.message)
  }
  res.send(resData)
};

const list = async (req, res) => {
  const {user_id} =res
  let resData ={}
  try {
    let where = {user_id}
    const response = await Category.findAll({where})
    resData = getSuccessResponse('',response)
  } catch (error) {
    resData = getErrorResponse(error.message)
  }
  res.send(resData)
};

const destroy = async (req, res) => {
  const {ids} = req.body
  const {user_id} =res
  let resData ={}
  try {
    const response = await Category.destroy({ where: { id: ids, user_id }})
    resData = getErrorResponse("invalid category")
    if(response){
      resData = getSuccessResponse('Categories Deleted Successfully')
    }
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