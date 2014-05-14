/**
 * UserController
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

module.exports = {
    
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
   'new': function (req, res) {
  	res.view();
  },

  create: function (req, res, next) {

	  // Create a User with the params sent from 
	  // the sign-up form --> new.ejs
	  User.create( req.params.all(), function userCreated (err, user) {
	      
	      // // If there's an error
	      // if (err) return next(err);

	      if (err) {
	        // console.log(err);
	        req.session.flash = {
	          err: err
	        }

	        // If error redirect back to sign-up page
	        return res.redirect('/user/new');
	      }

	      // After successfully creating the user
	      // redirect to the show action
	      // From ep1-6: //res.json(user); 

          
	      res.redirect('/user/show/'+user.id);
	  });
   },
   
   // show the image data of user
   show: function (req, res, next) {
    User.findOne(req.param('id'), function foundUser (err, user) {
      if (err) return next(err);
      if (!user) return next();
      // Log user in
	  req.session.authenticated = true;
	  req.session.User = user;

      res.view({
        user: user
      });
    });

   }
  
};
