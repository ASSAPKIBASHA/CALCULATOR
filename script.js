// Vanilla JS Calculator
// - Simple, beginner-friendly implementation
// - Handles +, -, *, /
// - Manages state and history
// - Basic error handling (division by zero, invalid inputs)

(function () {
  'use strict';

  // Elements (may be null if loaded in a test page)
  const screenEl = document.getElementById('screen');
  const exprEl = document.getElementById('expression');
  const keysEl = document.getElementById('keys');
  const historyListEl = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');

  // Calculator state
  let current = '0'; // current input as string
  let previous = null; // previous value as number
  let operator = null; // '+', '-', '*', '/'
  let overwrite = true; // overwrite screen with next digit after equals

  /** Utility: update the display */
  function updateDisplay() {
    if (!screenEl || !exprEl) return; // allow script to load on test pages without DOM
    screenEl.textContent = current;
    const opSymbol = operator ? ` ${operatorSymbol(operator)} ` : '';
    exprEl.textContent = previous !== null ? `${trimEndZeros(previous)}${opSymbol}` : '';
  }

  /** Convert internal operator to pretty symbol */
  function operatorSymbol(op) {
    switch (op) {
      case '/': return '÷';
      case '*': return '×';
      case '-': return '−';
      case '+': return '+';
      default: return op || '';
    }
  }

  /** Append a new history item */
  function addHistoryItem(expression, result) {
    if (!historyListEl) return;
    const li = document.createElement('li');
    const expSpan = document.createElement('span');
    expSpan.textContent = expression;
    const resSmall = document.createElement('small');
    resSmall.textContent = `= ${result}`;
    li.appendChild(expSpan);
    li.appendChild(resSmall);
    historyListEl.prepend(li);
  }

  function trimEndZeros(value) {
    // Format numbers like 12.3400 -> 12.34, 10.0 -> 10, 0.000 -> 0
    const s = String(value);
    if (!s.includes('.')) return s;
    let out = s.replace(/0+$/, ''); // strip trailing zeros
    if (out.endsWith('.')) out = out.slice(0, -1); // strip dangling decimal point
    return out === '' ? '0' : out;
  }

  /** Clear calculator */
  function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    overwrite = true;
    updateDisplay();
  }

  /** Delete last character */
  function deleteLast() {
    if (overwrite) { current = '0'; overwrite = false; updateDisplay(); return; }
    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  /** Input a digit 0-9 */
  function inputDigit(d) {
    if (overwrite) {
      current = d;
      overwrite = false;
    } else {
      if (current === '0') current = d; else current += d;
    }
    updateDisplay();
  }

  /** Input decimal point */
  function inputDecimal() {
    if (overwrite) {
      current = '0.';
      overwrite = false;
    } else if (!current.includes('.')) {
      current += '.';
    }
    updateDisplay();
  }

  /** Choose an operator */
  function chooseOperator(op) {
    const currNum = parseFloat(current);
    if (operator && previous !== null && !overwrite) {
      // Chain operations like 3 + 2 + 4
      const res = evaluate(previous, operator, currNum);
      previous = res;
      current = trimEndZeros(res);
      overwrite = true;
    } else {
      previous = currNum;
      overwrite = true;
    }
    operator = op;
    updateDisplay();
  }

  /** Perform calculation */
  function evaluate(a, op, b) {
    if (!isFinite(a) || !isFinite(b)) return NaN;
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/':
        if (b === 0) return Infinity; // handled in equals
        return a / b;
      default: return b;
    }
  }

  /** Press equals */
  function pressEquals() {
    if (operator === null || previous === null) return; // nothing to compute
    const a = previous;
    const b = parseFloat(current);
    const res = evaluate(a, operator, b);

    if (!isFinite(res) || Math.abs(res) === Infinity) {
      screenEl.textContent = 'Error';
      exprEl.textContent = `${trimEndZeros(a)} ${operatorSymbol(operator)} ${trimEndZeros(b)}`;
      addHistoryItem(exprEl.textContent, 'Error');
      // reset
      current = '0';
      previous = null;
      operator = null;
      overwrite = true;
      return;
    }

    const expression = `${trimEndZeros(a)} ${operatorSymbol(operator)} ${trimEndZeros(b)}`;
    const resultStr = trimEndZeros(+res.toFixed(12)); // limit floating errors

    current = resultStr;
    previous = null;
    operator = null;
    overwrite = true; // next digit overwrites

    screenEl.textContent = current;
    exprEl.textContent = '';
    addHistoryItem(expression, resultStr);
  }

  /** Event delegation for keys */
  if (keysEl) {
    keysEl.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (!btn) return;

      const digit = btn.getAttribute('data-digit');
      const decimal = btn.getAttribute('data-decimal');
      const action = btn.getAttribute('data-action');
      const op = btn.getAttribute('data-operator');

      if (digit !== null) return inputDigit(digit);
      if (decimal !== null) return inputDecimal();
      if (op) return chooseOperator(op);

      if (action === 'clear') return clearAll();
      if (action === 'delete') return deleteLast();
      if (action === 'equals') return pressEquals();
    });
  }

  // Clear history
  if (clearHistoryBtn && historyListEl) {
    clearHistoryBtn.addEventListener('click', function () {
      historyListEl.innerHTML = '';
    });
  }

  // Keyboard support
  window.addEventListener('keydown', function (e) {
    const { key } = e;
    if ((key >= '0' && key <= '9')) return inputDigit(key);
    if (key === '.') return inputDecimal();
    if (key === '+' || key === '-' || key === '*' || key === '/') return chooseOperator(key);
    if (key === 'Enter' || key === '=') { e.preventDefault(); return pressEquals(); }
    if (key === 'Backspace') return deleteLast();
    if (key.toLowerCase() === 'c') return clearAll();
  });

  // Initialize
  updateDisplay();
})();

