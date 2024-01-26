const getSuccessResponse = (msg='',response={}) => {
    return {
        status:true,
        msg,
        response
    }
}

const getErrorResponse = (errorMsg="", response={}) => {
    return {
        status:false,
        errorMsg,
        response
    }
}

module.exports = {
    getErrorResponse,
    getSuccessResponse
}