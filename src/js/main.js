import '../scss/main.scss';
import '../index.html';

const swiper = new Swiper('.swiper-container', {
  slidesPerView: 4,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true,
    dynamicMainBullets: 5,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    650: {
      slidesPerView: 1,
    },
    840: {
      slidesPerView: 2,
    },
    1070: {
      slidesPerView: 3,
    },
  },
});

let totalResults;
let page = 1;
let saveTextSearch;

function showHide() {
  document.querySelector('.error__container').classList.toggle('hide');
  document.querySelector('.search__loader').classList.toggle('hide');
}

function showSwiper() {
  document.querySelector('.swiper-container').classList.remove('hide');
  document.querySelector('.swiper-button-prev').classList.remove('hide');
  document.querySelector('.swiper-button-next').classList.remove('hide');
}

function addSlides(films) {
  document.querySelector('.search__loader').classList.add('hide');
  films.forEach((item) => {
    swiper.appendSlide(`<div class="swiper-slide"><div><p class="slide__text" ><a href="https://www.imdb.com/title/${item.imdbID}/videogallery/">${item.title}</a></p><img class="slide__image" alt="movie poster" src=${item.poster}
      ><p class="slide__text">${item.year}</p><p class="slide__text">${item.imdbRating}/10</p></div></div>`);
  });
}

async function createDataSlides(arrImdbID, numberPage) {
  const films = [];
  arrImdbID.forEach(async (ID, i) => {
    const response = await fetch(`https://www.omdbapi.com/?i=${ID}&apikey=5f3e76e3`);
    if (response.status >= 200 && response.status < 300) {
      const data = await response.json();
      films[i] = {
        title: data.Title,
        poster: data.Poster,
        year: data.Year,
        imdbID: data.imdbID,
        imdbRating: data.imdbRating,
      };
      if (i === arrImdbID.length - 1) {
        if (numberPage === 1) {
          swiper.removeAllSlides();
        }
        showSwiper();
        addSlides(films);
        films.length = 0;
      }
    } else {
      showHide();
      document.querySelector('.error').textContent = `Error ${response.status}`;
    }
  });
}

async function searchFilms(text, numberPage) {
  saveTextSearch = text;
  page = numberPage;
  document.querySelector('.error__container').classList.add('hide');
  document.querySelector('.search__loader').classList.remove('hide');

  const url = `https://www.omdbapi.com/?s=${saveTextSearch}&page=${page}&apikey=5f3e76e3`;
  const response = await fetch(url);
  if (response.status >= 200 && response.status < 300) {
    const data = await response.json();
    if (data.Response === 'True') {
      if (page === 1) {
        totalResults = data.totalResults;
      }
      const arrImdbID = data.Search.map((item) => item.imdbID);
      createDataSlides(arrImdbID, page);
    } else {
      showHide();
      document.querySelector('.error').textContent = `No result for ${text}`;
    }
  } else {
    showHide();
    document.querySelector('.error').textContent = `Error ${response.status}`;
  }
}

async function translate(text, numberPage) {
  const key = 'trnsl.1.1.20210913T165808Z.cf93702052ed2d16.992775df39270417f806c4d2c03085e9b3d86180';
  const response = await fetch(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${key}&text=${text}&lang=ru-en`);
  if (response.status >= 200 && response.status < 300) {
    const data = await response.json();
    document.querySelector('.message__container').classList.remove('hide');
    document.querySelector('.message').textContent = `Showing results for ${data.text[0]}`;
    searchFilms(data.text[0], numberPage);
  } else {
    document.querySelector('.error').textContent = `Error ${response.status}`;
  }
}

swiper.on('activeIndexChange', () => {
  const countSlides = document.querySelectorAll('.swiper-slide').length;
  if (swiper.activeIndex > countSlides - 6 && countSlides < totalResults) {
    page += 1;
    searchFilms(saveTextSearch, page);
  }
});

window.addEventListener('load', () => {
  searchFilms('dream', page);
});

function search() {
  document.querySelector('.message__container').classList.add('hide');

  const input = document.querySelector('.search__field').value;
  const isCyrillic = /[а-я]/i.test(input);
  page = 1;
  if (isCyrillic) {
    translate(input, page);
  } else {
    searchFilms(input, page);
  }
}

document.querySelector('.search__button').addEventListener('click', search);

document.querySelector('.search__container').addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    search();
  }
});
