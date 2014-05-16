(function(){


navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia

$(document).ready(function(){
    
    $('#faceRecognition').click(function(){
        var emailAddr = document.getElementsByName('email')[0].value,
            div = document.getElementById('floatContainer')
        if(!div){
            var container = document.getElementById('top'),
                summary = document.createElement('summary')
            div = document.createElement('details')   
            div.setAttribute('id', 'floatContainer')
            div.setAttribute('class', 'community-bulletin')
            div.appendChild(summary)
            container.insertBefore(div, container.lastChild)
        }

        if(!emailAddr){
            $('summary').text('Please insert your email.')
        } else if(!isValidEmailAddress( emailAddr )){
            $('summary').text("Your mail's format is not correct.")
        } else {
            $('#faceRecognition').attr("disabled", true);
            createVideo(div, emailAddr)
        }
    })

})


})()


function createVideo(div, emailAddr){

    var  socket = io.connect()
        ,video = document.createElement('video')
        ,container = document.getElementById('top')

        video.width = 320
        video.height = 240
        getVideo(emailAddr, video, div)
        if(div.childElementCount > 1) div.removeChild(div.lastChild)
        div.appendChild(video)
        $('summary').text('')
        div.setAttribute('open', true)
}

function getVideo(emailAddr, video, div){
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                {video: true}
                ,function(stream) {
                    video.src = window.URL.createObjectURL(stream)
                    video.setAttribute('autoplay',true)
                    sendImageAndEmail(emailAddr, video, div)
                }
                ,function(e) {console.log('Reeeejected!', e)})
        } else {
            video.src = 'somevideo.webm' // fallback.
        }
}

function sendImageAndEmail(emailAddr, video, div){
        face(video, emailAddr)
        socket.on('RecError', function(data){
           $('#faceRecognition').attr("disabled", false)
           appendText(data.text) 
        })
        socket.on('Login', function(data){
            appendText(data.text) 
            location.href = data.addr
        })

        socket.on('faceError', function(data){
            console.log('resend a face')
            appendText(data.text) 
            face(video, emailAddr)
        })
}

function appendText(text){
    $('summary').text(text)
}

function sendV(video, emailAddr){

    var socket = io.connect()
        ,   canvas = document.createElement('canvas')
        canvas.width = 320
        canvas.height = 240

        var ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, 320, 240)
        socket.emit('faceForRec', {
            'face'    :canvas.toDataURL('image/jpeg'), 
            'email'   :emailAddr
        })
} 

var face = function(video, emailAddr){setTimeout(sendV(video, emailAddr), 1000)}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};
