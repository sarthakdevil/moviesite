const express = require('express');
const http = require('http');
const querystring = require('querystring');
const app = express();
const port = 8009;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
var movie;

// Assume movies array is globally defined
let movies = [];
let pageSize = 15; // Set the default page size
let page = 1; // Set the default page number

app.get('/', async (req, res) => {
        // Pass movieDetails to the view
        res.render('index', {
            page,
            pageSize
        });
    })
// Updated Express.js 
app.all("/movies/:page?/:pageSize?", async function (req, res) {
    try {
         movie = req.body.movie;
        moviesearched= movie;
        console.log(movie);
        const apiKey = 'bba4fededdbeac099653cc18b878503d';

        // Set the pageSize and page based on user input
        const pageSize = parseInt(req.params.pageSize) || 15;
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
        const totalPages = Math.ceil(moviedata.total_results / pageSize);
        console.log(totalPages);

        // Calculate the starting index for the current page
        const startIndex = (page - 1) * pageSize;

        // Extract a slice of movies based on the calculated index and page size
        const paginatedMovies = movies.slice(startIndex, startIndex + pageSize);

        // Determine URLs for previous and next pages
        const prevPage = page > 1 ? `/movies/${page - 1}/${pageSize}` : null;
        const nextPage = page < totalPages ? `/movies/${page + 1}/${pageSize}` : null;

        // Send the paginated data and pagination links as the response
        res.render('movies', {
            page,
            pageSize,
            totalMovies: moviedata.total_results,
            totalPages,
            movies: paginatedMovies,
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
        const apiKey = 'bba4fededdbeac099653cc18b878503d';

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
