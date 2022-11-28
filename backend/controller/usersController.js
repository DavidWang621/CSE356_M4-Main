var bcrypt = require('bcrypt');
var UserModel = require('../models/userInfo');
var { exec } = require('child_process');

class usersController {
    static async signUpUser(req, res, next) {
      var { name, email, password } = req.body;
      // console.log("signup", name, email, password);

      // check if email exist, if it does, don't let them add user
      var user = await UserModel.findOne({email});
      if (user){
          return res.status(200).json({ error: true, message: 'user exist' });
      }

      var key = makeKey();
      var hashpswd = await bcrypt.hash(password, 9);
      var user = new UserModel({
          name, 
          email, 
          password: hashpswd, 
          key: key
      });
      
      // twice.cse356.compas.cs.stonybrook.edu
      var mail_body = "http://twice.cse356.compas.cs.stonybrook.edu/users/verify?email="+encodeURIComponent(email)+"&key="+key;
      var script = "echo \"" + mail_body + "\" | mail -s \"Verification Link\" --encoding=quoted-printable " + email;
      // console.log("Script", script);
      exec(script, (error, stdout, stderr) => {
          if (error) {
              // console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              // console.log(`stderr: ${stderr}`);
              return;
          }
        // console.log(`stdout here: ${stdout}`);
      });
      // console.log("after mailing");
      
      await user.save(); 
      // console.log("user saved");
      return res.status(200).json({status: 'OK'});
    }

    static async loginUser(req, res, next) {
      var { email, password } = req.body;
      // console.log("email", email);
      // console.log("password", password);

      var user = await UserModel.findOne({email : email});
      if (!user) {
        return res.status(200).json({ error: true, message: 'invalid email' });
      }
      var isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        // console.log("ERROR wrong pass");
        return res.status(200).json({ error: true, message: 'wrong password' });
      }

      // res.status(200).cookie('session', { randomid: makeKey(), id: user._id, name: user.name }).json({status: 'OK', name: user.name});
      // console.log("sessionid cookie set", user._id);
      // // req.session.sessionid = user._id;
      // // console.log("SESSION CREATED", req.session.sessionid);
      req.session.session = { randomid: makeKey(), id: user._id, name: user.name }
      res.status(200).json({status: 'OK', name: user.name});
    }

    static async logoutUser(req, res, next) {
      req.session.destroy();
      // res.clearCookie('session').json({status: 'OK'});
      // req.session = null;
      // res.status(200).json({status: 'OK'});
    }

    static async verifyUser(req, res, next) {
      var { email, key} = req.query;
      // console.log("verify -- email", email, "key", key);
      var emailUser = await UserModel.findOne({email});
      var keyUser = await UserModel.findOne({key});
      if(emailUser === null){
          return res.status(200).json({ error: true, message: 'email is null' });
      }
      if(keyUser === null){
          return res.status(200).json({ error: true, message: 'key is null' });
      }
      if (emailUser._id.toString() != keyUser._id.toString()) {
          await userModel.deleteOne({email});
          return res.status(200).json({ error: true, message: 'user is not the same' });
      }

      // console.log("user verified");
      var curr_date = new Date();
      let result = {
          status: 'OK',
          email: email,
          date: curr_date, 
      };
      // console.log('verified', result);
      return res.status(200).json({status: 'OK', name: emailUser.name});
    }
};

function makeKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 20; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

module.exports = usersController;