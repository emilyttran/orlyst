//TO START SERVER: TYPE "node app.js" IN TERMINAL
//TO EXIT SERVER: HOLD CTRL + C + C
//IN ORDER TO SEE CHANGES, YOU WILL NEED TO RESTART THE SERVER

//****************DATABASE**********************
//TO START DATABASE: TYPE "./mongod"
//SHUT OFF DATABASE WHEN NOT IN USE BECAUSE IT'LL CRASH
//TO START MONGO SHELL: TYPE "mongo" IN SEPARATE TERMINAL AND DB RUNNING
//TO GET MONGO COMMANDS: TYPE "help" 



var express      = require("express"),
    app          = express(),
    bodyParser   = require("body-parser"),
    mongoose     = require("mongoose"),
    passport     = require("passport"),
    LocalStrategy= require("passport-local"),
    methodOverride= require("method-override"),
    User         = require("./models/user"),
    Item         = require("./models/item");

//CREATES AND CONNECTS DATABASE TO THE APP
mongoose.connect("mongodb://localhost/orlyst");

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");  
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This statement is false",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;       //everytime you change route, create currentUser object
    next();
});


app.get("/", function(req, res){             //landing
        res.render("landing");
    });
    
app.get("/dashboard", isLoggedIn, function(req, res){
    res.render("dashboard", {currentUser: req.user});
});

//INDEX OF ALL SELLER ITEMS
app.get("/sellerItems", isLoggedIn, function(req, res){           
        Item.find({}, function(err, allItems){
           if(err) 
                console.log(err);
            else
                res.render("sellerItems", {items:allItems});
        });
});

//FORM FOR NEW ITEMS
app.get("/sellerItems/new", isLoggedIn, function(req, res){      //New item to sell
    res.render("new");
});

//CREATE NEW USER ITEMS
app.post("/sellerItems", isLoggedIn, function(req, res){    
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    
    var newItem = {name:name, image:image, price:price, description:description, author:author};
    
    //Create new item and save it to database
    Item.create(newItem, function(err, newlyCreated){
        if(err)
            console.log(err);
        else
            console.log(newlyCreated);
            res.redirect("/sellerItems");
    });
});

//SHOW SPECIFIC USER ITEM
app.get("/sellerItems/:id", isLoggedIn, function(req, res){            //ID is created by mongo
    Item.findById(req.params.id, function(err, foundItem){
       if(err)
            console.log(err);
        else
            res.render("show", {item: foundItem});
    });
});
    
//EDIT ITEMS
app.get("/sellerItems/:id/edit", function(req, res){
                res.render("edit");

});
//UPDATE ITEMS
    
//AUTHENTICATION REGISTER NEW USERS
app.get("/signup", function(req, res){         //sign-up
    res.render("signup");
});

app.post("/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.redirect("/");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/sellerItems");
        });
    });
});

//AUTHENTICATION LOS IN USERS
app.get("/login", function(req, res){
    res.render("login");
});

//handling login logic to check for authentication
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/dashboard",
        failureRedirect: "/login"
    }), function(req, res){
});

//LOG OUT
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login");
});

//MIDDLEWARE to check autehtnication
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//CONTACT SELLER
app.get("/contactSellerForm", isLoggedIn, function(req, res){
    res.render("contactSellerForm");
});

//ACCOUNT MENU
app.get("/userDashboard", isLoggedIn, function(req, res){
    res.render("userDashboard");
});
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER HAS STARTED");
});

