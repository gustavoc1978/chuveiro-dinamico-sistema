// script.js
document.addEventListener('DOMContentLoaded', () => {
    const flowRange = document.getElementById('flowRange');
    const flowValue = document.getElementById('flowValue');
    const tempRange = document.getElementById('tempRange');
    const tempValue = document.getElementById('tempValue');
    const water = document.getElementById('water');
    const temperatureIndicator = document.getElementById('temperatureIndicator');
    const temperatureTime = document.getElementById('temperatureTime');
    const saveConfigButton = document.getElementById('saveConfigButton');
    const childModeButton = document.getElementById('childModeButton');
    const turnOffButton = document.getElementById('turnOffButton');
    const historyDiv = document.getElementById('history');
    
    let temperatureTimeout;
    const initialTime = 20;
    let isChildMode = false;

    loadConfigurations();
    updateHistory();

    flowRange.addEventListener('input', updateFlow);
    tempRange.addEventListener('input', updateTemperature);
    saveConfigButton.addEventListener('click', saveConfiguration);
    childModeButton.addEventListener('click', toggleChildMode);
    turnOffButton.addEventListener('click', turnOffShower);

    function updateFlow() {
        const flowPercent = flowRange.value;
        flowValue.textContent = `${flowPercent}%`;
        water.style.height = `${flowPercent}%`;
    }

    function updateTemperature() {
        const tempValueCelsius = tempRange.value;
        tempValue.textContent = `${tempValueCelsius}°C`;

        const tempColor = calculateColor(tempValueCelsius);

        water.style.background = `linear-gradient(to bottom, ${tempColor}, ${tempColor})`;
        temperatureIndicator.style.backgroundColor = tempColor;

        clearTimeout(temperatureTimeout);
        let remainingTime = initialTime;
        temperatureTime.textContent = `Tempo para atingir a temperatura ideal: ${remainingTime}s`;

        temperatureTimeout = setInterval(() => {
            remainingTime--;
            temperatureTime.textContent = `Tempo para atingir a temperatura ideal: ${remainingTime}s`;
            if (remainingTime <= 0) {
                clearInterval(temperatureTimeout);
                temperatureTime.textContent = 'Temperatura ideal atingida';
            }
        }, 1000);
    }

    function calculateColor(tempValueCelsius) {
        const ratio = tempValueCelsius / 45;
        const r = Math.round(255 * ratio);
        const b = Math.round(255 * (1 - ratio));
        return `rgb(${r}, 0, ${b})`;
    }

    function saveConfiguration() {
        const flowPercent = flowRange.value;
        const tempValueCelsius = tempRange.value;
        const config = {
            flow: flowPercent,
            temperature: tempValueCelsius
        };
        
        let configurations = JSON.parse(localStorage.getItem('configurations')) || [];
        configurations.push(config);
        localStorage.setItem('configurations', JSON.stringify(configurations));
        
        updateHistory();
    }

    function updateHistory() {
        historyDiv.innerHTML = '';
        let configurations = JSON.parse(localStorage.getItem('configurations')) || [];
        
        configurations.forEach((config, index) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `Configuração ${index + 1}: ${config.flow}% de abertura, ${config.temperature}°C <button class="delete-button" data-index="${index}">Excluir</button>`;
            historyItem.setAttribute('data-index', index);
            historyDiv.appendChild(historyItem);

            historyItem.addEventListener('click', () => applyConfiguration(index));
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteConfiguration(event);
            });
        });
    }

    function deleteConfiguration(event) {
        const index = event.target.getAttribute('data-index');
        let configurations = JSON.parse(localStorage.getItem('configurations')) || [];
        configurations.splice(index, 1);
        localStorage.setItem('configurations', JSON.stringify(configurations));
        updateHistory();
    }

    function loadConfigurations() {
        let configurations = JSON.parse(localStorage.getItem('configurations')) || [];
        if (configurations.length > 0) {
            const lastConfig = configurations[configurations.length - 1];
            flowRange.value = lastConfig.flow;
            tempRange.value = lastConfig.temperature;
            updateFlow();
            updateTemperature();
        }
    }

    function toggleChildMode() {
        isChildMode = !isChildMode;
        if (isChildMode) {
            tempRange.max = 38;
            childModeButton.textContent = 'Modo Infantil Ativado';
        } else {
            tempRange.max = 45;
            childModeButton.textContent = 'Modo Infantil Desativado';
        }
    }

    function applyConfiguration(index) {
        let configurations = JSON.parse(localStorage.getItem('configurations')) || [];
        const config = configurations[index];
        flowRange.value = config.flow;
        tempRange.value = config.temperature;
        updateFlow();
        updateTemperature();
    }

    function turnOffShower() {
        flowRange.value = 0;
        tempRange.value = 0;
        updateFlow();
        updateTemperature();
        clearInterval(temperatureTimeout);
        temperatureTime.textContent = `Tempo para atingir a temperatura ideal: ${initialTime}s`;
    }

    updateFlow();
    updateTemperature();
});
