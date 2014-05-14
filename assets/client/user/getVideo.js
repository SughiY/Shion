(function(){


navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia

$(document).ready(function(){

    if (navigator.getUserMedia) {
    navigator.getUserMedia(
      {video: true}
     ,function(stream) {
        document.getElementById('capture').src = window.URL.createObjectURL(stream)
    }
     ,function(e) {console.log('Reeeejected!', e)})
    } else {
        video.src = 'somevideo.webm' // fallback.
    }
    
    $('button').click(function(){
        $('button').attr("disabled", true);
        sendVideo()
    })


})


})()


function sendVideo(){

    var userId =  window.location.pathname.split('/')[3]
    var sendV = function(){

        var socket = io.connect()
            ,   canvas = document.createElement('canvas')
            ,   video  = document.getElementById('capture')
            canvas.width = 320
            canvas.height = 240

            var ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, 320, 240)
            socket.emit('capture', {
                'image'    :canvas.toDataURL('image/jpeg'), 
                'UserId'   :userId
            })
    } 
    var count = 0
    var face = function(){setTimeout(sendV, 500)}
    face();count++
    socket.on('noface', function(){
        console.log('resend a face')
        $('#attention').text("Shion can't catch your face. Maybe you can try to change your position")
        face()
    }) 
    socket.on('getface',function(){
        console.log(count) 
        if(count < 10){
            face()
            $('#attention').text("Shion have got " + count + " faces")
        } else {
            $('#attention').text("Thanks for your cooperation. Shion have recorded your face")
            socket.emit('startTraining', {
                UserId: userId
            })
        }
        count++
    })
}

function getVideo(){
    io.connect().on('captureBack', function(data){
        var canvas = document.getElementById('canvas') 
        var ctx = canvas.getContext('2d')
        var image = new Image()
        image.src = data.url
        ctx.drawImage(image,0,0)
    })
}
