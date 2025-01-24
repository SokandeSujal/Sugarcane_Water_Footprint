class WaterFootprintCalculator {
    calculateWaterComponents(params) {
        const { landArea, precipitation, runoff, irrigation, fertilizer } = params;

        // Enhanced water component calculations
        const greenWater = Math.max(0, precipitation - runoff);
        const blueWater = irrigation;
        const greyWater = fertilizer * 0.65;
        const totalWaterFootprint = (greenWater + blueWater + greyWater) * landArea;

        return {
            greenWater,
            blueWater,
            greyWater,
            totalWaterFootprint,
            landArea
        };
    }

    calculateWaterEfficiencyScore(totalWaterFootprint, landArea) {
        const waterIntensity = totalWaterFootprint / landArea;
        const efficiencyLevels = [
            { max: 500, rating: 'Exceptional', color: '#2ecc71', recommendation: 'Outstanding water management practices' },
            { max: 1000, rating: 'Excellent', color: '#27ae60', recommendation: 'Highly efficient water usage' },
            { max: 1500, rating: 'Good', color: '#3498db', recommendation: 'Moderate water efficiency, room for improvement' },
            { max: 2000, rating: 'Average', color: '#f39c12', recommendation: 'Consider water conservation strategies' },
            { max: 2500, rating: 'Poor', color: '#e74c3c', recommendation: 'Urgent need for water management improvements' },
            { rating: 'Critical', color: '#c0392b', recommendation: 'Immediate water efficiency interventions required' }
        ];

        return efficiencyLevels.find(level =>
            level.max ? waterIntensity <= level.max : true
        );
    }

    generateInsights(waterData) {
        return {
            greenWater: {
                title: 'Green Water Efficiency',
                value: waterData.greenWater.toFixed(2),
                description: waterData.greenWater > 300
                    ? 'Excellent rainwater utilization. Natural water capture is optimized.'
                    : 'Consider improving rainwater capture and retention techniques.'
            },
            blueWater: {
                title: 'Irrigation Management',
                value: waterData.blueWater.toFixed(2),
                description: waterData.blueWater < 500
                    ? 'Efficient irrigation practices. Minimal external water usage.'
                    : 'High irrigation needs. Explore water-saving irrigation methods.'
            },
            greyWater: {
                title: 'Environmental Neutralization',
                value: waterData.greyWater.toFixed(2),
                description: waterData.greyWater < 100
                    ? 'Minimal pollution water requirement. Low environmental impact.'
                    : 'High pollution dilution water. Reduce fertilizer and chemical usage.'
            }
        };
    }
}

class WaterFootprintUI {
    constructor() {
        this.calculator = new WaterFootprintCalculator();
        this.chart = null; // Store chart instance
        this.lineChart = null; // Store line chart instance
        this.barChart = null; // Store bar chart instance
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('waterFootprintForm');
        const calculateButton = document.getElementById('calculateBtn');
        
        if (form) {
            // Prevent form submission
            form.addEventListener('submit', (e) => e.preventDefault());
        }

        if (calculateButton) {
            calculateButton.addEventListener('click', this.handleCalculation.bind(this));
        } else {
            console.error('Calculate button not found');
        }

        // Add input validation and real-time feedback
        this.addInputValidation();
    }

    addInputValidation() {
        const inputs = document.querySelectorAll('#waterFootprintForm input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Basic validation
                if (input.value < 0) {
                    input.value = 0;
                }
                // Optional: Add more sophisticated validation
            });

            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                input.classList.add('invalid');
                this.showErrorMessage('Please fill in all fields with valid numbers.');
            });
        });
    }

    handleCalculation() {
        try {
            // Clear previous error states
            document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

            const inputs = this.collectInputData();
            const waterData = this.calculator.calculateWaterComponents(inputs);
            const efficiencyScore = this.calculator.calculateWaterEfficiencyScore(
                waterData.totalWaterFootprint,
                waterData.landArea
            );
            const insights = this.calculator.generateInsights(waterData);

            this.displayResults(waterData, efficiencyScore, insights);
        } catch (error) {
            console.error('Calculation error:', error);
            this.showErrorMessage('Unable to calculate water footprint. Please check your inputs.');
        }
    }

    collectInputData() {
        const requiredFields = ['landArea', 'precipitation', 'irrigation', 'runoff', 'fertilizer'];
        const inputs = {};

        for (let field of requiredFields) {
            const inputElement = document.getElementById(field);
            const value = parseFloat(inputElement.value);
            
            if (!inputElement || isNaN(value) || value < 0) {
                inputElement.classList.add('invalid');
                throw new Error(`Invalid input for ${field}`);
            }
            inputs[field] = value;
        }

        return inputs;
    }

    showErrorMessage(message) {
        const resultContainer = document.getElementById('waterFootprintResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="error-message">
                    <i class="ri-error-warning-line"></i>
                    <p>${message}</p>
                </div>
            `;
        } else {
            console.error('Result container not found');
        }
    }

    displayResults(waterData, efficiencyScore, insights) {
        const resultContainer = document.getElementById('waterFootprintResult');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="result-grid">
                    <div class="result-card green-card">
                        <h3>${insights.greenWater.title}</h3>
                        <p>${insights.greenWater.value} mm</p>
                        <small>${insights.greenWater.description}</small>
                    </div>
                    <div class="result-card blue-card">
                        <h3>${insights.blueWater.title}</h3>
                        <p>${insights.blueWater.value} mm</p>
                        <small>${insights.blueWater.description}</small>
                    </div>
                    <div class="result-card grey-card">
                        <h3>${insights.greyWater.title}</h3>
                        <p>${insights.greyWater.value} mm</p>
                        <small>${insights.greyWater.description}</small>
                    </div>
                    <div class="result-card total-card" style="background-color: ${efficiencyScore.color}">
                        <h3>Water Efficiency</h3>
                        <p>${waterData.totalWaterFootprint.toFixed(2)} mm</p>
                        <small>${efficiencyScore.rating} - ${efficiencyScore.recommendation}</small>
                    </div>
                </div>
            `;
            
            // Destroy previous charts if they exist
            this.destroyCharts();
            
            // Render multiple chart types
            this.renderWaterFootprintPieChart(waterData);
            this.renderWaterFootprintLineChart(waterData);
            this.renderWaterEfficiencyBarChart(waterData);
        } else {
            console.error('Result container not found');
        }
    }

    destroyCharts() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        if (this.lineChart) {
            this.lineChart.destroy();
            this.lineChart = null;
        }
        if (this.barChart) {
            this.barChart.destroy();
            this.barChart = null;
        }
    }

    renderWaterFootprintPieChart(waterData) {
        const ctx = document.getElementById('waterFootprintGraph');
        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Green Water', 'Blue Water', 'Grey Water'],
                    datasets: [{
                        data: [
                            waterData.greenWater,
                            waterData.blueWater,
                            waterData.greyWater
                        ],
                        backgroundColor: ['#2ecc71', '#3498db', '#f39c12']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: 20
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Water Footprint Composition'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } else {
            console.error('Canvas element not found for the pie chart');
        }
    }

    renderWaterFootprintLineChart(waterData) {
        const ctx = document.getElementById('waterLineGraph');
        if (ctx) {
            this.lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Green Water', 'Blue Water', 'Grey Water'],
                    datasets: [{
                        label: 'Water Components',
                        data: [
                            waterData.greenWater,
                            waterData.blueWater,
                            waterData.greyWater
                        ],
                        borderColor: ['#2ecc71', '#3498db', '#f39c12'],
                        backgroundColor: ['rgba(46, 204, 113, 0.2)', 'rgba(52, 152, 219, 0.2)', 'rgba(243, 156, 18, 0.2)'],
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Water Component Trend'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    renderWaterEfficiencyBarChart(waterData) {
        const ctx = document.getElementById('waterBarGraph');
        if (ctx) {
            this.barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Green Water', 'Blue Water', 'Grey Water'],
                    datasets: [{
                        label: 'Water Components',
                        data: [
                            waterData.greenWater,
                            waterData.blueWater,
                            waterData.greyWater
                        ],
                        backgroundColor: ['#2ecc71', '#3498db', '#f39c12']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Water Component Comparison'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}

// Initialize UI on page load
window.onload = () => {
    new WaterFootprintUI();
};