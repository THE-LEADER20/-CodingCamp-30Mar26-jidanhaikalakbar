# Requirements Document

## Introduction

Tiga peningkatan fitur untuk aplikasi Expense Tracker berbasis vanilla HTML/CSS/JS yang sudah ada. Fitur-fitur ini memperluas fungsionalitas yang ada tanpa mengubah arsitektur inti: state tetap disimpan di `localStorage`, tidak ada framework, tidak ada build step.

Fitur yang ditambahkan:
1. **Custom Categories** — pengguna dapat membuat dan menghapus kategori sendiri di luar kategori bawaan (Food, Transport, Fun).
2. **Monthly Summary View** — tampilan ringkasan total pengeluaran per bulan.
3. **Sort Transactions** — pengguna dapat mengurutkan daftar transaksi berdasarkan jumlah (amount) atau kategori.

## Glossary

- **App**: Aplikasi expense tracker vanilla web yang sudah ada
- **Transaction**: Satu catatan pengeluaran dengan properti `id`, `name`, `amount`, `category`
- **Category**: Label pengelompokan transaksi; dapat berupa kategori bawaan (Food, Transport, Fun) atau kategori kustom yang dibuat pengguna
- **Custom_Category**: Kategori yang dibuat oleh pengguna, disimpan terpisah di Storage
- **Storage**: Browser `localStorage` yang digunakan untuk menyimpan semua data di sisi klien
- **Monthly_Summary**: Tampilan agregat yang menampilkan total pengeluaran per bulan kalender
- **Sort_Order**: Urutan tampilan daftar transaksi — dapat berupa ascending atau descending
- **Sort_Key**: Kriteria pengurutan — `amount` atau `category`
- **Category_Manager**: Bagian UI yang memungkinkan pengguna menambah dan menghapus Custom_Category
- **Transaction_List**: Daftar `<ul>` yang menampilkan semua transaksi

---

## Requirements

### Requirement 7: Custom Categories

**User Story:** As a user, I want to create and delete my own expense categories, so that I can organize my spending beyond the default Food, Transport, and Fun options.

#### Acceptance Criteria

1. THE App SHALL provide a Category_Manager UI that allows the user to input a new category name and submit it.
2. WHEN the user submits a new category name that is non-empty after trimming, THE App SHALL add the Custom_Category to Storage and make it immediately available as an option in the category `<select>` of the add-transaction form.
3. IF the user submits a category name that is empty or whitespace-only, THEN THE App SHALL display a validation error and prevent saving the Custom_Category.
4. IF the user submits a category name that already exists (case-insensitive match against all existing categories), THEN THE App SHALL display a validation error and prevent saving the duplicate.
5. THE App SHALL display all Custom_Category entries in the Category_Manager with a delete action for each.
6. WHEN the user deletes a Custom_Category, THE App SHALL remove it from Storage and remove it from the category `<select>` options.
7. THE App SHALL preserve the three built-in categories (Food, Transport, Fun) at all times; the delete action SHALL NOT be available for built-in categories.
8. THE App SHALL read all Custom_Category entries from Storage on page load and populate the category `<select>` accordingly.
9. WHEN a Custom_Category is deleted, THE App SHALL retain all existing transactions that use that category — only the category option is removed from the form.

---

### Requirement 8: Monthly Summary View

**User Story:** As a user, I want to see a summary of my total spending grouped by month, so that I can understand my spending trends over time.

#### Acceptance Criteria

1. THE App SHALL display a Monthly_Summary section that lists each calendar month for which at least one transaction exists, along with the total amount spent in that month.
2. WHEN a transaction is added or deleted, THE App SHALL update the Monthly_Summary without a page reload.
3. THE App SHALL display each month entry in the Monthly_Summary in descending chronological order (most recent month first).
4. THE App SHALL record the date of each transaction at the time it is added, using the client's local date, and store it as part of the Transaction in Storage.
5. WHEN no transactions exist, THE App SHALL display a placeholder message in the Monthly_Summary section instead of a list.
6. THE App SHALL format each month label in the Monthly_Summary as "Month YYYY" (e.g., "January 2025").
7. THE App SHALL display each month's total amount in the Monthly_Summary formatted to two decimal places.

---

### Requirement 9: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or by category, so that I can quickly find and review my spending patterns.

#### Acceptance Criteria

1. THE App SHALL provide sort controls in the Transaction_List section that allow the user to select a Sort_Key of either "Amount" or "Category".
2. THE App SHALL provide sort controls that allow the user to select a Sort_Order of either ascending or descending.
3. WHEN the user changes the Sort_Key or Sort_Order, THE App SHALL re-render the Transaction_List in the selected order without modifying the underlying Storage data.
4. WHEN sorting by "Amount", THE App SHALL order transactions numerically by the `amount` field.
5. WHEN sorting by "Category", THE App SHALL order transactions alphabetically by the `category` field.
6. THE App SHALL apply the currently selected sort whenever the Transaction_List is re-rendered (e.g., after adding or deleting a transaction).
7. THE App SHALL default to no sorting (insertion order) when the page first loads.
8. IF two transactions have equal values for the selected Sort_Key, THEN THE App SHALL maintain their relative insertion order (stable sort).
