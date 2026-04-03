 # Implementation Plan: Expense Tracker Enhancements

## Overview

Implementasi tiga peningkatan fitur pada aplikasi vanilla HTML/CSS/JS yang sudah ada:
1. Custom Categories — tambah/hapus kategori kustom di localStorage
2. Monthly Summary View — ringkasan total pengeluaran per bulan kalender
3. Sort Transactions — pengurutan daftar transaksi berdasarkan amount atau category

Semua perubahan dilakukan pada tiga file yang sudah ada: `index.html`, `js/app.js`, dan `css/style.css`.

## Tasks

- [x] 1. Perbarui `index.html` dengan section dan elemen baru
  - Tambahkan `<section id="category-manager">` dengan form input kategori dan `<ul>` untuk daftar custom categories
  - Tambahkan `<section id="monthly-summary">` dengan placeholder dan `<ul>` untuk daftar bulan
  - Tambahkan sort controls (dua `<select>` untuk Sort_Key dan Sort_Order) di dalam `<section id="list">` di atas `<ul id="transaction-list">`
  - Tambahkan `<p id="category-error" class="hidden">` di dalam `#category-manager` untuk pesan error validasi
  - _Requirements: 7.1, 8.1, 9.1, 9.2_

- [x] 2. Implementasi Custom Categories di `js/app.js`
  - [x] 2.1 Tambahkan konstanta dan fungsi storage untuk custom categories
    - Tambahkan `const BUILT_IN_CATEGORIES = ["Food", "Transport", "Fun"]`
    - Tambahkan `const CUSTOM_CATEGORIES_KEY = "expense-tracker-custom-categories"`
    - Implementasikan `loadCustomCategories()` — baca dari localStorage, return `[]` jika tidak ada atau JSON invalid
    - Implementasikan `saveCustomCategories(cats)` — tulis ke localStorage, tampilkan `#storage-warning` jika gagal
    - _Requirements: 7.8_

  - [ ]* 2.2 Tulis property test untuk `loadCustomCategories` error handling
    - Verifikasi return `[]` saat key tidak ada dan saat nilai JSON invalid
    - _Requirements: 7.8_

  - [x] 2.3 Implementasikan `validateCategory(name, existing)`
    - Return error string jika `name.trim()` kosong: `"Category name is required."`
    - Return error string jika nama sudah ada (case-insensitive match terhadap `existing`): `"Category already exists."`
    - Return `null` jika valid
    - _Requirements: 7.3, 7.4_

  - [ ]* 2.4 Tulis property test untuk `validateCategory`
    - **Property 2: Whitespace category rejection**
    - **Validates: Requirements 7.3**
    - **Property 3: Duplicate category rejection**
    - **Validates: Requirements 7.4**

  - [x] 2.5 Implementasikan `populateCategorySelect(customCats)`
    - Rebuild `<select#category>` dengan opsi built-in (Food, Transport, Fun) diikuti custom categories
    - Pertahankan opsi `-- Select --` sebagai opsi pertama
    - _Requirements: 7.2, 7.7, 7.8_

  - [x] 2.6 Implementasikan `renderCategoryManager(customCats)`
    - Render `<ul>` di dalam `#category-manager` dengan satu `<li>` per custom category
    - Setiap `<li>` memiliki atribut `data-category` dan tombol delete
    - Jika tidak ada custom category, tampilkan pesan placeholder
    - _Requirements: 7.5_

  - [ ]* 2.7 Tulis property test untuk `renderCategoryManager`
    - **Property 4: Category manager renders all custom categories**
    - **Validates: Requirements 7.5**

  - [x] 2.8 Implementasikan `addCustomCategory(name)` dan `deleteCustomCategory(name)`
    - `addCustomCategory`: validasi, tambah ke array, simpan, re-render category manager dan select
    - `deleteCustomCategory`: hapus dari array, simpan, re-render category manager dan select; jangan ubah `transactions`
    - _Requirements: 7.2, 7.6, 7.9_

  - [ ]* 2.9 Tulis property test untuk add/delete custom category
    - **Property 1: Category add round-trip**
    - **Validates: Requirements 7.2, 7.8**
    - **Property 5: Category delete removes from storage and select**
    - **Validates: Requirements 7.6**
    - **Property 6: Built-in categories invariant**
    - **Validates: Requirements 7.7**
    - **Property 7: Deleting a category preserves transactions**
    - **Validates: Requirements 7.9**

  - [x] 2.10 Implementasikan `handleCategoryFormSubmit(event)` dan `handleCategoryDeleteClick(event)`
    - `handleCategoryFormSubmit`: prevent default, validasi, tampilkan/sembunyikan `#category-error`, panggil `addCustomCategory`
    - `handleCategoryDeleteClick`: delegated handler, baca `data-category` dari tombol delete, panggil `deleteCustomCategory`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 3. Checkpoint — Pastikan semua fungsi Custom Categories bekerja
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implementasi Monthly Summary View di `js/app.js`
  - [ ] 4.1 Perbarui `addTransaction` untuk menyertakan field `date`
    - Tambahkan `date: new Date().toISOString().slice(0, 10)` ke objek transaksi baru
    - _Requirements: 8.4_

  - [ ]* 4.2 Tulis property test untuk transaction date
    - **Property 9: Transaction date recorded and persisted**
    - **Validates: Requirements 8.4**

  - [ ] 4.3 Implementasikan `computeMonthlySummary(transactions)`
    - Group transaksi berdasarkan key `"YYYY-MM"`, sum amounts per group
    - Skip transaksi tanpa field `date` (graceful degradation untuk data lama)
    - Return array `{ key, total }` diurutkan descending (paling baru pertama)
    - _Requirements: 8.1, 8.3_

  - [ ]* 4.4 Tulis property test untuk `computeMonthlySummary`
    - **Property 8: Monthly summary correctness**
    - **Validates: Requirements 8.1, 8.3**

  - [ ] 4.5 Implementasikan `renderMonthlySummary(transactions)`
    - Panggil `computeMonthlySummary`, render `<ul>` di `#monthly-summary`
    - Format label bulan: `new Date(key + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })`
    - Format total ke dua desimal
    - Tampilkan placeholder jika tidak ada transaksi atau semua transaksi tanpa `date`
    - _Requirements: 8.1, 8.2, 8.5, 8.6, 8.7_

  - [ ]* 4.6 Tulis property test untuk format rendering monthly summary
    - **Property 10: Monthly summary rendering format**
    - **Validates: Requirements 8.6, 8.7**

- [ ] 5. Checkpoint — Pastikan Monthly Summary tampil dan update dengan benar
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implementasi Sort Transactions di `js/app.js`
  - [ ] 6.1 Tambahkan sort state dan implementasikan `getSortedTransactions`
    - Tambahkan `let sortState = { key: null, order: "asc" }` sebagai module-level state
    - Implementasikan `getSortedTransactions(transactions, state)` — return sorted copy tanpa mutasi array asli
    - Jika `state.key === null`, return copy array dalam insertion order
    - Sort numerik untuk `key = "amount"`, sort alfabetis untuk `key = "category"` (stable sort)
    - _Requirements: 9.3, 9.4, 9.5, 9.7, 9.8_

  - [ ] 6.2 Tulis property test untuk `getSortedTransactions`
    - **Property 11: Sort produces correct order without mutating storage**
    - **Validates: Requirements 9.3, 9.4, 9.5**
    - **Property 12: Stable sort preserves relative order for equal keys**
    - **Validates: Requirements 9.8**

  - [ ] 6.3 Perbarui `renderList` untuk menggunakan `getSortedTransactions`
    - Ubah `renderList(transactions)` agar memanggil `getSortedTransactions(transactions, sortState)` sebelum render
    - _Requirements: 9.3, 9.6_

  - [ ] 6.4 Implementasikan `handleSortChange(event)`
    - Baca nilai dari `<select>` Sort_Key dan Sort_Order
    - Update `sortState`, panggil `renderList(transactions)`
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 7. Perbarui `validateForm` dan fungsi `init` di `js/app.js`
  - Perbarui `validateForm` agar memvalidasi category terhadap semua kategori (built-in + custom), bukan hanya `VALID_CATEGORIES` hardcoded
  - Perbarui `init` untuk: load custom categories, render category manager, populate select, render monthly summary, attach event listeners untuk category form, category delete, dan sort controls
  - _Requirements: 7.2, 7.8, 8.2, 9.6, 9.7_

- [ ] 8. Tambahkan CSS untuk fitur baru di `css/style.css`
  - Style untuk `#category-manager`: form input + button inline, list item dengan delete button
  - Style untuk `#monthly-summary`: list bulan dengan label + amount
  - Style untuk sort controls: row dengan dua `<select>` di atas transaction list
  - Tambahkan CSS custom property `--color-custom: #94a3b8` sebagai warna fallback untuk custom categories
  - _Requirements: 7.1, 7.5, 8.1, 9.1, 9.2_

- [x] 9. Final checkpoint — Pastikan semua fitur terintegrasi
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk traceability
- `sortState` tidak dipersist ke localStorage — reset ke `{ key: null, order: "asc" }` setiap page load (Req 9.7)
- Transaksi lama tanpa field `date` tidak muncul di monthly summary (graceful degradation)
- Property tests menggunakan fast-check via CDN atau npm
