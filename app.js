const randomBtn = document.getElementById('random'),
      mealsContainer = document.getElementById('meals'),
      favMeals = document.getElementById('favorites'),
      fav_container = document.getElementById('favorites-container'),
      searchInput = document.getElementById('search_text'),
      searchBtn = document.getElementById('search_btn'),
      mealPopup = document.getElementById('meal-popup');


getRandomMeal();
fetchFavMeals();

randomBtn.addEventListener('click', getRandomMeal);

/**
 * Get the random meal from API
 * @return the meal item from the API
 * */
async function getRandomMeal() {
   const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php'),
         respData = await resp.json(),
         randomMeal = respData.meals[0];
   addMeal(randomMeal, true);
}

/**
 * Get the meal by ID from the API
 * @param id the id of the meal
 * @return the meal item from the API
 * */
async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id),
          respData = await resp.json(),
          meal = respData.meals[0];
    return meal;
}

/**
 * Get the meal by NAME from the API
 * @param term the search data
 * @return the meal item from the API
 * */
async function getMealBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term),
          respData = await resp.json(),
          meal = respData.meals;
    return meal;
}

/**
 * Render new meal item
 * @param mealData the meal data from the API
 * @param random the flag to render the badge or not (false by default)
 * */
addMeal = (mealData, random = false) => {
    const meal = document.createElement('div'),
          mealIds = getMealsFromLocalStorage();


    meal.classList.add('meal');
    meal.innerHTML = `
        <div class="meal__header">
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" id="meal_img">
            ${random ? '<div class="meal__badge">Random Recipe</div>' : ''}
        </div>
        <div class="meal__content">
            <div class="meal__name" id="meal_name">${mealData.strMeal}</div>
            <div class="meal__icons">
                <i class="fas fa-heart ${mealIds.includes(mealData.idMeal) ? 'active' : ''}"></i>
                <i class="fa-solid fa-trash"></i>
            </div>
        </div>
    `;

    meal.querySelector('img').onclick = () => {
        showMealInfo(mealData);
    }

    meal.querySelector('.meal__name').onclick = () => {
        showMealInfo(mealData);
    }


    const like =  meal.querySelector('.fa-heart'),
          trash = meal.querySelector('.fa-trash');

       like.onclick = () => {
           if (like.classList.contains('active')) {
               removeFromLocalStorage(mealData.idMeal);
               like.classList.remove('active');
           } else {
               addToLocalStorage(mealData.idMeal);
               like.classList.add('active');
           }

           fetchFavMeals();
       }

       trash.onclick = () => {
           meals.removeChild(meal);
       }

    mealsContainer.appendChild(meal);
}

/**
 * Show the popup with the recipe and info
 * @param mealData the meal data from the API
 * */
showMealInfo = (mealData) => {
    document.querySelector('.popup').innerHTML = '<button><i class="fa-solid fa-xmark" id="info-close"></i></button>';
    const mealInfoEl = document.createElement('div');
    mealInfoEl.classList.add('meal__info');
    mealInfoEl.id = 'meal-info';
    mealPopup.classList.add('active');
    document.body.classList.add('no-scroll');
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} <span>${mealData['strMeasure'+i]}</span>`)
        } else {
            break;
        }
    }
    mealInfoEl.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <h1>${mealData.strMeal}</h1>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => 
                `<li>${ing}</li>`
                    ).join("")}
        </ul>
        <p>
        ${mealData.strInstructions}
        </p>
    `;
    document.querySelector('.popup').appendChild(mealInfoEl);

    mealPopup.querySelector('#info-close').onclick = () => {
        mealPopup.classList.remove('active');
        document.body.classList.remove('no-scroll');

    }
}

/**
 * Get all meal objects from the local storage
 * @returns an array of meal objects
 * */
function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

/**
 * Adds id of the meal to the local storage
 * @param mealId id of the meal to add
 * */
addToLocalStorage = (mealId) => {
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify(([...mealIds, mealId])));
}

/**
 * Removes id of the meal from the local storage
 * @param mealId id of the meal to delete
 * */
removeFromLocalStorage = (mealId) => {
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

/**
 * Render the new favorite meal item
 * @param mealData the meal data from the API
 * */
addMealToFav = (mealData) => {
    const favMeal = document.createElement('li');
    favMeal.classList.add('fav__item');
    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>${mealData.strMeal}</p>
        <button class="clear-btn"><i class="fa-solid fa-trash"></i></button>
    `;

    const btn = favMeal.querySelector('.clear-btn');
    btn.onclick = () => {
        removeFromLocalStorage(mealData.idMeal);
        fetchFavMeals();
    }

    favMeal.querySelector('img').onclick = () => {
        showMealInfo(mealData);
    }

    favMeal.querySelector('p').onclick = () => {
        showMealInfo(mealData);
    }

    favMeals.appendChild(favMeal);
}

/**
 * Update the favorites section depending on the local storage data
 * */
async function fetchFavMeals(){
    favMeals.innerHTML = '';
    const mealIds = getMealsFromLocalStorage();
    if (mealIds.length > 0) {
        fav_container.style.display = 'flex';
        for (let i = 0; i < mealIds.length; i++) {
            const mealId = mealIds[i],
                meal = await getMealById(mealId);
            addMealToFav(meal);
        }
    } else {
        fav_container.style.display = 'none';
    }
}

/**
 * Search button click event
 * */
searchBtn.addEventListener('click', async () => {
    mealsContainer.innerHTML = '';
    const searchValue = searchInput.value;

    const meals = await getMealBySearch(searchValue);

    if(meals){
        Array.from(meals).forEach(meal => addMeal(meal));
    }
});
