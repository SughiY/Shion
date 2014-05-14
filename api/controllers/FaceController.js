/**
 * FaceController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var cv = require('opencv'); //opencv bindings
var gm = require('gm'); //graphicsmagick
var fs = require('fs'); //File System
var crypto = require('crypto'); //Used for hashing filename

module.exports = {

    getImages: function(session, socket){ 
        socket.on('capture', function(data){
                    var userFacePath = './serverFiles/image/' + data.UserId                      
                    if(!fs.existsSync(userFacePath))
	                {
                        fs.mkdir(userFacePath);
                    }
                    var pgmPath = userFacePath + '/' + hashFilename() 
                    cropFaceGray(data, pgmPath, function(err){
                        if(err){
                            console.log('server log:face is not detected, need one more face')
                            socket.emit('noface')
                        } else {
                            Face.create({
                                UserId   : data.UserId,
                                pgm_path : pgmPath + '.pgm'
                            }).done(function(err, face){
                                if(err){
                                    console.log("server log: Face error")
                                } else {
                                    console.log("server log: Face has been added in Mongo")
                                    socket.emit('getface')
                                }
                            })
                        }
                    }) 
            })


        socket.on('startTraining', function(data){
            //setBaseData()
            findFaceAndTrain(data.UserId, function(err){
                if(err){
                    console.log('server log: error in training')
                } else {
                    console.log('server log: succes in training')
                    //socket.emit()
                }
            })
        })
    },

        /**
         * Overrides for the settings in `config/controllers.js`
         * (specific to FaceController)
         */
        _config: {}


};

//Initialize FaceRecognizer variables
lbphFaceRecognizer = cv.FaceRecognizer.createLBPHFaceRecognizer(1,8,8,8,75);

function train(faces, user, callback){
    console.log("server log: enter the train function")
    //initialize the trainingdata
    var trainingData = []
    for(i = 0; i < faces.length; i++){
        if(!fs.existsSync(faces[i].pgm_path)){
            console.log("There isn't the path:" + faces[i].pgm_path)
        } else {
            trainingData.push([faces[i].pgm_path, faces[i].UserId])
        }
    }

    console.log(trainingData)
    console.log('server log: creating path if not exist')
    trainingDataPath = './serverFiles/trainingdata/' + user + '/'
    if(!fs.existsSync(trainingDataPath)){
        fs.mkdir(trainingDataPath)
    }

    console.log("server log: creating lbphface training data")
    hashNameLpbh = 'TD_' + hashFilename() + '.xml'
    lbphFaceRecognizer.trainSync(trainingData)
    lbphFaceRecognizer.saveSync(trainingDataPath + hashNameLpbh)

    TrainingData.create({
        LBPHFace_path : trainDataPath + hashNameLpbh,
        UserId        : user
    })
    .done(function(err, trainingdata){
        if(err){
            console.log('server log: error for creating trainingdata')
            return callback(err)
        } else {
            console.log('server log: success for creating trainingdata')
            return callback(null)
        }
    })
}

function findFaceAndTrain(user, callback){

    console.log("server log: enter the findFaceAndTrain function")
    
    //Initialize Empty Faces
    var faces = [];
    
    Face.find({UserId: user})
    .done(function(err, faces){
        if(err && !faces){
            console.log("server log: error in finding faces")
            return callback(err)
        } else {
            console.log("server log: found faces")
            if(faces.length > 1){
                train(faces, user, function(err){
                    if(err){
                        console.log("server log: error in train")
                        return callback(err)
                    } else {
                        console.log("server log: success in train")
                        return callback(null)
                    }
                }) 
            } else {
                console.log("server log: error in train - the faces are not enough")
                var err = "faces aren't enough"
                return callback(err)
            }
        }
    })

}

function cropFaceGray(data, pgmPath, callback){
        
        var base64noHead = data.image.replace(/^data:image\/\w+;base64,/,"")
        var bitmap = new Buffer(base64noHead, 'base64') 
        
        cv.readImage(bitmap, function(err, im){
            im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){

                if (!faces){
                    console.log("No Faces")
                return err;
                }
                var face = faces[0]
                if(face && face.x){
                    var im2 = im.roi(face.x, face.y, face.width, face.height)
                    convertBufferToPGM(im2.toBuffer(), pgmPath, function(err){
                        if(err){
                            console.log('server log: convert error')
                            return callback(err = true)
                        } else {
                            console.log('server log: convert success')
                            return callback(err = false)
                        }
                    })
                } else {
                    return callback(err = true)
                }

            })
        })
}

               //Hashing Filename using date
function hashFilename()
{
    var date = new Date();
    var isoDate = date.toISOString();
    var shasum = crypto.createHash('sha1');
    return shasum.update(isoDate).digest('hex');
}

function convertBufferToPGM(databuffer, imagepath, callback)
{
    console.log("SERVER LOG: Inside convertBufferToPGM");
    err = null;
    console.log(imagepath);
    gm(databuffer)
        .setFormat('pgm')
        .resize(92, 112, "!")
        .write(imagepath + '.pgm',function(err){
            return callback(err);
        });
}
            
function setBaseData(){ 
    for(i=1; i<=40; i++){
        var baseFacesPath = './serverFiles/image/baseImageDatas/s'
            var userPath = baseFacesPath + i +'/'
            var fakeUserId = hashFilename()
            for(j=1; j<=10; j++){
                var facePath = userPath + j + '.pgm'
                    Face.create({
                        UserId  : fakeUserId,
                        pgm_path: facePath,
                        isBase  : true
                    }).done(function(err, faces){
                        if(err){
                            console.log('error for getting base data')
                        } else {
                            console.log('success for getting base data')
                        }
                    })
            }
    }
}
