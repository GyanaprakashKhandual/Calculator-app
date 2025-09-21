class AdvancedCalculator {
    constructor() {
        this.currentExpression = '';
        this.result = '0';
        this.history = [];
        this.currentTheme = 'dark';
        this.justCalculated = false;

        this.initializeThemes();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeThemes() {
        const themeButton = document.getElementById('themeButton');
        const themeDropdown = document.getElementById('themeDropdown');

        themeButton.addEventListener('click', () => {
            themeDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!themeButton.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.remove('show');
            }
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setTheme(theme);
                themeDropdown.classList.remove('show');
            });
        });
    }

    setTheme(theme) {
        document.body.className = theme === 'dark' ? '' : `theme-${theme}`;
        this.currentTheme = theme;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(e) {
        e.preventDefault();

        if (e.key >= '0' && e.key <= '9') {
            this.insertNumber(e.key);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
            this.insertOperator(e.key === '*' ? '*' : e.key);
        } else if (e.key === '.') {
            this.insertOperator('.');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clearAll();
        } else if (e.key === 'Backspace') {
            this.backspace();
        } else if (e.key === '(') {
            this.insertOperator('(');
        } else if (e.key === ')') {
            this.insertOperator(')');
        }
    }

    insertNumber(num) {
        if (this.justCalculated) {
            this.currentExpression = '';
            this.justCalculated = false;
        }
        this.currentExpression += num;
        this.updateDisplay();
    }

    insertOperator(op) {
        if (this.justCalculated && ['+', '-', '*', '/', '^', 'mod'].includes(op)) {
            this.currentExpression = this.result + op;
            this.justCalculated = false;
        } else {
            if (this.justCalculated) {
                this.currentExpression = '';
                this.justCalculated = false;
            }
            this.currentExpression += op;
        }
        this.updateDisplay();
    }

    insertFunction(func) {
        if (this.justCalculated) {
            this.currentExpression = '';
            this.justCalculated = false;
        }
        this.currentExpression += func;
        this.updateDisplay();
    }

    insertConstant(constant) {
        if (this.justCalculated) {
            this.currentExpression = '';
            this.justCalculated = false;
        }
        const value = constant === 'π' ? Math.PI.toString() : Math.E.toString();
        this.currentExpression += value;
        this.updateDisplay();
    }

    clearAll() {
        this.currentExpression = '';
        this.result = '0';
        this.justCalculated = false;
        this.updateDisplay();
    }

    clearEntry() {
        this.result = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentExpression.length > 0) {
            this.currentExpression = this.currentExpression.slice(0, -1);
            this.updateDisplay();
        }
    }

    toggleSign() {
        if (this.currentExpression) {
            if (this.currentExpression.startsWith('-')) {
                this.currentExpression = this.currentExpression.slice(1);
            } else {
                this.currentExpression = '-' + this.currentExpression;
            }
            this.updateDisplay();
        }
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    evaluateExpression(expr) {
        try {
            // Replace mathematical functions and constants
            expr = expr
                .replace(/\^/g, '**')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/π/g, Math.PI.toString())
                .replace(/e/g, Math.E.toString())
                .replace(/(\d+)!/g, (match, p1) => this.factorial(parseInt(p1)))
                .replace(/mod/g, '%')
                .replace(/×/g, '*');

            return Function('"use strict"; return (' + expr + ')')();
        } catch (error) {
            throw new Error('Invalid expression');
        }
    }

    calculate() {
        if (!this.currentExpression) return;

        try {
            const result = this.evaluateExpression(this.currentExpression);

            if (!isFinite(result)) {
                throw new Error('Invalid result');
            }

            this.result = this.formatNumber(result);
            this.addToHistory(this.currentExpression, this.result);
            this.justCalculated = true;
        } catch (error) {
            this.result = 'Error';
            this.justCalculated = true;
        }

        this.updateDisplay();
    }

    formatNumber(num) {
        if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }
        return parseFloat(num.toPrecision(12)).toString();
    }

    updateDisplay() {
        document.getElementById('expression').textContent = this.currentExpression;
        document.getElementById('result').textContent = this.result;
        document.getElementById('result').className = this.result === 'Error' ? 'result error' : 'result';
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleString()
        };

        this.history.unshift(historyItem);

        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
            return;
        }

        historyList.innerHTML = this.history.map(item => `
                    <div class="history-item fade-in" onclick="calculator.useHistoryItem('${item.expression}', '${item.result}')">
                        <div class="history-expression">${item.expression}</div>
                        <div class="history-result">= ${item.result}</div>
                    </div>
                `).join('');
    }

    useHistoryItem(expression, result) {
        this.currentExpression = expression;
        this.result = result;
        this.updateDisplay();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }
}

// Global functions for button clicks
let calculator;

function initCalculator() {
    calculator = new AdvancedCalculator();
}

function insertNumber(num) { calculator.insertNumber(num); }
function insertOperator(op) { calculator.insertOperator(op); }
function insertFunction(func) { calculator.insertFunction(func); }
function insertConstant(constant) { calculator.insertConstant(constant); }
function clearAll() { calculator.clearAll(); }
function clearEntry() { calculator.clearEntry(); }
function backspace() { calculator.backspace(); }
function toggleSign() { calculator.toggleSign(); }
function calculate() { calculator.calculate(); }
function clearHistory() { calculator.clearHistory(); }

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initCalculator);