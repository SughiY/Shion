var cv = require('opencv')
var fs = require('fs')
var knox = require('knox')

var amazon_url = 'http://s3.amazonaws.com/' + 'suighysanctuary'
var knox_params = {
    key: 'AKIAIO7ITXOPYPEUYPBA',
    secret: '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',
    bucket: 'suighysanctuary',
    region: 'eu-west-1'
}
var client = knox.createClient(knox_params)

var lbphFaceRecognizer = cv.FaceRecognizer.createLBPHFaceRecognizer(1,8,8,8,75)

var baseDataPath = './image/baseImageDatas/s'


client.getFile('/trainingdata/5373a4deb93e86d30b6418f2/TD_920f978fc1387ab5f66f0d0761b8a1ed3641d3b0.xml', function(err, res){
  console.log(res.statusCode);
  console.log(res.headers);
  res.setEncoding('utf8');
  res.on('data', function(chunk){
        fs.writeFileSync('./test.xml',chunk )
           lbphFaceRecognizer.loadSync('./test.xml') 
            client.getFile('/image/5373a4deb93e86d30b6418f2/1aa39cebd3b3c324011819e695217b3117bd8865.pgm', function(err, res){
                console.log(res.statusCode);
                console.log(res.headers);
                res.on('data', function(chunk){
                    fs.writeFile('./test.pgm',chunk, function(err){
                        if(err) console.log(err) 
                           cv.readImage('test.pgm', function(err, im){
                               var label = lbphFaceRecognizer.predictSync(im).id,
                               distance  = lbphFaceRecognizer.predictSync(im).confidence 
                               console.log([label, distance])
                           })  
                    }) 
                })
        })
      
  });
}) 









