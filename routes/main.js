const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = function(app, plannerData) {


    app.get('/api', function (req,res) {

        let sqlquery = "SELECT * FROM events"; 

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            res.json(result); 
        });
    });

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ){
            res.redirect('./login')
        } 
        else{ 
            next (); 
        }
    } 

    app.get('/', function (req, res) {
        const data = {
            ...plannerData,
            username: req.session.userId || null
        };
        res.render('index.ejs', data);
    });
    

    app.get('/about',function(req,res){
        res.render('about.ejs', plannerData);
    });

    app.get('/search',redirectLogin, function(req,res){
        res.render("search.ejs", plannerData);
    });

    app.get('/search-result', redirectLogin, function(req,res) {
        const keyword = req.query.keyword
        const query = ` SELECT *,
        DATE_FORMAT(Date, '%a %b %e %Y') AS formatted_date
        FROM events 
        WHERE Name LIKE ? OR Description LIKE ? OR Location LIKE ?
    `;

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
                    req.session.userId = user.user_id;
                    res.send('Login successful. Go back to <a href='+'./'+'>Home</a>')
                } else {
                    res.status(401).send("Invalid username or password.")
                }
            });
        });
    });

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./')
            }
        res.send('You are now logged out. Go back to <a href='+'./'+'>Home</a>');
        })
    })

    app.get('/register', function (req,res) {
        res.render('register.ejs', plannerData);                       
    });   

    app.post('/registered', function (req,res) {

        const { username, email } = req.body;

        if (!username || username.length < 3) {
            return res.status(400).send('Username must be at least 3 characters long.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            return res.status(400).send('Invalid email format.');
        }

         const plainPassword = req.body.password

         if (plainPassword.length < 8 || !/[!@#$%^&*]/.test(plainPassword)) {
            return res.status(400).send('Password must be at least 8 characters long and contain at least one special character (!@#$%^&*).');
        }

         bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword){

            if(err){
                console.log(err)
                return res.status(500).send('Error registering user.')
            }

            const sql = 'CALL AddUser(?, ?, ?)';
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

    app.get('/create-event', redirectLogin, function(req,res) {
        res.render('create-event.ejs', plannerData)
    })

    app.post('/create-event', redirectLogin, function(req,res) {
        const { eventName, eventDate, eventTime, eventLocation, eventDescription, organiserEmail}  = req.body
        const getOrganiserId = 'SELECT user_id FROM users WHERE email = ?'
        
        db.query(getOrganiserId, [organiserEmail], function(err, results){
            if(err){
                console.log(err)
                return res.status(500).send("Error creating the event.")
            }

            if(results.length === 0){
                return res.status(400).send('Organiser not found')
            }

            const organiserId = results[0].user_id
            const createEventQuery = 'INSERT INTO events (OrganiserID, Name, Date, Time, Location, Description) VALUES (?, ?, ?, ?, ?, ?)'

            db.query(createEventQuery, [organiserId, eventName, eventDate, eventTime, eventLocation, eventDescription], function(err, results){
                if(err){
                    console.log(err)
                    return res.status(500).send("Error creating the event")
                }

                return res.send('Event created successfully!')
            })
        })
    })

    app.get('/my-events', redirectLogin, function(req, res) {

        const userId = req.session.userId;

        const countQuery = `SELECT COUNT(*) AS eventCount FROM events WHERE OrganiserID = ?`;

        const eventQuery = ` SELECT *,
        DATE_FORMAT(Date, '%a %b %e %Y') AS formatted_date
        FROM events WHERE OrganiserID = ?
        ORDER BY Date`;
    
        db.query(countQuery, [userId], (err, countResult) => {
            if (err) {
                console.error("Database query error:", err);
                res.status(500).send("Internal Server Error");
                return;
            }
    
            const eventCount = countResult[0].eventCount;

        db.query(eventQuery, [userId], (err, events) => {
            if (err) {
                console.error("Database query error:", err);
                res.status(500).send("Internal Server Error");
            } else {
                res.render("my-events.ejs", { plannerName: plannerData.plannerName, events, eventCount });
            }
        });
    });

});

    app.post('/delete-event', redirectLogin, function(req, res) {

        const eventId = req.body.eventId;
        const userId = req.session.userId;
    
        const deleteQuery = `DELETE FROM events WHERE EventID = ? AND OrganiserID = ?`;
    
        db.query(deleteQuery, [eventId, userId], (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                res.status(500).send("Internal Server Error: " + err.message);
            } else {
                res.redirect('/my-events');
            }
        });
    });

    app.get('/weather',function(req,res){
        const request = require('request');
          
        let apiKey = 'faf1b9ae7f8c25b81900ed60258ffde6';
        let city = req.query.city || 'london';
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                     
        request(url, function (err, response, body) {
          if(err){
            console.log('error:', error);
          } else {
            var weather = JSON.parse(body)
            var wmsg = 'It is '+ weather.main.temp + ' degrees in '+ weather.name + '! <br> The humidity now is: ' + weather.main.humidity;
            res.send (wmsg);
          } 

        });
    });
    
}