const STORAGE_KEY = "digitalClockAlarms";
const TIMEZONE_STORAGE_KEY = "digitalClockTimezone";
const TIMEZONE_COUNTRY_STORAGE_KEY = "digitalClockTimezoneCountry";

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const timezoneCountry = document.getElementById("timezoneCountry");
const timezoneCity = document.getElementById("timezoneCity");
const alarmsListEl = document.getElementById("alarmsList");
const alarmForm = document.getElementById("alarmForm");
const alarmTimeInput = document.getElementById("alarmTimeInput");
const alarmLabelInput = document.getElementById("alarmLabelInput");
const daysSelect = document.getElementById("daysSelect");
const ringingOverlay = document.getElementById("ringingOverlay");
const ringTimeEl = document.getElementById("ringTime");
const ringLabelEl = document.getElementById("ringLabel");
const stopBtn = document.getElementById("stopBtn");
const snoozeBtn = document.getElementById("snoozeBtn");
const alarmSound = document.getElementById("alarmSound");
const profile = document.getElementById("profile");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const profileLocation = document.getElementById("profileLocation");

let selectedDays = new Set();
let alarms = loadAlarms();
let activeAlarmId = null;
let lastCheckedMinute = null;

function readStorage(key) {
    try {
        return localStorage.getItem(key) || "";
    } catch (error) {
        console.warn("Не удалось прочитать сохранённые настройки:", error);
        return "";
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn("Не удалось сохранить настройку:", error);
        return false;
    }
}

const savedTimezone = readStorage(TIMEZONE_STORAGE_KEY);
const savedCountryValue = readStorage(TIMEZONE_COUNTRY_STORAGE_KEY);

const timezoneCities = {
    local: [{ value: "local", label: "Автоматически" }],
    korea: [
        { value: "Asia/Seoul", label: "Сеул" },
        { value: "Asia/Seoul", label: "Бусан" },
        { value: "Asia/Seoul", label: "Инчхон" },
        { value: "Asia/Seoul", label: "Тэгу" }
    ],
    kazakhstan: [
        { value: "Asia/Almaty", label: "Алматы" },
        { value: "Asia/Aqtau", label: "Актау" },
        { value: "Asia/Aqtobe", label: "Актобе" },
        { value: "Asia/Atyrau", label: "Атырау" },
        { value: "Asia/Oral", label: "Уральск" },
        { value: "Asia/Qostanay", label: "Костанай" },
        { value: "Asia/Qyzylorda", label: "Кызылорда" },
        { value: "Asia/Almaty", label: "Астана" }
    ],
    russia: [
        { value: "Europe/Moscow", label: "Москва" },
        { value: "Europe/Kaliningrad", label: "Калининград" },
        { value: "Asia/Yekaterinburg", label: "Екатеринбург" },
        { value: "Asia/Novosibirsk", label: "Новосибирск" },
        { value: "Asia/Vladivostok", label: "Владивосток" }
    ],
    ukraine: [{ value: "Europe/Kyiv", label: "Киев" }],
    albania: [{ value: "Europe/Tirane", label: "Тирана" }],
    andorra: [{ value: "Europe/Andorra", label: "Андорра-ла-Велья" }],
    armenia: [{ value: "Asia/Yerevan", label: "Ереван" }],
    azerbaijan: [{ value: "Asia/Baku", label: "Баку" }],
    germany: [{ value: "Europe/Berlin", label: "Берлин" }],
    georgia: [{ value: "Asia/Tbilisi", label: "Тбилиси" }],
    italy: [{ value: "Europe/Rome", label: "Рим" }],
    kosovo: [{ value: "Europe/Belgrade", label: "Приштина" }],
    austria: [{ value: "Europe/Vienna", label: "Вена" }],
    belarus: [{ value: "Europe/Minsk", label: "Минск" }],
    belgium: [{ value: "Europe/Brussels", label: "Брюссель" }],
    bosnia: [{ value: "Europe/Sarajevo", label: "Сараево" }],
    bulgaria: [{ value: "Europe/Sofia", label: "София" }],
    croatia: [{ value: "Europe/Zagreb", label: "Загреб" }],
    cyprus: [{ value: "Asia/Nicosia", label: "Никосия" }],
    czechia: [{ value: "Europe/Prague", label: "Прага" }],
    denmark: [{ value: "Europe/Copenhagen", label: "Копенгаген" }],
    estonia: [{ value: "Europe/Tallinn", label: "Таллин" }],
    finland: [{ value: "Europe/Helsinki", label: "Хельсинки" }],
    france: [{ value: "Europe/Paris", label: "Париж" }],
    greece: [{ value: "Europe/Athens", label: "Афины" }],
    hungary: [{ value: "Europe/Budapest", label: "Будапешт" }],
    iceland: [{ value: "Atlantic/Reykjavik", label: "Рейкьявик" }],
    ireland: [{ value: "Europe/Dublin", label: "Дублин" }],
    latvia: [{ value: "Europe/Riga", label: "Рига" }],
    liechtenstein: [{ value: "Europe/Vaduz", label: "Вадуц" }],
    lithuania: [{ value: "Europe/Vilnius", label: "Вильнюс" }],
    luxembourg: [{ value: "Europe/Luxembourg", label: "Люксембург" }],
    malta: [{ value: "Europe/Malta", label: "Валлетта" }],
    moldova: [{ value: "Europe/Chisinau", label: "Кишинёв" }],
    monaco: [{ value: "Europe/Monaco", label: "Монако" }],
    montenegro: [{ value: "Europe/Podgorica", label: "Подгорица" }],
    netherlands: [{ value: "Europe/Amsterdam", label: "Амстердам" }],
    "north-macedonia": [{ value: "Europe/Skopje", label: "Скопье" }],
    norway: [{ value: "Europe/Oslo", label: "Осло" }],
    poland: [{ value: "Europe/Warsaw", label: "Варшава" }],
    portugal: [{ value: "Europe/Lisbon", label: "Лиссабон" }],
    romania: [{ value: "Europe/Bucharest", label: "Бухарест" }],
    "san-marino": [{ value: "Europe/San_Marino", label: "Сан-Марино" }],
    serbia: [{ value: "Europe/Belgrade", label: "Белград" }],
    slovakia: [{ value: "Europe/Bratislava", label: "Братислава" }],
    slovenia: [{ value: "Europe/Ljubljana", label: "Любляна" }],
    spain: [{ value: "Europe/Madrid", label: "Мадрид" }],
    sweden: [{ value: "Europe/Stockholm", label: "Стокгольм" }],
    switzerland: [{ value: "Europe/Zurich", label: "Цюрих" }],
    turkey: [{ value: "Europe/Istanbul", label: "Стамбул" }],
    "united-kingdom": [{ value: "Europe/London", label: "Лондон" }],
    vatican: [{ value: "Europe/Vatican", label: "Ватикан" }]
};

function renderTimezoneCities(selectedTimezone) {
    const cities = timezoneCities[timezoneCountry.value];

    timezoneCity.innerHTML = cities
        .map(city => `<option value="${city.value}">${city.label}</option>`)
        .join("");

    if (selectedTimezone && cities.some(city => city.value === selectedTimezone)) {
        timezoneCity.value = selectedTimezone;
    }
}

const savedCountry = savedCountryValue && timezoneCities[savedCountryValue]
    ? savedCountryValue
    : Object.keys(timezoneCities).find(country =>
        timezoneCities[country].some(city => city.value === savedTimezone)
    );

if (savedCountry) {
    timezoneCountry.value = savedCountry;
}

renderTimezoneCities(savedTimezone);

function updateProfileLocation() {
    const country = timezoneCountry.options[timezoneCountry.selectedIndex].textContent;
    const city = timezoneCity.options[timezoneCity.selectedIndex].textContent;

    profileLocation.textContent = `${country}: ${city}`;
}

updateProfileLocation();

function loadAlarms() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Ошибка загрузки будильников:", error);
        return [];
    }
}

function saveAlarms() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (error) {
        console.error("Ошибка сохранения будильников:", error);
    }
}

function getTimezone() {
    return timezoneCity.value === "local" ? undefined : timezoneCity.value;
}

function getZonedParts(date) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-CA", {
            timeZone: getTimezone(),
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        })
            .formatToParts(date)
            .filter(part => part.type !== "literal")
            .map(part => [part.type, part.value])
    );

    const weekday = new Date(
        Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
    ).getUTCDay();

    return { ...parts, weekday };
}

function updateClock() {
    const now = new Date();

    const zoned = getZonedParts(now);
    const { year, month, day, hour: hh, minute: mm, second: ss } = zoned;

    timeEl.innerHTML = `${hh}:${mm}<span class="seconds">:${ss}</span>`;

    const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
        timeZone: getTimezone(),
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    dateEl.textContent = dateFormatter.format(now);

    const currentMinuteKey = `${year}-${month}-${day}-${hh}:${mm}`;

    if (currentMinuteKey !== lastCheckedMinute) {
        lastCheckedMinute = currentMinuteKey;
        checkAlarms(zoned);
    }
}

function checkAlarms(now) {
    if (activeAlarmId !== null) {
        return;
    }

    const currentTime = `${now.hour}:${now.minute}`;
    const currentDay = now.weekday;

    for (const alarm of alarms) {
        if (!alarm.enabled) {
            continue;
        }

        if (alarm.time !== currentTime) {
            continue;
        }

        const isRepeating = Array.isArray(alarm.days) && alarm.days.length > 0;

        if (isRepeating && !alarm.days.includes(currentDay)) {
            continue;
        }

        triggerAlarm(alarm);

        if (!isRepeating) {
            alarm.enabled = false;
            saveAlarms();
            renderAlarms();
        }

        break;
    }
}

function triggerAlarm(alarm) {
    activeAlarmId = alarm.id;

    ringTimeEl.textContent = alarm.time;
    ringLabelEl.textContent = alarm.label || "Будильник";
    ringingOverlay.classList.add("active");

    if (alarmSound) {
        alarmSound.currentTime = 0;
        const playPromise = alarmSound.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Браузер заблокировал автоматическое воспроизведение:", error);
            });
        }
    }

    if ("Notification" in window && Notification.permission === "granted") {
        try {
            new Notification("Будильник", {
                body: alarm.label || alarm.time
            });
        } catch (error) {
            console.warn("Не удалось показать уведомление:", error);
        }
    }
}

function stopAlarm() {
    activeAlarmId = null;
    ringingOverlay.classList.remove("active");

    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
}

function snoozeAlarm() {
    const alarm = alarms.find(alarm => alarm.id === activeAlarmId);

    if (!alarm) {
        stopAlarm();
        return;
    }

    stopAlarm();

    const snoozeTime = new Date(Date.now() + 5 * 60 * 1000);
    const snoozedParts = getZonedParts(snoozeTime);

    const snoozedAlarm = {
        id: createId(),
        time: `${snoozedParts.hour}:${snoozedParts.minute}`,
        label: `${alarm.label || "Будильник"} (отложен)`,
        days: [],
        enabled: true
    };

    alarms.push(snoozedAlarm);
    saveAlarms();
    renderAlarms();
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function renderAlarms() {
    alarmsListEl.innerHTML = "";

    if (alarms.length === 0) {
        alarmsListEl.innerHTML = `
            <div class="empty-state">
                Пока нет будильников — добавьте первый выше
            </div>
        `;
        return;
    }

    const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

    for (const alarm of sorted) {
        const item = document.createElement("div");
        item.className = "alarm-item" + (alarm.enabled ? "" : " disabled");

        const daysLabel = formatDays(alarm.days);

        item.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time">${escapeHtml(alarm.time)}</div>
                <div class="alarm-meta">
                    ${escapeHtml(alarm.label || "Будильник")}
                    ${daysLabel ? " · " + escapeHtml(daysLabel) : ""}
                </div>
            </div>
            <div class="alarm-controls">
                <label class="switch">
                    <input type="checkbox" ${alarm.enabled ? "checked" : ""} data-id="${escapeHtml(alarm.id)}" class="toggle-input">
                    <span class="slider"></span>
                </label>
                <button type="button" class="delete-btn" data-id="${escapeHtml(alarm.id)}">✕</button>
            </div>
        `;

        alarmsListEl.appendChild(item);
    }

    alarmsListEl.querySelectorAll(".toggle-input").forEach(input => {
        input.addEventListener("change", event => {
            const alarm = alarms.find(item => item.id === event.target.dataset.id);

            if (!alarm) {
                return;
            }

            alarm.enabled = event.target.checked;
            saveAlarms();
            renderAlarms();
        });
    });

    alarmsListEl.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", event => {
            const id = event.currentTarget.dataset.id;
            alarms = alarms.filter(alarm => alarm.id !== id);

            if (activeAlarmId === id) {
                stopAlarm();
            }

            saveAlarms();
            renderAlarms();
        });
    });
}

function formatDays(days) {
    if (!Array.isArray(days) || days.length === 0) {
        return "";
    }

    if (days.length === 7) {
        return "Ежедневно";
    }

    const names = {
        0: "Вс",
        1: "Пн",
        2: "Вт",
        3: "Ср",
        4: "Чт",
        5: "Пт",
        6: "Сб"
    };

    const order = [1, 2, 3, 4, 5, 6, 0];

    return order.filter(day => days.includes(day)).map(day => names[day]).join(", ");
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

daysSelect.addEventListener("click", event => {
    const button = event.target.closest(".day-btn");

    if (!button) {
        return;
    }

    const day = Number(button.getAttribute("data-day"));

    if (selectedDays.has(day)) {
        selectedDays.delete(day);
        button.classList.remove("active");
    } else {
        selectedDays.add(day);
        button.classList.add("active");
    }
});

alarmForm.addEventListener("submit", event => {
    event.preventDefault();

    const time = alarmTimeInput.value;

    if (!time) {
        return;
    }

    alarms.push({
        id: createId(),
        time,
        label: alarmLabelInput.value.trim(),
        days: Array.from(selectedDays).sort((a, b) => a - b),
        enabled: true
    });

    saveAlarms();
    renderAlarms();
    alarmForm.reset();
    selectedDays.clear();

    daysSelect.querySelectorAll(".day-btn").forEach(button => {
        button.classList.remove("active");
    });

    requestNotificationPermission();
});

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission === "default") {
        Notification.requestPermission().catch(error => {
            console.warn("Не удалось запросить разрешение:", error);
        });
    }
}

stopBtn.addEventListener("click", stopAlarm);
snoozeBtn.addEventListener("click", snoozeAlarm);

profileButton.addEventListener("click", () => {
    const isOpen = !profileMenu.hidden;

    profileMenu.hidden = isOpen;
    profileButton.setAttribute("aria-expanded", String(!isOpen));
});

document.addEventListener("click", event => {
    if (!profile.contains(event.target)) {
        profileMenu.hidden = true;
        profileButton.setAttribute("aria-expanded", "false");
    }
});

timezoneCountry.addEventListener("change", () => {
    renderTimezoneCities();
    writeStorage(TIMEZONE_STORAGE_KEY, timezoneCity.value);
    writeStorage(TIMEZONE_COUNTRY_STORAGE_KEY, timezoneCountry.value);
    updateProfileLocation();
    lastCheckedMinute = null;
    updateClock();
});

timezoneCity.addEventListener("change", () => {
    writeStorage(TIMEZONE_STORAGE_KEY, timezoneCity.value);
    writeStorage(TIMEZONE_COUNTRY_STORAGE_KEY, timezoneCountry.value);
    updateProfileLocation();
    lastCheckedMinute = null;
    updateClock();
});

renderAlarms();
updateClock();
setInterval(updateClock, 1000);
