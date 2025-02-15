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
    updateFlag(fromCurrency.value, "fromFlag");
    updateFlag(toCurrency.value, "toFlag");

    setDefaultCurrencyByLocation(); // Auto-detect default currency
}

// Function to update the flag based on currency selection
function updateFlag(currency, flagElementId) {
    const flagCode = currency.slice(0, 2).toLowerCase(); // Extract first 2 letters
    const flagElement = document.getElementById(flagElementId);

    // Force image reload for mobile browsers
    flagElement.src = "";
    flagElement.src = `https://flagcdn.com/w40/${flagCode}.png?cacheBust=${new Date().getTime()}`;
}

// Auto-detect user's default currency by location
async function setDefaultCurrencyByLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const userCountryCurrency = getCurrencyByCountry(data.country_code);
        document.getElementById("fromCurrency").value = userCountryCurrency || "USD";
        updateFlag(userCountryCurrency, "fromFlag");
    } catch (error) {
        console.error("Failed to detect currency by location", error);
    }
}

// Map country code to currency
function getCurrencyByCountry(countryCode) {
    const countryCurrencyMap = {
        IN: "INR",
        US: "USD",
        GB: "GBP",
        AU: "AUD",
        CA: "CAD",
        EU: "EUR"
        // Add more country codes and their currencies as needed
    };
    return countryCurrencyMap[countryCode] || "USD";
}

// Update flag when currency selection changes
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

// Calculate conversion rate dynamically
function calculateRate(fromCurrency, toCurrency, cachedRates) {
    const baseCurrency = cachedRates.base;
    const rates = cachedRates.rates;

    if (!rates[fromCurrency] || !rates[toCurrency]) {
        return null;
    }

    if (fromCurrency === baseCurrency) {
        return rates[toCurrency];
    } else if (toCurrency === baseCurrency) {
        return 1 / rates[fromCurrency];
    } else {
        return rates[toCurrency] / rates[fromCurrency];
    }
}

// Convert currency with dynamic rate adjustment
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

            if (parsedRates.base !== fromCurrency) {
                alert(`Offline mode: Rates are based on the last fetched ${parsedRates.base} rates.`);
            }

            const rate = calculateRate(fromCurrency, toCurrency, parsedRates);

            if (rate === null) {
                loader.style.display = "none";
                resultElement.innerHTML = "No rate available for the selected currency pair.";
                return;
            }

            const convertedAmount = (amount * rate).toFixed(2);
            loader.style.display = "none";
            resultElement.innerHTML = `Converted Amount: ${convertedAmount} ${toCurrency} (Offline Mode)`;
            return;
        }
        alert("You are offline and no cached rates are available.");
        loader.style.display = "none";
        return;
    }

    // Online conversion
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
