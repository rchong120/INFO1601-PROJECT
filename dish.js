document.addEventListener('DOMContentLoaded', () => {
    const dishDetailsContainer = document.getElementById('dish-details-container');
    const urlParams = new URLSearchParams(window.location.search);
    const dishId = urlParams.get('id');

    async function getDishDetails() {
        if (!dishId) {
            dishDetailsContainer.innerHTML = '<p>Dish not found.</p>';
            return;
        }

        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${dishId}`);
            const data = await response.json();
            const dish = data.meals[0];

            if (dish) {
                renderDishDetails(dish);
            } else {
                dishDetailsContainer.innerHTML = '<p>Dish details not found.</p>';
            }
        } catch (error) {
            console.error('Failed to fetch dish details:', error);
            dishDetailsContainer.innerHTML = '<p>Could not load dish details.</p>';
        }
    }

    function renderDishDetails(dish) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (dish[`strIngredient${i}`]) {
                ingredients.push(`${dish[`strIngredient${i}`]} - ${dish[`strMeasure${i}`]}`);
            } else {
                break;
            }
        }

        dishDetailsContainer.innerHTML = `
            <style>
                #dish-details-container {
                    padding: 2rem;
                    max-width: 800px;
                    margin: auto;
                    background: white;
                    border-radius: 10px;
                    margin-top: 2rem;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                #dish-details-container img {
                    width: 100%;
                    max-width: 400px;
                    border-radius: 10px;
                    float: left;
                    margin-right: 2rem;
                    margin-bottom: 1rem;
                }
                #dish-details-container h1 {
                    font-size: 2.5rem;
                }
                 #dish-details-container h2 {
                    border-bottom: 2px solid #eee;
                    padding-bottom: 0.5rem;
                    margin-top: 2rem;
                    clear: both;
                }
                #dish-details-container ul {
                    list-style-type: none;
                    padding: 0;
                }
                 #dish-details-container li {
                    background: #f9f9f9;
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                    border-radius: 5px;
                }
                #dish-details-container p {
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

            </style>
            <h1>${dish.strMeal}</h1>
            <img src="${dish.strMealThumb}" alt="${dish.strMeal}">
            <h2>Category: ${dish.strCategory} | Area: ${dish.strArea}</h2>
            
            <h2>Ingredients</h2>
            <ul>
                ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
            </ul>

            <h2>Instructions</h2>
            <p>${dish.strInstructions}</p>
        `;
    }

    getDishDetails();
});
