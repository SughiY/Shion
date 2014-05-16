/**
 * Face
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
	  pgm_path:{
		  type:'string',
		  required:true,
		  unique:true,
	  },
	  
	  UserId:{
		  type:'String',
		  required:true		  
	  },

  }

};
