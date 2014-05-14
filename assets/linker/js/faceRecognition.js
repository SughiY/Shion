(function(){


navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia

$(document).ready(function(){
    
    $('#faceRecognition').click(function(){
        $('#faceRecognition').attr("disabled", true);
            createVideo()
    })

})


})()


function createVideo(){

    var  socket = io.connect()
        ,video = document.createElement('video')
        ,details = document.createElement('details')   
        ,container = document.getElementById('top')

        video.width = 320
        video.height = 240
        getVideo(video, details)
        details.appendChild(video)
        container.insertBefore(details, container.lastChild)
}

function getSignal(){
    io.connect().on('captureBack', function(data){
        var canvas = document.getElementById('canvas') 
        var ctx = canvas.getContext('2d')
        var image = new Image()
        image.src = data.url
        ctx.drawImage(image,0,0)
    })
}

function getVideo(video, details){
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                {video: true}
                ,function(stream) {
                    video.src = window.URL.createObjectURL(stream)
                    video.setAttribute('autoplay',true);
                    details.setAttribute('open',true);
                }
                ,function(e) {console.log('Reeeejected!', e)})
        } else {
            video.src = 'somevideo.webm' // fallback.
        }
}
