function messageResponse(status, message){
    return {
        status,
        message
    }
}

function dataResponse(status, data){
    return {
        status,
        data
    }
}

function errorResponse(status, error){
    return {
        status,
        message: error.message || error
    }
}

module.exports = {messageResponse, dataResponse, errorResponse};