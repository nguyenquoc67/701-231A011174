"use strict";

/* ======================================================
   HÀM DÙNG CHUNG: đánh dấu active link trên menu
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar a").forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
});

/* ======================================================
   BÀI TẬP 1: DANH SÁCH SẢN PHẨM + TÌM KIẾM
   Logic tư duy:
   - Dữ liệu sản phẩm là mảng object cố định trong JS (không
     lấy trực tiếp từ input người dùng) -> tránh được rủi ro
     khi render ra DOM.
   - Khi hiển thị, dùng textContent (KHÔNG dùng innerHTML với
     dữ liệu thô) để trình duyệt không hiểu nhầm chuỗi là thẻ
     HTML/script -> chống XSS injection cơ bản.
   - Chuỗi tìm kiếm của người dùng được .trim() để loại bỏ
     khoảng trắng thừa, sau đó .toLowerCase() để so sánh
     không phân biệt hoa/thường, không nối trực tiếp vào HTML.
   - Tối ưu tìm kiếm: vì dữ liệu nhỏ (vài chục sản phẩm) nên
     dùng Array.filter() với so khớp "includes" là đủ nhanh
     (O(n)). Nếu dữ liệu lớn hơn nhiều, có thể debounce sự
     kiện input (chỉ tìm sau khi người dùng ngừng gõ ~300ms)
     để giảm số lần render lại.
====================================================== */

const products = [
  { id: 1, name: "Bàn phím cơ AKKO", price: 850000, icon: "⌨️" },
  { id: 2, name: "Chuột không dây Logitech", price: 450000, icon: "🖱️" },
  { id: 3, name: "Tai nghe Bluetooth Sony", price: 1990000, icon: "🎧" },
  { id: 4, name: "Màn hình LG 24 inch", price: 3200000, icon: "🖥️" },
  { id: 5, name: "Webcam Full HD Logitech", price: 690000, icon: "📷" },
  { id: 6, name: "Ổ cứng SSD 512GB", price: 1100000, icon: "💾" },
  { id: 7, name: "Loa di động JBL", price: 1350000, icon: "🔊" },
];

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  const noResult = document.getElementById("noResult");
  if (!grid) return;

  grid.innerHTML = ""; // reset

  if (list.length === 0) {
    noResult.style.display = "block";
    return;
  }
  noResult.style.display = "none";

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const img = document.createElement("div");
    img.className = "product-img";
    img.textContent = p.icon; // textContent -> an toàn, không inject HTML

    const body = document.createElement("div");
    body.className = "product-body";

    const title = document.createElement("h3");
    title.textContent = p.name; // dữ liệu hiển thị qua textContent

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = p.price.toLocaleString("vi-VN") + " đ";

    body.appendChild(title);
    body.appendChild(price);
    card.appendChild(img);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

function initProductSearch() {
  const grid = document.getElementById("productGrid");
  if (!grid) return; // không phải trang baitap01 thì bỏ qua

  renderProducts(products);

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    // Làm sạch input: trim khoảng trắng, không nối thẳng vào HTML
    const keyword = e.target.value.trim().toLowerCase();

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(keyword)
    );
    renderProducts(filtered);
  });
}

/* ======================================================
   BÀI TẬP 2: FORM ĐĂNG KÝ + VALIDATE + LOCALSTORAGE
   Logic tư duy:
   - Chặn hành vi submit mặc định (e.preventDefault()) để tự
     kiểm soát luồng validate trước khi lưu dữ liệu.
   - Validate email bằng regex cơ bản, mật khẩu yêu cầu tối
     thiểu 8 ký tự + có chữ hoa, chữ thường, chữ số.
   - Về bảo mật dữ liệu cục bộ: LocalStorage không mã hoá và
     có thể bị đọc bởi bất kỳ script nào chạy trên cùng origin,
     nên KHÔNG bao giờ lưu mật khẩu dạng plain text trong thực
     tế. Ở bài demo này, mình chỉ lưu tên/email vào LocalStorage
     để minh hoạ thao tác lưu trữ; mật khẩu thực tế nên được
     gửi qua HTTPS lên server và hash (bcrypt/argon2) ở backend,
     không bao giờ xử lý hay lưu trữ phía client.
   - Dữ liệu hiển thị lại (nếu có) cũng dùng textContent để
     tránh injection tương tự bài 1.
====================================================== */

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameInput = document.getElementById("regName");
  const emailInput = document.getElementById("regEmail");
  const passInput = document.getElementById("regPassword");
  const agreeInput = document.getElementById("regAgree");
  const successMsg = document.getElementById("successMsg");

  const emailError = document.getElementById("emailError");
  const passError = document.getElementById("passError");
  const agreeError = document.getElementById("agreeError");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // tự kiểm soát luồng, không reload trang

    let valid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!emailRegex.test(email)) {
      emailError.style.display = "block";
      valid = false;
    } else {
      emailError.style.display = "none";
    }

    if (!passRegex.test(password)) {
      passError.style.display = "block";
      valid = false;
    } else {
      passError.style.display = "none";
    }

    if (!agreeInput.checked) {
      agreeError.style.display = "block";
      valid = false;
    } else {
      agreeError.style.display = "none";
    }

    if (!name) {
      valid = false;
    }

    if (!valid) {
      successMsg.style.display = "none";
      return;
    }

    // Chỉ lưu thông tin không nhạy cảm vào LocalStorage (demo)
    const userData = { name, email, registeredAt: new Date().toISOString() };
    localStorage.setItem("registeredUser", JSON.stringify(userData));

    successMsg.textContent = "Đăng ký thành công! Dữ liệu đã được lưu.";
    successMsg.style.display = "block";
    form.reset();
  });
}

/* ======================================================
   BÀI TẬP 3: COUNTDOWN TIMER 10 PHÚT
   Logic tư duy:
   - Dùng một biến module-scope (intervalId) để lưu tham chiếu
     setInterval. Trước khi tạo interval mới (khi bấm Start
     nhiều lần) luôn clearInterval(intervalId) trước -> tránh
     tạo nhiều interval chạy song song (nguyên nhân phổ biến
     gây memory leak / chạy sai thời gian).
   - Khi countdown về 0, chủ động gọi clearInterval() để dừng
     hẳn, không để interval tiếp tục chạy nền vô ích.
   - Nếu người dùng rời trang (đóng tab, chuyển trang), trình
     duyệt sẽ tự dọn dẹp toàn bộ context kèm theo interval, nên
     không cần xử lý thêm; nhưng để an toàn, mình vẫn gọi
     clearInterval trong beforeunload để đảm bảo dừng kịp thời.
   - Đồng bộ với server khi deploy: vì setInterval chạy hoàn
     toàn ở client nên có thể bị lệch nếu tab bị "throttle" khi
     ẩn (background tab) hoặc máy người dùng sai giờ hệ thống.
     Giải pháp khi deploy thật: lưu mốc thời gian kết thúc
     (endTime) dựa trên thời gian lấy từ server (ví dụ gọi API
     /api/time hoặc dùng Date header của response) thay vì chỉ
     dựa vào đồng hồ máy client, sau đó tính thời gian còn lại
     bằng "endTime - Date.now()" mỗi tick thay vì đếm lùi cộng
     dồn, để tránh sai số tích luỹ.
====================================================== */

let countdownInterval = null;
let remainingSeconds = 10 * 60; // 10 phút

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");
  if (!display) return;
  display.textContent = formatTime(remainingSeconds);

  if (remainingSeconds <= 60) {
    display.classList.add("warning");
  } else {
    display.classList.remove("warning");
  }
}

function tickTimer() {
  if (remainingSeconds <= 0) {
    clearInterval(countdownInterval); // dừng hẳn, tránh leak
    countdownInterval = null;
    showTimeUpModal();
    return;
  }
  remainingSeconds -= 1;
  updateTimerDisplay();
}

function startTimer() {
  if (countdownInterval) return; // đã chạy rồi thì không tạo thêm
  if (remainingSeconds <= 0) remainingSeconds = 10 * 60;
  countdownInterval = setInterval(tickTimer, 1000);
}

function pauseTimer() {
  clearInterval(countdownInterval); // luôn clear trước khi gán null
  countdownInterval = null;
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = 10 * 60;
  updateTimerDisplay();
  const display = document.getElementById("timerDisplay");
  if (display) display.classList.remove("warning");
  closeTimeUpModal();
}

function showTimeUpModal() {
  const modal = document.getElementById("timeUpModal");
  if (modal) modal.classList.add("show");
}

function closeTimeUpModal() {
  const modal = document.getElementById("timeUpModal");
  if (modal) modal.classList.remove("show");
}

function initCountdown() {
  const display = document.getElementById("timerDisplay");
  if (!display) return; // không phải trang baitap03 thì bỏ qua

  updateTimerDisplay();

  document.getElementById("startBtn").addEventListener("click", startTimer);
  document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
  document.getElementById("resetBtn").addEventListener("click", resetTimer);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeTimeUpModal);

  // Dọn dẹp interval khi rời trang để tránh memory leak
  window.addEventListener("beforeunload", () => {
    clearInterval(countdownInterval);
  });
}

/* ======================================================
   KHỞI CHẠY THEO TRANG
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initProductSearch();
  initRegisterForm();
  initCountdown();
});
