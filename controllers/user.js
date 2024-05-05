const db = require("../models/database");
const {hashSync,compareSync} = require('bcryptjs')
const User = db.users;
const Otp = db.otp;
const {getErrorResponse, getSuccessResponse} = require('../util/helper')
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
let statusData = {}

const upsert = async (req, res) => {
  const validation = validationResult(req);
  const { user_name, dob, gender, password,id } = req.body
  let hashedPass = hashSync(password ?? '', 12)
  if(validation?.errors?.length){
    res.status(200).send(getErrorResponse("error", validation?.errors))
    return ;
  }
  let info = { user_name, dob, gender, password:hashedPass, isActive:false };
  let resData = {}
  let msg=""
  try {
    const otp = Math.floor(10000 + Math.random() * 90000)
    if(id){
      const response = await User.update(info, {where:{id}})
      msg="updated"
    }else{
      const response = await User.create(info)
      const otpData = {
        user_id:response?.dataValues?.id,
        otp
      }
      await Otp.create(otpData)
      msg="added"
    }
    resData = getSuccessResponse(`User successfully ${msg}`, otp)
  } catch (error) {
    resData = getErrorResponse("error",error)
  }
  res.send(resData)
};

const list = async (req, res) => {
  try {
    const response = await User.findAll()
    resData = getSuccessResponse('',response)
  } catch (error) {
    resData = getErrorResponse(error.message)
  }
  res.send(resData)
};

const login = async(req, res) => {
  const { user_name, password } = req.body
  const errors = validationResult(req);
  if(errors.length){
    res.status(200).send(errors)
    return ;
  }
  let token = ""
  const userData = await User.findOne({ where: { user_name } });
  let doMatch = userData ? compareSync(password, userData?.password) : false
  let resData = {}
  if(doMatch){
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        user_id: userData.id,
    }
     token = jwt.sign(data, jwtSecretKey);
    resData = getSuccessResponse({userData, token})
  } else {
    resData = getErrorResponse("invalid credentials")
  }
  res.send(resData)
}

const otpVerify = async (req,res) => {
const {otp} = req.body
const {user_id} = res
let resData =  {}
try {
  const userData = await Otp.findOne({where: {user_id}})
  console.log("userData", userData)
  if(otp == userData.otp){
    await User.update({ isActive: true }, {where:{id:user_id}})
    await Otp.destroy({where:{id:user_id}})
    resData = getSuccessResponse("Otp verified successfully")
  }else{
    resData = getErrorResponse("Invalid Otp")
  }
} catch (error) {
  resData = getErrorResponse(error.msg)
}
res.send(resData)
}

module.exports = {
    upsert,
    login,
    list,
    otpVerify
}