let users = []

//here ew will create the four methods like add remove which room and room

let addUser = ({id,userName,room})=>{
    userName = userName.trim().toLowerCase()
    room  = room.trim().toLowerCase()
    //validate
    if(!userName||!room){
        return {    
            err:'user name and room is required'
        }
    }

    //please make sure that the more than one username with the same name is restricted checking fir ecxisting user
    const existingUser = users.find((user)=>{
        return user.room===room&&user.userName===userName
    })

    if(existingUser){
        return {
            error:'sorry :( user name already in use'
        }
    }

    const user = {id,userName,room}
    users.push(user)

    return {user}
}

const removeUser = (id)=>{
    let index = users.findIndex((user)=>{
        return user.id===id
    })

    if(index!== -1){
        return users.splice(index,1)[0]//this will returned the array of removed data 
    }
}

const getUser = (id)=>{
    let user = users.find((user)=>user.id===id)
    return user    
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room===room )
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}
