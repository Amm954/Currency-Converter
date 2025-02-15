const apiKey = "your_api_key_here"; // Replace with a real API key

// Load available currencies
async function loadCurrencies() {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");

    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const data = await response.json();

    Object.keys(data.rates).forEach(currency => {
        fromCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
        toCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
    });

    fromCurrency.value = "INR";
    toCurrency.value = "USD";

    // Set initial flags
    updateFlag("INR", "fromFlag");
    updateFlag("USD", "toFlag");
}

// Function to update the flag based on currency selection
function updateFlag(currency, flagElementId) {
    const flagCode = currency.slice(0, 2).toLowerCase(); // Extract first 2 letters
    document.getElementById(flagElementId).src = `https://flagcdn.com/w40/${flagCode}.png`;
}

// Update flags when selecting currencies
document.getElementById("fromCurrency").addEventListener("change", function () {
    updateFlag(this.value, "fromFlag");
});

document.getElementById("toCurrency").addEventListener("change", function () {
    updateFlag(this.value, "toFlag");
});

// Swap currencies (now also swaps flags)
function swapCurrencies() {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const fromFlag = document.getElementById("fromFlag").src;
    const toFlag = document.getElementById("toFlag").src;

    [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
    [document.getElementById("fromFlag").src, document.getElementById("toFlag").src] = [toFlag, fromFlag];
}

// Convert currency
async function convertCurrency() {
    const amount = document.getElementById("amount").value;
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;
    const resultElement = document.getElementById("convertedAmount");
    const loader = document.getElementById("loader");

    if (amount === "" || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    loader.style.display = "block"; // Show loading spinner

    // Check if user is offline
    if (!navigator.onLine) {
        const cachedRates = localStorage.getItem('exchangeRates');
        if (cachedRates) {
            const parsedRates = JSON.parse(cachedRates);
            if (parsedRates.base === fromCurrency && parsedRates.rates[toCurrency]) {
                const rate = parsedRates.rates[toCurrency];
                const convertedAmount = (amount * rate).toFixed(2);
                loader.style.display = "none";
                resultElement.innerHTML = `Converted Amount: ${convertedAmount} ${toCurrency} (Offline Mode)`;
                return;
            }
        }
        alert("You are offline and no cached rates are available.");
        loader.style.display = "none";
        return;
    }

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();

        // Cache the latest exchange rates
        localStorage.setItem('exchangeRates', JSON.stringify(data));

        const rate = data.rates[toCurrency];
        const convertedAmount = (amount * rate).toFixed(2);

        loader.style.display = "none"; // Hide loading spinner
        resultElement.innerHTML = `Converted Amount: ${convertedAmount} ${toCurrency}`;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        alert("Failed to fetch exchange rates.");
        loader.style.display = "none";
    }
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}

// Apply Dark Mode on load
window.onload = function () {
    loadCurrencies();

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
};
