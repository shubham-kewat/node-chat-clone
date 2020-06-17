let socket = io()

socket.on('countUpdated',(count)=>{
    console.log('count has been updated to ',count)
})

// document.querySelector('button').addEventListener('click',()=>{
//     socket.emit('increment')
// })

let $formSubmission = document.querySelector('#form-submission')
let $inputMessage = $formSubmission.querySelector('input')
let $button = $formSubmission.querySelector('#msg')
let $locationButton = document.querySelector('#send-location')
let $messages = document.querySelector('#messages')


//templates
const $template = document.querySelector('#message-template').innerHTML
let $locationTemplate = document.querySelector('#location-template').innerHTML
let $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
let {userName,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})//to get the query string and to make ? away we had use ignorequeryprefix false to true
//mainly Qs will return the query string in the form of objects

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
   
    let html = Mustache.render($template,{
        // message:message
        userName:message.userName,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mma')//we has already add a moement in a script tag in index.html
    })//in the curly braces we will provide the valuer that we want to display in a chats in the form of key value pair 
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('location-message',(message)=>{
    let html = Mustache.render($locationTemplate,{
        userName:message.userName,
        link:message.location,
        sharedOn:moment(message.sharedOn).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$formSubmission.addEventListener('submit',(event)=>{
    // let message = document.getElementById("message").value    
    //alternative way given below
    event.preventDefault()
    $button.setAttribute('disabled','disabled')
    // disable
    let message = event.target.elements.message.value
   
    socket.emit('message',message,(error)=>{
        //enable here button
        $button.removeAttribute('disabled')
        $inputMessage.value=''
        $inputMessage.focus()
        if(error)
            return console.log(error)
        console.log('Message delivered')    

    })  
})

$locationButton.addEventListener('click',()=>{
    //to check weather browser suppoert the geolocation use the statement to check navigator.geolocation

    //disable location button
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('not supported by a browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('location',{
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
       },(message)=>{
           //enable location button        
           $locationButton.removeAttribute('disabled')          
       })
    })
})

socket.emit('join',{userName,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }    
})