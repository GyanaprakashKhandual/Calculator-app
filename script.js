const display = document.getElementById('display');
let expression = '';

function append(value) {
  if (expression === '0' && value !== '.') {
    expression = value;
  } else {
    expression += value;
  }
  display.innerText = expression;
}

function clearDisplay() {
  expression = '';
  display.innerText = '0';
}

function backspace() {
  expression = expression.slice(0, -1);
  display.innerText = expression || '0';
}

function calculate() {
  try {
    const result = eval(expression);
    display.innerText = result;
    expression = result.toString();
  } catch (error) {
    display.innerText = 'Error';
    expression = '';
  }
}

// Optional: Support keyboard input
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if ('0123456789.+-*/()'.includes(key)) {
    append(key);
  } else if (key === 'Enter') {
    calculate();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key === 'Escape') {
    clearDisplay();
  }
});