# Quy tắc và Công thức Tính Toán Bánh Xe Cầu Trục

## 1. Mục tiêu
Tính tải trọng, ứng suất tiếp xúc, lực cản di chuyển và công suất động cơ cho cơ cấu di chuyển cầu trục.

---

## 2. Tham số đầu vào

| Ký hiệu | Đơn vị | Ý nghĩa |
|----------|---------|---------|
| S | m | Khẩu độ cầu trục (khoảng cách giữa hai gối dầm chính) |
| x | m | Vị trí tâm xe con tính từ đầu trái dầm chính (0 ≤ x ≤ S) |
| Q | kg | Tải nâng danh định |
| Gx | kg | Trọng lượng xe con |
| Gc | kg | Tự trọng dầm chính (phân bố đều) |
| z | - | Số bánh ở mỗi đầu dầm chính (thường z = 2) |
| b | - | Số bánh chủ động (thường b = 2) |
| D | m | Đường kính bánh xe |
| B (b_w) | cm | Bề rộng vành bánh tiếp xúc với ray |
| r | cm | Bán kính bánh xe |
| v | m/min | Tốc độ di chuyển của cầu trục |
| η | - | Hiệu suất truyền động tổng (0.9) | mặc định
| m | - | Hệ số cản ray/gờ nối (0.08) | mặc định
| f | - | Hệ số lăn (0.015) | mặc định
| a | - | Độ dốc ray (ví dụ 0.003 tương đương 0.3%) |
| K_dyn | - | Hệ số động cho tải bánh (1.1) | mặc định
| μ | - | Hệ số bám bánh–ray (0.2) | mặc định
| [σ]_H | kg/cm² | Ứng suất tiếp xúc cho phép |
| [τ] | MPa | Ứng suất cắt cho phép của trục |
| n_dc | rpm | Tốc độ định mức động cơ (menu chọn trong dải tốc độ phổ biến) |

---

## 3. Phân bố tải lên bánh xe

### Tải tập trung
P = Q + Gx

### Phản lực hai đầu dầm
R_L = Gc/2 + P*(S-x)/S
R_R = Gc/2 + P*(x/S)

### Tải mỗi bánh (z bánh mỗi đầu)
N_L = R_L/z
N_R = R_R/z

### Bánh chịu tải lớn nhất
N_max = Gc/(2z) + (P/z) * max((S-x)/S, x/S)

### Thêm hệ số động
N_t = K_dyn * N_max

---

## 4. Ứng suất tiếp xúc bánh–ray

σ_H = 600 * sqrt(N_t / (B * r))  (kg/cm²)

Điều kiện:
n_H = [σ]_H / σ_H ≥ 1.2

---

## 5. Lực cản di chuyển và lực kéo

### Tổng trọng lượng
G_tot = Q + Gx + Gc

### Lực cản lăn
W1 = b * (G_tot * (2m + f * D)) / D

### Lực cản do độ dốc
W2 = a * G_tot

### Tổng lực kéo
W = W1 + W2

---

## 6. Kiểm tra bám bánh chủ động

T_bam_max = μ * N_drive_sum ≥ W

---

## 7. Công suất động cơ di chuyển

Trong hệ "kgf":
N_dc [kW] = (W * v) / (60 * 102 * η)

Trong hệ SI:
N_dc [kW] = ((W * 9.81) * (v / 60)) / (1000 * η)

---

## 8. Tốc độ bánh và tỉ số truyền

n_wheel = (v / (π * D)) * 60

i_total = n_dc / n_wheel

---

## 9. Kiểm tra trục bánh

M_dc [N·m] = (9550 * N_dc [kW]) / n_dc [rpm]

F_t [N] = (M_ra * 1000) / (0.5 * D)

M_td = sqrt(M_u^2 + (k_t * M_x)^2)

d ≥ (16 * M_td / (π * [τ]))^(1/3)

---

## 10. Kết luận

| Hạng mục | Điều kiện đạt |
|-----------|---------------|
| Ứng suất tiếp xúc | n_H ≥ 1.2 |
| Bám bánh–ray | μ ΣN_t ≥ W |
| Công suất | N_dc (thực tế) ≥ N_dc (tính) |
| Độ bền trục | d (chọn) ≥ d (tính) |

---