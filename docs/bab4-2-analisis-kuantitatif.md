# 4.6 Deskripsi Data dan Hasil Analisis Kuantitatif

## 4.6.1 Deskripsi Instrumen dan Skala
Kuesioner menggunakan skala Likert 1-5 dengan ketentuan sebagai berikut.

| Skor | Keterangan |
|---:|---|
| 1 | Tidak setuju |
| 2 | Kurang setuju |
| 3 | Cukup setuju |
| 4 | Setuju |
| 5 | Sangat setuju |

Butir pertanyaan yang digunakan:
- Q1: Apakah bermanfaat
- Q2: Apakah bagus (user friendly)
- Q3: Apakah ada kekurangan
- Q4: Apakah bisa digunakan banyak orang
- Q5: Apakah bisa digunakan dalam waktu yang lama

Catatan: Q3 merupakan butir negatif. Pada analisis konsistensi instrumen, skor Q3 dibalik dengan rumus `Q3R = 6 - Q3`.

## 4.6.2 Data Responden
Jumlah responden sebanyak 17 orang. Data mentah tersimpan pada file `docs/data-kuesioner-17responden.csv`.

## 4.6.3 Statistik Deskriptif

### A. Statistik per Butir
| Butir | Mean | SD | Frek 1 | Frek 2 | Frek 3 | Frek 4 | Frek 5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 3.2353 | 0.9034 | 1 | 1 | 9 | 5 | 1 |
| Q2 | 3.3529 | 0.9315 | 0 | 3 | 7 | 5 | 2 |
| Q3 | 3.1176 | 0.9926 | 1 | 4 | 4 | 8 | 0 |
| Q4 | 3.5294 | 0.9432 | 0 | 3 | 4 | 8 | 2 |
| Q5 | 4.0588 | 0.6587 | 0 | 0 | 3 | 10 | 4 |

Rata-rata keseluruhan item adalah `3.4588`, yang menunjukkan kecenderungan jawaban berada pada kategori cukup setuju hingga setuju. Sebaran data juga beragam karena seluruh rentang nilai 1-5 muncul.

### B. Interpretasi Deskriptif
- Q1, Q2, dan Q4 menunjukkan penilaian positif terhadap manfaat, kemudahan penggunaan, dan potensi penggunaan oleh banyak orang.
- Q3 masih menunjukkan adanya kekurangan yang dirasakan responden, sehingga aspek ini perlu menjadi fokus pengembangan.
- Q5 memiliki rata-rata tertinggi, yang mengindikasikan sistem dinilai layak untuk penggunaan jangka panjang.

## 4.6.4 Hasil Uji Instrumen

### A. Uji Validitas
Uji validitas dilakukan dengan korelasi Pearson item-total.

Rumus:

`r = [n*Sigma(XY) - (Sigma X)(Sigma Y)] / sqrt([n*Sigma(X^2) - (Sigma X)^2][n*Sigma(Y^2) - (Sigma Y)^2])`

Kriteria pengujian:
- `n = 17`, sehingga `df = n - 2 = 15`
- `alpha = 0.05` (dua sisi)
- `t_tabel = 2.13145`
- `r_tabel = t / sqrt(t^2 + df) = 0.48215`
- Item dinyatakan valid jika `r_hitung > r_tabel`.

| Butir | r hitung | p-value | Keputusan |
|---|---:|---:|---|
| Q1 | 0.6469 | 0.0050 | Valid |
| Q2 | 0.5772 | 0.0153 | Valid |
| Q3R | 0.7470 | 0.0006 | Valid |
| Q4 | 0.8076 | 0.0001 | Valid |
| Q5 | 0.7341 | 0.0008 | Valid |

Kesimpulan: seluruh butir pertanyaan valid.

### B. Uji Reliabilitas
Reliabilitas dihitung menggunakan Cronbach's Alpha.

Rumus:

`alpha = (k/(k-1)) * (1 - (Sigma Var(item) / Var(total)))`

Dengan:
- `k = 5`
- `Var item = [0.8162, 0.8676, 0.9853, 0.8897, 0.4338]`
- `Sigma Var(item) = 3.9926`
- `Var(total) = 13.0588`

Perhitungan:

`alpha = (5/4) * (1 - 3.9926/13.0588)`

`alpha = 1.25 * (1 - 0.3057)`

`alpha = 1.25 * 0.6943 = 0.8678`

Kesimpulan: nilai `alpha = 0.8678 > 0.70`, sehingga instrumen reliabel.

## 4.6.5 Uji Asumsi Klasik

Untuk pengujian hipotesis kuantitatif digunakan model regresi linear sederhana dengan:
- Variabel bebas `X`: rata-rata `Q1, Q2, Q3R, Q4`
- Variabel terikat `Y`: `Q5`

### A. Uji Normalitas Residual (Shapiro-Wilk)
Hasil uji:
- `W = 0.9856`
- `p-value = 0.9913`

Karena `p > 0.05`, residual berdistribusi normal.

### B. Uji Linieritas
Uji linieritas dilakukan dengan membandingkan model linear terhadap model yang memuat komponen kuadrat (`X^2`).

Hasil uji deviasi dari linearitas:
- `F_dev = 0.0000398`
- `p-value = 0.9951`

Karena `p > 0.05`, tidak terdapat deviasi signifikan dari bentuk linear. Hubungan `X` terhadap `Y` dinyatakan linear.

## 4.6.6 Hasil Regresi dan Uji Hipotesis

### A. Ringkasan Nilai Dasar
- `n = 17`
- `Sigma X = 55.25`
- `Sigma Y = 69`
- `Sigma X^2 = 189.1875`
- `Sigma XY = 230.25`
- `Xbar = 3.25`
- `Ybar = 4.0588`
- `Sxx = 9.625`
- `Sxy = 6.0`

### B. Persamaan Regresi
Koefisien regresi:
- `b1 = Sxy/Sxx = 6.0/9.625 = 0.6234`
- `b0 = Ybar - b1*Xbar = 2.0328`

Persamaan regresi linear sederhana:

`Y = 2.0328 + 0.6234X`

Interpretasi: setiap kenaikan 1 poin pada persepsi kualitas aplikasi (`X`) meningkatkan skor keberlanjutan penggunaan (`Y`) sebesar 0.6234 poin.

### C. Koefisien Korelasi dan Determinasi
- `r = 0.7341` (hubungan positif kuat)
- `R^2 = 0.5389`

Artinya, sebesar 53.89% variasi `Y` dijelaskan oleh `X`, sedangkan 46.11% dipengaruhi faktor lain di luar model.

### D. Uji t (Parsial)
Hipotesis:
- `H0: b1 = 0` (tidak ada pengaruh signifikan)
- `H1: b1 != 0` (ada pengaruh signifikan)

Hasil:
- `SE(b1) = 0.1489`
- `t_hitung = 4.1866`
- `df = 15`
- `t_tabel = 2.1314`
- `p-value = 0.0008`

Keputusan: `|t_hitung| > t_tabel` dan `p < 0.05`, maka `H0` ditolak.

### E. Uji F (Kelayakan Model)
Hasil:
- `SST = 6.9412`
- `SSR = 3.7403`
- `SSE = 3.2009`
- `MSR = 3.7403`
- `MSE = 0.2134`
- `F_hitung = 17.5274`
- `F_tabel = 4.5431` (`df1 = 1`, `df2 = 15`, `alpha = 0.05`)
- `p-value = 0.0008`

Keputusan: `F_hitung > F_tabel` dan `p < 0.05`, sehingga model regresi signifikan.

## 4.6.7 Kesimpulan Analisis Kuantitatif
1. Data kuesioner 17 responden menunjukkan penilaian umum yang positif terhadap aplikasi.
2. Instrumen penelitian valid dan reliabel (`alpha = 0.8678`).
3. Asumsi regresi terpenuhi: residual normal dan hubungan linear.
4. Uji t dan uji F membuktikan adanya pengaruh signifikan persepsi kualitas aplikasi terhadap keberlanjutan penggunaan.
5. Model akhir yang diperoleh adalah `Y = 2.0328 + 0.6234X` dengan `R^2 = 0.5389`.

## 4.6.8 Saran Penyajian Visual
- Grafik batang frekuensi jawaban tiap butir (Q1-Q5).
- Scatter plot hubungan `X` dan `Y` beserta garis regresi.
- Diagram ringkas status pengujian (validitas, reliabilitas, asumsi, dan hipotesis).
