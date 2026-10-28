const STORAGE_KEY = "hupuBookings";
const ADMIN_EMAIL = "admin@hupupattractions.com";
const ADMIN_PASSWORD = "balloon2026";

function getBookings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = [
      {
        id: crypto.randomUUID(),
        name: "Mila Chen",
        phone: "+1 (808) 453-1190",
        email: "mila@example.com",
        date: "2026-11-02",
        rideType: "Sunrise Vista",
        guests: 2,
        notes: "Anniversary getaway",
        status: "Confirmed",
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: "Oakley Brooks",
        phone: "+1 (808) 551-7764",
        email: "oakley@example.com",
        date: "2026-11-07",
        rideType: "Private Charter",
        guests: 6,
        notes: "Birthday celebration with family",
        status: "Pending",
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function addBooking(payload) {
  const bookings = getBookings();
  const newBooking = {
    id: crypto.randomUUID(),
    ...payload,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(newBooking);
  saveBookings(bookings);
}

function setupBookingForm() {
  const form = document.querySelector("#bookingForm");
  if (!form) return;

  const statusBox = document.querySelector("#bookingStatus");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      date: String(formData.get("date") || "").trim(),
      rideType: String(formData.get("rideType") || "").trim(),
      guests: Number(formData.get("guests") || 1),
      notes: String(formData.get("notes") || "").trim(),
    };

    const isValid = payload.name && payload.phone && payload.email && payload.date;
    if (!isValid) {
      statusBox.textContent = "Please complete all required fields.";
      statusBox.className = "status-message error";
      return;
    }

    addBooking(payload);
    form.reset();
    statusBox.textContent = "Your booking request has been received. Our hotline team will contact you shortly.";
    statusBox.className = "status-message success";
  });
}

function renderAdminDashboard() {
  const dashboard = document.querySelector(".dashboard");
  const loginCard = document.querySelector(".login-card");
  const bookings = getBookings();

  if (!dashboard) return;

  const total = bookings.length;
  const confirmed = bookings.filter((item) => item.status === "Confirmed").length;
  const pending = bookings.filter((item) => item.status === "Pending").length;

  const statEls = {
    total: document.querySelector("[data-stat='total']"),
    confirmed: document.querySelector("[data-stat='confirmed']"),
    pending: document.querySelector("[data-stat='pending']"),
    upcoming: document.querySelector("[data-stat='upcoming']"),
  };

  if (statEls.total) statEls.total.textContent = total;
  if (statEls.confirmed) statEls.confirmed.textContent = confirmed;
  if (statEls.pending) statEls.pending.textContent = pending;
  if (statEls.upcoming) statEls.upcoming.textContent = bookings.filter((item) => item.date).length;

  const tbody = document.querySelector("#bookingsTableBody");
  if (!tbody) return;

  tbody.innerHTML = bookings
    .map(
      (booking) => `
        <tr>
          <td>${booking.name}</td>
          <td>${booking.phone}</td>
          <td>${booking.rideType}</td>
          <td>${booking.date}</td>
          <td>${booking.guests}</td>
          <td><span class="status-pill ${booking.status === "Pending" ? "pending" : ""}">${booking.status}</span></td>
          <td>
            <div class="actions">
              <button class="table-button" data-action="confirm" data-id="${booking.id}">Confirm</button>
              <button class="table-button delete" data-action="delete" data-id="${booking.id}">Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  tbody.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;
      const nextBookings = getBookings();
      if (action === "confirm") {
        const item = nextBookings.find((booking) => booking.id === id);
        if (item) {
          item.status = "Confirmed";
          saveBookings(nextBookings);
          renderAdminDashboard();
        }
      }

      if (action === "delete") {
        const filtered = nextBookings.filter((booking) => booking.id !== id);
        saveBookings(filtered);
        renderAdminDashboard();
      }
    });
  });

  if (loginCard) loginCard.style.display = "none";
  dashboard.classList.add("visible");
}

function setupAdminLogin() {
  const form = document.querySelector("#adminLoginForm");
  const loginStatus = document.querySelector(".login-status");
  const dashboard = document.querySelector(".dashboard");
  const logoutButton = document.querySelector("#adminLogout");

  if (!form) return;

  const isLoggedIn = sessionStorage.getItem("hupuAdminLoggedIn") === "true";
  if (isLoggedIn) {
    renderAdminDashboard();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("hupuAdminLoggedIn", "true");
      renderAdminDashboard();
    } else {
      if (loginStatus) {
        loginStatus.textContent = "Incorrect email or password.";
      }
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem("hupuAdminLoggedIn");
      dashboard.classList.remove("visible");
      const loginCard = document.querySelector(".login-card");
      if (loginCard) loginCard.style.display = "block";
      form.reset();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setupBookingForm();
  setupAdminLogin();
});

















































































