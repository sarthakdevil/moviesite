const express = require('express');
const http = require('http');
const querystring = require('querystring');
const  {User,passport} = require('./database/user.js')
const session = require('express-session');
const env = require("dotenv").config();
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const port = 8009;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false } // Set to false for development with HTTP
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },User.authenticate()
    ))

app.get('/register',(req,res)=>{
    res.render('register')
})
app.post('/register', (req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password

    if (!email || !password || !username) {
        return res.status(400).send("Please fill out all fields");
    }

    const newUser = new User({ email, username });

    User.register(newUser, password, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error registering user');
            // Alternatively, you can render an error page or return a JSON response.
        }

        passport.authenticate('local')(req, res, () => {
            res.redirect('/');
        });
    });
});

app.get('/login',(req,res)=>{
    res.render('login',{message:''})
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

const movieGenres = {
    Action: 28,
    Adventure: 12,
    Animation: 16,
    Comedy: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    History: 36,
    Horror: 27,
    Music: 10402,
    Mystery: 9648,
    Romance: 10749,
    'Science Fiction': 878,
    'TV Movie': 10770,
    Thriller: 53,
    War: 10752,
    Western: 37
  };

app.get('/',async (req, res) => {
    // Pass movieDetails to the view
    if(req.isAuthenticated()){
    res.render('index', {
        page,
        pageSize,
        movie
    });
}else{
    res.redirect("/login")
}
})
// Updated Express.js 
var movie;

// Assume movies array is globally defined
let movies = [];
let pageSize = 20; // Set the default page size
let page = 1; // Set the default page number
var totalPages;
var moviesearched;
var genre;
var paginatedMovies;
  
app.post('/movies',async (req,res)=>{
    try {
        const movie = req.body.movie || req.params.movie;
       moviesearched= movie;
       genre=req.body.genre
       console.log(movie);
       const apiKey = "bba4fededdbeac099653cc18b878503d";
       // Set the pageSize and page based on user input
       const pageSize = parseInt(req.params.pageSize) || 20;
       let page = parseInt(req.params.page) || 1;

       const params = querystring.stringify({
           query: movie,
           api_key: apiKey,
           page: page
       });

       const options = {
           hostname: 'api.themoviedb.org',
           path: `/3/search/movie?${params}`,
           method: 'GET',
           headers: {
               'Content-Type': 'application/json'
           }
       };

       const responseData = await makeHttpRequest(options);
       const moviedata = JSON.parse(responseData);

       // Update the globally defined movies array
       movies = moviedata.results;
       console.log(movies);

       // Calculate the total number of pages after receiving data from the API
       totalPages = Math.ceil(moviedata.total_results / pageSize);
       console.log(totalPages);

       // Calculate the starting index for the current page
       const startIndex = (page - 1) * pageSize;

       // Extract a slice of movies based on the calculated index and page size
        paginatedMovies = movies.slice(startIndex, startIndex + pageSize);

       // Determine URLs for previous and next pages
       const prevPage = page > 2 ? `/movies/${page - 1}/${pageSize}` : '/movies';
       if (prevPage >1) {
           prevPage = null;
       }
       
       const nextPage = page < totalPages ? `/movies/${page + 1}/${pageSize}` : null;
       res.render('movies', {
        page,
        pageSize,
        totalMovies: moviedata.total_results,
        totalPages,
        movies: paginatedMovies,
        prevPage,
        nextPage,
        
    });
    } catch (err) {
        return res.status(500).send(err);
    }

})
app.get("/movies/:page?/:pageSize?", async function (req, res) {
    try {
        movies=[]
        console.log(movie);
        const apiKey = "bba4fededdbeac099653cc18b878503d";
        // Set the pageSize and page based on user input

        const pageSize = parseInt(req.params.pageSize) || 20;
        let page = parseInt(req.params.page);

        const params = querystring.stringify({
            query: moviesearched,
            api_key: apiKey,
            page: page
        });

        const options = {
            hostname: 'api.themoviedb.org',
            path: `/3/search/movie?${params}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const responseData = await makeHttpRequest(options);
        const moviedata = JSON.parse(responseData);
        movies = moviedata.results;
        console.log(movies);
        // Update the globally defined movies array
        const prevPage = page > 2 ? `/movies/${page - 1}/${pageSize}` : '/movies';
        
        const nextPage = page < totalPages ? `/movies/${page + 1}/${pageSize}` : null;
        
        // Send the paginated data and pagination links as the response
        res.render('movies', {
            page,
            pageSize,
            totalMovies: moviedata.total_results,
            totalPages,
            movies: movies,
            prevPage,
            nextPage,
        });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Error Object:', error);
        console.error('API Response:', error.response ? error.response.data : 'N/A');
        res.status(500).send('Internal Server Error');
    }
});

// Add a new route for displaying movie details
app.get('/movie/:movieId', async (req, res) => {
    try {
        
        const movieId = req.params.movieId;
        const apiKey = "bba4fededdbeac099653cc18b878503d";

        const options = {
            hostname: 'api.themoviedb.org',
            path: `/3/movie/${movieId}?api_key=${apiKey}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const responseData = await makeHttpRequest(options);
        const movieDetails = JSON.parse(responseData);
        console.log(movieDetails)
        res.render('movieid', { movieDetails });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Error Object:', error);
        console.error('API Response:', error.response ? error.response.data : 'N/A');
        res.status(500).send('Internal Server Error');
    }
});

app.get('/top/:pageno', async (req, res) => {
    // get the data from API and send it to ejs file
    // https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1
    const apiKey = encodeURIComponent("bba4fededdbeac099653cc18b878503d");;
    const page = encodeURIComponent(req.params.pageno || 1);

    const options = {
        hostname: 'api.themoviedb.org',
        path: `/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${page}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const responseData = await makeHttpRequest(options);
        const moviedata = JSON.parse(responseData);
        console.log(moviedata)
        const prevPage = page > 1 ? `/top/${ Number(page) - 1}` : null;
        const nextPage = page < moviedata.total_pages ? `/top/${ Number(page) + 1}` : null;
        res.render('top', {
            page: moviedata.page,
            totalMovies: moviedata.total_results,
            totalPages: moviedata.total_pages,
            movies: moviedata.results || [],
            prevPage: prevPage,
            nextPage: nextPage
        });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Error Object:', error);
        console.error('API Response:', error.response ? error.response.data : 'N/A');
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function makeHttpRequest(options) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}
module.exports = app;