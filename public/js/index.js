async function searchMovie() {
    const movieInput = document.getElementById('search').value;

    if (movieInput.trim() === '') {
        // If the input is empty, clear the movie details
        document.getElementById('searchedMovie').innerHTML = '';
        return;
    }

    try {
        console.log(movieInput)
        const apiKey = 'bba4fededdbeac099653cc18b878503d';
        const params = new URLSearchParams({
            query: movieInput,
            api_key: apiKey
        });

        const response = await fetch(`http://api.themoviedb.org/3/search/movie?${params}`);
        const data = await response.json();

        movieDetails = data.results; // Assuming you want details of the first result
        console.log(movieDetails)
        // Update the movie details on the webpage
        let movieHTML = '<ul id="moviebox">';
for (let i = 0; i < 5; i++) {
const movie = movieDetails[i];
movieHTML += `
<li>
<a href="/movie/${movie.id}" class="plane">
<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
<h2>${movie.title}</h2>
</a>
</li>
<hr>
`;
}
movieHTML += '</ul>';
document.getElementById('searchedMovie').innerHTML = movieHTML;
    } catch (error) {
        console.error('Error:', error);
    }
}

//genres