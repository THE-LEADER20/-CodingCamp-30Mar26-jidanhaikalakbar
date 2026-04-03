# Implementation Plan: Vanilla Web App — Expense Tracker

## Overview

Build a fully client-side expense tracker as a single HTML page with one CSS file and one JS file. No build step, no framework, no backend. State persists in `localStorage`. Implemented in vanilla HTML5, CSS3, and ES6+ JavaScript with Chart.js via CDN.

## Tasks

- [x] 1. Create project structure and HTML skeleton
  - Create `index.html` with semantic sections: `<header>`, `<section#balance>`, `<section#form>`, `<section#list>`, `<section#chart>`
  - Add Chart.js CDN `<script>` tag in `<head>`
  - Link `css/style.css` and `js/app.js`
  - Include form fields: Item Name (text), Amount (number), Category (select: Food, Transport, Fun)
  - Add `#form-error` and `#storage-warning` elements (hidden by default)
  - Add chart canvas `<canvas id="expense-chart">` and `<p class="chart-placeholder">` inside `#chart`
  - _Requirements: 1.1, 2.1, 5.3_

- [x] 2. Implement CSS layout and styling
  - Create `css/style.css` with flexbox/grid layout for all sections
  - Style the form, transaction list items, balance display, and chart section
  - Define CSS custom properties for category colors (`--color-food`, `--color-transport`, `--color-fun`)
  - Style `#form-error` and `#storage-warning` as hidden by default (use a `.hidden` utility class)
  - Style `.chart-placeholder` text
  - _Requirements: 1.1, 2.1, 5.3_

- [x] 3. Implement data layer and storage functions
  - Create `js/app.js` with the `CATEGORY_COLORS` constant and `Transaction` shape comment
  - Implement `loadFromStorage()`: reads `"expense-tracker-transactions"` key, parses JSON, returns `[]` on missing key or parse error
  - Implement `saveToStorage(transactions)`: serializes and writes to `localStorage`; on error, makes `#storage-warning` visible
  - Declare module-level `let transactions = []` and `let chartInstance = null`
  - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 3.1 Write property test for storage round-trip (Property 8)
    - **Property 8: Storage round-trip preserves transactions**
    - **Validates: Requirements 6.1, 6.2**

- [x] 4. Implement validation and transaction mutation functions
  - Implement `validateForm(name, amount, category)`: returns error string or `null` per validation rules (non-empty name, positive numeric amount, valid category)
  - Implement `addTransaction(name, amount, category)`: generates id via `crypto.randomUUID()`, pushes to `transactions`, calls `saveToStorage`, re-renders all UI
  - Implement `deleteTransaction(id)`: filters `transactions` by id, calls `saveToStorage`, re-renders all UI
  - _Requirements: 1.2, 1.3, 1.4, 3.1, 3.2_

  - [ ]* 4.1 Write property test for valid transaction addition (Property 1)
    - **Property 1: Valid transaction addition persists and appears**
    - **Validates: Requirements 1.2**

  - [ ]* 4.2 Write property test for empty field rejection (Property 2)
    - **Property 2: Empty field rejection**
    - **Validates: Requirements 1.3**

  - [ ]* 4.3 Write property test for invalid amount rejection (Property 3)
    - **Property 3: Invalid amount rejection**
    - **Validates: Requirements 1.4**

  - [ ]* 4.4 Write property test for delete removes from storage and list (Property 6)
    - **Property 6: Delete removes transaction from storage and list**
    - **Validates: Requirements 3.1**

- [x] 5. Implement render functions
  - Implement `renderBalance(transactions)`: sums all `amount` fields and updates the balance `<span>` in `#balance`
  - Implement `renderList(transactions)`: rebuilds the `<ul>` in `#list`; each `<li>` shows name, amount, category, and a delete button with `data-id`
  - Implement `renderChart(transactions)`: if empty, destroys `chartInstance` (if any) and shows `.chart-placeholder`; otherwise creates/updates Chart.js pie chart with per-category sums using `CATEGORY_COLORS`; guards with `typeof Chart !== 'undefined'`
  - _Requirements: 2.1, 2.2, 4.1, 4.2, 5.1, 5.2, 5.3_

  - [ ]* 5.1 Write property test for balance equals sum of amounts (Property 4)
    - **Property 4: Balance equals sum of amounts**
    - **Validates: Requirements 4.1, 1.5, 3.2**

  - [ ]* 5.2 Write property test for transaction list renders all fields (Property 5)
    - **Property 5: Transaction list renders all fields for all transactions**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 5.3 Write property test for chart data matches per-category sums (Property 7)
    - **Property 7: Chart data matches per-category sums**
    - **Validates: Requirements 5.1**

- [x] 6. Wire up event handlers and init
  - Implement `handleFormSubmit(event)`: calls `validateForm`, shows/hides `#form-error`, calls `addTransaction` on success, clears form fields
  - Implement `handleDeleteClick(event)`: delegated listener on `#list`; reads `data-id` from closest delete button, calls `deleteTransaction`
  - Implement `init()`: loads from storage into `transactions`, calls `renderList`, `renderBalance`, `renderChart`, attaches `handleFormSubmit` to form and `handleDeleteClick` to `#list`
  - Register `init` on `DOMContentLoaded`
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 4.2, 5.2, 6.1_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across many random inputs
- The `#storage-warning` and `#form-error` elements use a `.hidden` CSS class toggled by JS
