var cv = require('opencv')
var fs = require('fs')

var lbphFaceRecognizer = cv.FaceRecognizer.createLBPHFaceRecognizer(1,8,8,8,75)
var baseDataPath = './image/baseImageDatas/s'
lbphFaceRecognizer.loadSync('./trainingdata/5373a4deb93e86d30b6418f2/TD_920f978fc1387ab5f66f0d0761b8a1ed3641d3b0.xml')
// initialize result
var result = []
for (i = 1; i <= 40; i++){
    var dataPath = baseDataPath + i + '/'   
    // initialize persons result
    var personResult =[i + '\n']
    for ( j = 1; j <= 10; j++){
        var imagePath = dataPath + j + '.pgm'
        cv.readImage(imagePath, function(err, im){
           if(err) { return callback(err, null)}
					var label = lbphFaceRecognizer.predictSync(im).id,
                    distance  = lbphFaceRecognizer.predictSync(im).confidence 
           personResult.push([label, distance + '\n'])   
        })
    }
    result.push(personResult)
}

fs.writeFile('./result.txt', result, function(err){
    if(err){
        console.log('writeFile error')
    } else {
        console.log('writeFile success')
    }
})
