module.exports = function(app, plannerData) {
    
    app.get('/',function(req,res){
        res.render('index.ejs', plannerData)
    });

    app.get('/about',function(req,res){
        res.render('about.ejs', plannerData);
    });

    app.get('/search',function(req,res){
        res.render("search.ejs", plannerData);
    });

    app.get('/login',function(req,res){
        res.render("login.ejs", plannerData);
    });

    app.get('/register', function (req,res) {
        res.render('register.ejs', plannerData);                       
    });   

    app.post('/registered', function (req,res) {
        res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email);                          
    }); 
}