//required modules for the Admin model

let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');

let Admin = mongoose.Schema(
     {
          email:
          {
               type: String,
               default: '',
               trim: true,
               required: 'email address is required'
          },
          username:
          {
               type:String,
               default:"",
               trim:true,
               required:'username is required'
          },

          //    password: 
          //    {
          //        type: String,
          //        default: '',
          //        trim: true,
          //        required: 'password is required'
          //    }    
          created: {
               type: Date,
               default: Date.now
          },
          update: {
               type: Date,
               default: Date.now
          }
     },
     {
          collection: "admins"
     }

);

let options=({missingPasswordError:'Wrong / Missing Password'});

Admin.plugin(passportLocalMongoose,options);


// const Admin = mongoose.model('Admin', UserSchema)
module.exports.Admin = mongoose.model('Admin',Admin);