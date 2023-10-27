const bcrypt = require('bcrypt')
const saltRounds = 10

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

    app.get('/search-result', function(req,res) {
        const keyword = req.query.keyword
        const query = 'SELECT * FROM events WHERE Name LIKE ? OR Description LIKE ? OR Location LIKE ?'

        db.query(query, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`], (err, results) => {
            if (err) {
              console.error("Database query error:", err);
              res.status(500).send("Internal Server Error");
            } else {
              res.render("search-result.ejs", { plannerName: plannerData.plannerName, keyword, results });
            }
          });
        });

    app.get('/login',function(req,res){
        res.render("login.ejs", plannerData);
    });

    app.post('/loggedin', function (req, res) {
        const { username, password } = req.body
        const sql = 'SELECT * FROM users WHERE username = ?'

        db.query(sql, [username], function (error, results) {
            if (error) {
                console.error(error);
                return res.status(500).send("Error during login.")
            }

            if (results.length === 0) {
                return res.status(401).send("Invalid username or password.")
            }

            const user = results[0];

            bcrypt.compare(password, user.hashedPassword, function(err, isPasswordValid) {

                if (err) {
                    console.error(err);
                    return res.status(500).send("Error during login.");
                } else if (isPasswordValid) {
                    res.send('Login successful')
                } else {
                    res.status(401).send("Invalid username or password.")
                }
            });
        });
    });

    app.get('/register', function (req,res) {
        res.render('register.ejs', plannerData);                       
    });   

    app.post('/registered', function (req,res) {

         const plainPassword = req.body.password

         bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword){

            if(err){
                console.log(err)
                return res.status(500).send('Error registering user.')
            }

            const sql = 'INSERT INTO users (username, email, hashedPassword) VALUES (?, ?, ?)'
            const values = [req.body.username, req.body.email, hashedPassword]

            db.query(sql, values, function (err, results, fields) {

                if(err) {
                    console.log(err)
                    return res.status(500).send('Error registering user.')
                }

                const result = 'Hello ' + req.body.username + ' you are now registered! Your password is ' + req.body.password + " and your hashed password is " + hashedPassword
                
                res.send(result)
            })
         })           
    })

    app.get('/create-event', function(req,res) {
        res.render('create-event.ejs', plannerData)
    })

    app.post('/create-event', function(req,res) {
        const { eventName, eventDate, eventTime, eventLocation, eventDescription, organiserEmail}  = req.body
        const getOrganiserId = 'SELECT user_id FROM Users WHERE email = ?'
        
        db.query(getOrganiserId, [organiserEmail], function(err, results){
            if(err){
                console.log(err)
                return res.status(500).send("Error creating the event.")
            }

            if(results.length === 0){
                return res.status(400).send('Organiser not found')
            }

            const organiserId = results[0].user_id
            const createEventQuery = 'INSERT INTO Events (OrganiserID, Name, Date, Time, Location, Description) VALUES (?, ?, ?, ?, ?, ?)'

            db.query(createEventQuery, [organiserId, eventName, eventDate, eventTime, eventLocation, eventDescription], function(err, results){
                if(err){
                    console.log(err)
                    return res.status(500).send("Error creating the event")
                }

                return res.send('Event created successfully!')
            })
        })
    })
}