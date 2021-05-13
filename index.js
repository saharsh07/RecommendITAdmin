const express = require('express')
const app = express()
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./database/connection');


dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 4000
app.use(express.static('public'))
app.set('view engine', 'ejs')

//model:
const ProductItem = require('./models/productItem')
// const Admin = require('./models/login')

// mongodb connection
connectDB();

var flag = 0;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
//modules require for authentication
let session = require("express-session");
let passport = require("passport");
let passportLocal = require("passport-local");
let localStrategy = passportLocal.Strategy;
let flash = require('connect-flash');

app.use(session({
    secret: "SomeSecret",
    saveUninitialized: false,
    resave: false
}));
app.use(flash());//maintains error message

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//passport user config

//create user model instance
let userModel = require('./models/login');
let Admin = userModel.Admin;

//Strategy 
passport.use(Admin.createStrategy());

//serialize and deserialize Admin info
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.get('/logout', requireAuth, (req, res, next) => {
    req.logOut();
    res.redirect('/login');
});
app.get('/admin', requireAuth, (req, res, next) => {
    ProductItem.find()
    .then(result => {
        const productData = result
        const randomData = productData.sort(() => .5 - Math.random()).slice(0, 6)
        
        res.render('indexAdmin',{ productData, randomData })
    })
    .catch(err => console.log(err))
    
});

app.get('/', requireAuth, (req, res, next) => {
    ProductItem.find()
    .then(result => {
        const productData = result
        const randomData = productData.sort(() => .5 - Math.random()).slice(0, 6)
        
        res.render('indexAdmin',{ productData, randomData })
    })
    .catch(err => console.log(err))
    
});

app.get('/login', (req, res, next) => {
    if (!req.user) {
        res.render('login', {
            title: 'Login',
            messages: req.flash('loginMessage')
        });
    } else {
        return res.redirect('/admin');
    }
});
//Get Route for displaying the Register page 
app.get('/register', (req, res, next) => {
    //if user not already logged in
    if (!req.user) {
        console.log('in process register...controller');
        res.render('register',
            {
                messages: req.flash('registerMessage')
            }
        );

    } else {
        //if user does exist
        return res.render('login');
    }
});

//POST route for processing the Register page 
app.post('/register', (req, res, next) => {
    //initate user object
    console.log('in process register...controller');
    console.log(req.body);
    let newUser = Admin(
        {// password:req.body.password
            username:req.body.username,
            email: req.body.email   
        }
    );
    Admin.register(newUser, req.body.password, (err) => {

        if (err) {
            console.log("error inserting user"+err.name);
            if (err.name == "UserExistsError") {
                req.flash(
                    'registerMessage',
                    'Registeration Error: Admin Already Exists!'
                );
                console.log('Error: Admin Already Exists! ');
            }
            return res.render('register', {
                messages: req.flash('registerMessage')
            });
        } else {
            //if no error exists
            //so registeration is successful

            //redirect the user and authenticate them 
            return passport.authenticate('local')(req, res, () => {
                res.redirect('/login');
            });
        }
    })


});

app.post('/login', (req, res, next) => {

    passport.authenticate('local',
        (err, user, info) => {
            if (err) {
                return next(err);
            }
            // is there user login error?
            if (!user) {
                req.flash('loginMessage', 'Authentication Error');
                return res.redirect('/login');
            }
            req.login(user, (err) => {
                //server error
                if (err) {
                    return next(err);
                }
                return res.redirect('/admin');
            })
        })(req, res, next);
});


function requireAuth(req, res, next) {
    //Admin is logged in?
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

app.get('/', (req, res) => {
    ProductItem.find()
    .then(result => {
        res.render('index', {productData: result})
    })
    .catch(err => console.log(err))
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.get("/login", (req, res) => {
//     res.render("login");
// })

// app.post("/login", async(req, res) => {
//     try{
//         const email = req.body.email;
//         const password = req.body.password;
//         console.log(`${email} and password is ${password}`);
//         const useremail = await Admin.findOne({email:email});
//         //res.send(useremail);
//         if(useremail.password === password){
//             ProductItem.find()
//             .then(result => {
//                 res.render('indexAdmin', {productData: result});
//             })
//             .catch(err => console.log(err))
//         }else{
//             res.send("Invalid user id or password");
//         }
//     }
//     catch(error){
//         console.log("Invalid");
//         res.status(400).send("invalid email");
//     }
// })

app.get('/add', requireAuth, (req, res) => {
    ProductItem.find()
        .then(result => {
            // console.log('result:', result)
            // console.log('result length:', result.length);
            const productData = result
            const randomData = productData.sort(() => .5 - Math.random()).slice(0, 6)
            //  console.log('randomData .5: ', randomData);
            res.render('add', { productData, randomData })
        })
        .catch(err => console.log(err))
})


app.post('/add', requireAuth, (req, res) => {
    // console.log(req.body);
    const newProductItem = new ProductItem({
        productName: req.body.productName,
        pictureLink: req.body.pictureLink,
        promo: req.body.promo,
        price: req.body.price,
        description: req.body.description,
        shopLink: req.body.shopLink
    })
    // console.log("newproducttem?: ", newProductItem)
    newProductItem.save()
        .then(result => {
            // res.send(result)
            res.redirect('/added/' + newProductItem.productName)
        })
        .catch(err => console.log(err))
})

app.get('/added/?:productName', requireAuth, (req, res) => {
    console.log(req.params);
    res.render('added', {productName: req.params.productName })
})
app.get('/details/:productId', (req, res) => {
    console.log('req.params.productId', req.params.productId);
    // res.end()
    ProductItem.findById(req.params.productId)
  .then((result) => {
    //   res.send(result)
      res.render('details', {product: result})
  })
  .catch(err => console.log(err))
})

//Admin
app.get('/detailsAdmin/:productId', (req, res) => {
    console.log('req.params.productId', req.params.productId);
    // res.end()
    ProductItem.findById(req.params.productId)
  .then((result) => {
    //   res.send(result)
      res.render('detailsAdmin', {product: result})
  })
  .catch(err => console.log(err))
})

//Admin
app.put('/edit/products/?:id', requireAuth, (req, res) => {
    console.log("put\n" + req.body)
    console.log(req.body)
    // const updatedProduct = {
    //     productName: req.body.productName, 
    //     pictureLink: req.body.pictureLink, 
    //     promo: req.body.promo,
    //     price: req.body.price, 
    //     description: req.body.description,
    //     shopLink: req.body.shopLink
    // }

    ProductItem.findByIdAndUpdate(req.params.id, req.body)
        .then(result => {
            res.redirect(`/detailsAdmin/${req.params.id}`)
        })
        .catch(err => console.log(err))
})




// app.get('/deleted', requireAuth, (req, res) => {
//     res.render('deleted')
// })
// app.delete('/deleted', requireAuth, (req, res) => {
//     res.render('deleted')
// })

// app.get('/details/:productId/delete', requireAuth, (req, res) => {
//     ProductItem.findByIdAndDelete(req.params.productId)
//         .then(result => res.redirect('/deleted'))
//         .catch(err => console.log(err))
// })
//Admin
app.delete('/delete/products/:productId', requireAuth, (req, res) => {
    console.log('delete');
    ProductItem.findByIdAndDelete(req.params.productId)
        .then(result => {
            console.log("Deleted Success")
        })
        .catch(err => console.log(err))
})

app.get('/deleted', requireAuth, (req, res) => {
    res.render('deleted')
})



app.use((req, res) => {
    res.status(404).render('404')
})

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});

// app.ready(function(){ 
//     $(window).scrollTop(function(){ 
//         if ($(this).scrollTop() > 100) { 
//             $('#scroll').fadeIn(); 
//         } else { 
//             $('#scroll').fadeOut(); 
//         } 
//     }); 
//     $('#scroll').click(function(){ 
//         $("html, body").animate({ scrollTop: 0 }, 600); 
//         return false; 
//     }); 
// });