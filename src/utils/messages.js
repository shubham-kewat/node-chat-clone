const generateMessage = (userName,text)=>{
    return {
        userName,
        text,
        createdAt:new Date().getTime()
    }
}

const locationMessage = (userName,location)=>{
    return {
        userName,
        location,
        sharedOn:new Date().getTime()
    }    
}

module.exports = {generateMessage,locationMessage}