# Requirements Document

## Introduction

A client-side expense tracker built with vanilla HTML, CSS, and JavaScript. Users can add and delete transactions, view a running total balance, and see a pie chart of spending by category — all persisted in the browser's Local Storage with no backend required.

## Glossary

- **App**: The vanilla expense tracker web application
- **Transaction**: A single spending record with a name, amount, and category
- **Category**: A fixed label grouping transactions — one of Food, Transport, or Fun
- **Storage**: The browser's Local Storage API used to persist all data client-side
- **Chart**: A pie chart visualizing spending distribution by category
- **Balance**: The sum of all transaction amounts, displayed at the top of the App

## Requirements

### Requirement 1: Add Transaction

**User Story:** As a user, I want to fill in a form and add a transaction, so that I can record my spending.

#### Acceptance Criteria

1. THE App SHALL provide a form with three fields: Item Name (text), Amount (numeric), and Category (select with options Food, Transport, Fun).
2. WHEN the user submits the form with all fields filled and a valid positive amount, THE App SHALL add the transaction to Storage and display it in the transaction list.
3. IF the user submits the form with any field empty, THEN THE App SHALL display a validation error and prevent saving.
4. IF the user submits the form with a non-positive or non-numeric amount, THEN THE App SHALL display a validation error and prevent saving.
5. WHEN a transaction is successfully added, THE App SHALL clear the form fields and update the Balance and Chart.

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see all my transactions in a scrollable list, so that I can review what I've recorded.

#### Acceptance Criteria

1. THE App SHALL display all transactions stored in Storage in a scrollable list.
2. WHEN the transaction list is rendered, THE App SHALL show each transaction's item name, amount, and category.

### Requirement 3: Delete Transaction

**User Story:** As a user, I want to delete a transaction, so that I can remove incorrect entries.

#### Acceptance Criteria

1. WHEN the user clicks the delete action on a transaction, THE App SHALL remove that transaction from Storage and re-render the transaction list.
2. WHEN a transaction is deleted, THE App SHALL update the Balance and Chart to reflect the removal.

### Requirement 4: Total Balance

**User Story:** As a user, I want to see my total balance at the top of the page, so that I always know my current spending total.

#### Acceptance Criteria

1. THE App SHALL display the total balance, calculated as the sum of all transaction amounts, at the top of the page.
2. WHEN a transaction is added or deleted, THE App SHALL recalculate and update the displayed Balance without a page reload.

### Requirement 5: Spending Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand my spending distribution at a glance.

#### Acceptance Criteria

1. THE App SHALL render a pie chart showing the proportion of total spending for each category (Food, Transport, Fun).
2. WHEN transactions are added or deleted, THE App SHALL update the chart without requiring a page reload.
3. WHILE no transactions exist, THE App SHALL display a placeholder message in place of the chart.

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions to persist between sessions, so that I don't lose my data when I close the browser.

#### Acceptance Criteria

1. THE App SHALL read all transactions from Storage on page load and render them in the transaction list.
2. WHEN the user adds or deletes a transaction, THE App SHALL write the updated state to Storage immediately.
3. IF Storage is unavailable or throws an error, THEN THE App SHALL display a warning message indicating data cannot be saved.
