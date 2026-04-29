const STORAGE_KEY = "moneyRecords";
const REMINDER_KEY = "moneyReminderTime";
const BUDGET_KEY = "monthlyBudget";
const GUIDE_KEY = "hasSeenMoneyAppGuide";

const expenseModeButton = document.getElementById("expenseModeButton");
const incomeModeButton = document.getElementById("incomeModeButton");

const expenseForm = document.getElementById("expenseForm");
const incomeForm = document.getElementById("incomeForm");

const expenseAmountInput = document.getElementById("expenseAmount");
const expensePaymentMethodInput = document.getElementById("expensePaymentMethod");
const expenseDateInput = document.getElementById("expenseDate");
const expenseMemoInput = document.getElementById("expenseMemo");
const expenseCategoryButtons = document.getElementById("expenseCategoryButtons");

const incomeAmountInput = document.getElementById("incomeAmount");
const incomePaymentMethodInput = document.getElementById("incomePaymentMethod");
const incomeDateInput = document.getElementById("incomeDate");
const incomeMemoInput = document.getElementById("incomeMemo");
const incomeCategoryButtons = document.getElementById("incomeCategoryButtons");

const todayStatusTitle = document.getElementById("todayStatusTitle");
const todayStatusBadge = document.getElementById("todayStatusBadge");
const todayIncome = document.getElementById("todayIncome");
const todayExpense = document.getElementById("todayExpense");
const todayBalance = document.getElementById("todayBalance");
const lastAddedText = document.getElementById("lastAddedText");

const rangeIncome = document.getElementById("rangeIncome");
const rangeExpense = document.getElementById("rangeExpense");
const rangeBalance = document.getElementById("rangeBalance");
const rangeTabs = document.querySelectorAll(".range-tab");
const rangeDateText = document.getElementById("rangeDateText");

const customRangeBox = document.getElementById("customRangeBox");
const customStartDateInput = document.getElementById("customStartDate");
const customEndDateInput = document.getElementById("customEndDate");
const applyCustomRangeButton = document.getElementById("applyCustomRangeButton");
const customRangeStatus = document.getElementById("customRangeStatus");

const chartTypeTabs = document.querySelectorAll(".chart-type-tab");
const chartTitle = document.getElementById("chartTitle");
const chartDescription = document.getElementById("chartDescription");
const mainChartCanvas = document.getElementById("mainChart");
const chartEmptyText = document.getElementById("chartEmptyText");

const historyList = document.getElementById("historyList");
const clearAllButton = document.getElementById("clearAllButton");

const reminderTimeInput = document.getElementById("reminderTime");
const saveReminderButton = document.getElementById("saveReminderButton");
const testNotificationButton = document.getElementById("testNotificationButton");
const reminderStatus = document.getElementById("reminderStatus");

const monthlyBudgetInput = document.getElementById("monthlyBudget");
const saveBudgetButton = document.getElementById("saveBudgetButton");
const budgetAmount = document.getElementById("budgetAmount");
const monthExpense = document.getElementById("monthExpense");
const remainingBudget = document.getElementById("remainingBudget");
const budgetProgress = document.getElementById("budgetProgress");
const budgetMessage = document.getElementById("budgetMessage");

const exportCsvButton = document.getElementById("exportCsvButton");
const importCsvInput = document.getElementById("importCsvInput");
const exportJsonButton = document.getElementById("exportJsonButton");
const importJsonInput = document.getElementById("importJsonInput");
const dataStatus = document.getElementById("dataStatus");

const guideOverlay = document.getElementById("guideOverlay");
const closeGuideButton = document.getElementById("closeGuideButton");

let mainChart = null;
let reminderTimerId = null;
let selectedRange = "day";
let selectedChartType = "bar";
let selectedExpenseCategory = "食費";
let selectedIncomeCategory = "おこづかい";

const expenseCategories = [
  { name: "食費", icon: "🍙" },
  { name: "交通費", icon: "🚃" },
  { name: "遊び", icon: "🎮" },
  { name: "勉強", icon: "📚" },
  { name: "服", icon: "👕" },
  { name: "日用品", icon: "🧴" },
  { name: "プレゼント", icon: "🎁" },
  { name: "その他", icon: "📝" }
];

const incomeCategories = [
  { name: "おこづかい", icon: "💰" },
  { name: "バイト", icon: "💼" },
  { name: "お年玉", icon: "🧧" },
  { name: "その他", icon: "📝" }
];

expenseDateInput.value = getTodayDateString();
incomeDateInput.value = getTodayDateString();
customStartDateInput.value = getTodayDateString();
customEndDateInput.value = getTodayDateString();

setupGuide();
renderCategoryButtons();
loadReminderSetting();
loadBudgetSetting();
render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

expenseModeButton.addEventListener("click", () => {
  setInputMode("expense");
});

incomeModeButton.addEventListener("click", () => {
  setInputMode("income");
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(expenseAmountInput.value);

  if (!amount || amount <= 0) {
    alert("支出の金額を正しく入力してください");
    return;
  }

  const record = {
    id: crypto.randomUUID(),
    type: "expense",
    amount: amount,
    category: selectedExpenseCategory,
    paymentMethod: expensePaymentMethodInput.value,
    date: expenseDateInput.value,
    memo: expenseMemoInput.value.trim(),
    createdAt: new Date().toISOString()
  };

  addRecord(record);

  expenseForm.reset();
  expenseDateInput.value = getTodayDateString();
  selectedExpenseCategory = "食費";
  renderCategoryButtons();
  showLastAdded(record);
});

incomeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = Number(incomeAmountInput.value);

  if (!amount || amount <= 0) {
    alert("収入の金額を正しく入力してください");
    return;
  }

  const record = {
    id: crypto.randomUUID(),
    type: "income",
    amount: amount,
    category: selectedIncomeCategory,
    paymentMethod: incomePaymentMethodInput.value,
    date: incomeDateInput.value,
    memo: incomeMemoInput.value.trim(),
    createdAt: new Date().toISOString()
  };

  addRecord(record);

  incomeForm.reset();
  incomeDateInput.value = getTodayDateString();
  selectedIncomeCategory = "おこづかい";
  renderCategoryButtons();
  showLastAdded(record);
});

rangeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedRange = tab.dataset.range;

    rangeTabs.forEach((button) => {
      button.classList.remove("active");
    });

    tab.classList.add("active");

    if (selectedRange === "custom") {
      customRangeBox.classList.remove("hidden");
      updateCustomRangeStatus();
    } else {
      customRangeBox.classList.add("hidden");
    }

    renderRangeSummary();
    renderMainChart();
  });
});

applyCustomRangeButton.addEventListener("click", () => {
  if (!isCustomRangeValid()) {
    return;
  }

  updateCustomRangeStatus();
  renderRangeSummary();
  renderMainChart();
});

customStartDateInput.addEventListener("change", () => {
  if (selectedRange === "custom") {
    updateCustomRangeStatus();
    renderRangeSummary();
    renderMainChart();
  }
});

customEndDateInput.addEventListener("change", () => {
  if (selectedRange === "custom") {
    updateCustomRangeStatus();
    renderRangeSummary();
    renderMainChart();
  }
});

chartTypeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedChartType = tab.dataset.chartType;

    chartTypeTabs.forEach((button) => {
      button.classList.remove("active");
    });

    tab.classList.add("active");

    renderMainChart();
  });
});

clearAllButton.addEventListener("click", () => {
  const ok = confirm("本当にすべての記録を削除しますか？");

  if (!ok) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  render();
});

saveBudgetButton.addEventListener("click", () => {
  const budget = Number(monthlyBudgetInput.value);

  if (budget < 0 || Number.isNaN(budget)) {
    alert("予算を正しく入力してください");
    return;
  }

  localStorage.setItem(BUDGET_KEY, String(budget));
  renderBudget();
});

saveReminderButton.addEventListener("click", async () => {
  const time = reminderTimeInput.value;

  if (!time) {
    alert("通知する時間を選んでください");
    return;
  }

  const permissionResult = await requestNotificationPermission();

  if (!permissionResult) {
    reminderStatus.textContent = "通知が許可されていないため、ブラウザ設定を確認してください。";
    return;
  }

  localStorage.setItem(REMINDER_KEY, time);
  scheduleDailyReminder(time);

  reminderStatus.textContent = `毎日 ${time} に通知する設定にしました。`;
});

testNotificationButton.addEventListener("click", async () => {
  const permissionResult = await requestNotificationPermission();

  if (!permissionResult) {
    reminderStatus.textContent = "通知が許可されていないため、テスト通知を出せませんでした。";
    return;
  }

  showNotification(
    "おこづかいメモ",
    "今日使ったお金を記録しよう！"
  );
});

exportCsvButton.addEventListener("click", () => {
  exportCsv();
});

importCsvInput.addEventListener("change", (event) => {
  importCsv(event);
});

exportJsonButton.addEventListener("click", () => {
  exportJsonBackup();
});

importJsonInput.addEventListener("change", (event) => {
  importJsonBackup(event);
});

closeGuideButton.addEventListener("click", () => {
  localStorage.setItem(GUIDE_KEY, "true");
  guideOverlay.classList.remove("show");
});

function setupGuide() {
  const hasSeenGuide = localStorage.getItem(GUIDE_KEY);

  if (!hasSeenGuide) {
    guideOverlay.classList.add("show");
  }
}

function setInputMode(mode) {
  if (mode === "expense") {
    expenseModeButton.classList.add("active");
    incomeModeButton.classList.remove("active");

    expenseForm.classList.remove("hidden");
    incomeForm.classList.add("hidden");
    return;
  }

  incomeModeButton.classList.add("active");
  expenseModeButton.classList.remove("active");

  incomeForm.classList.remove("hidden");
  expenseForm.classList.add("hidden");
}

function renderCategoryButtons() {
  expenseCategoryButtons.innerHTML = "";
  incomeCategoryButtons.innerHTML = "";

  expenseCategories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";

    if (category.name === selectedExpenseCategory) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <span class="category-icon">${category.icon}</span>
      <span>${category.name}</span>
    `;

    button.addEventListener("click", () => {
      selectedExpenseCategory = category.name;
      renderCategoryButtons();
    });

    expenseCategoryButtons.appendChild(button);
  });

  incomeCategories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";

    if (category.name === selectedIncomeCategory) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <span class="category-icon">${category.icon}</span>
      <span>${category.name}</span>
    `;

    button.addEventListener("click", () => {
      selectedIncomeCategory = category.name;
      renderCategoryButtons();
    });

    incomeCategoryButtons.appendChild(button);
  });
}

function addRecord(record) {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
  render();
}

function showLastAdded(record) {
  const typeText = record.type === "income" ? "収入" : "支出";
  const sign = record.type === "income" ? "+" : "-";

  lastAddedText.textContent = `${typeText}を追加しました：${record.category} ${sign}${formatYen(record.amount)}`;
  lastAddedText.classList.add("show");

  setTimeout(() => {
    lastAddedText.classList.remove("show");
  }, 3500);
}

function getRecords() {
  const json = localStorage.getItem(STORAGE_KEY);

  if (!json) {
    return [];
  }

  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function render() {
  renderTodayStatus();
  renderRangeSummary();
  renderBudget();
  renderHistory();
  renderMainChart();
}

function renderTodayStatus() {
  const records = getRecords();
  const todayRecords = filterToday(records);

  const incomeTotal = calculateIncome(todayRecords);
  const expenseTotal = calculateExpense(todayRecords);
  const balance = incomeTotal - expenseTotal;

  todayIncome.textContent = formatYen(incomeTotal);
  todayExpense.textContent = formatYen(expenseTotal);
  todayBalance.textContent = formatYen(balance);

  todayIncome.className = "income";
  todayExpense.className = "expense";

  todayBalance.classList.remove("income", "expense");

  if (balance > 0) {
    todayBalance.classList.add("income");
  }

  if (balance < 0) {
    todayBalance.classList.add("expense");
  }

  todayStatusBadge.classList.remove("done");

  if (todayRecords.length > 0) {
    todayStatusTitle.textContent = "今日は記録できています";
    todayStatusBadge.textContent = `${todayRecords.length}件`;
    todayStatusBadge.classList.add("done");
    return;
  }

  todayStatusTitle.textContent = "今日はまだ記録がありません";
  todayStatusBadge.textContent = "未記録";
}

function renderRangeSummary() {
  const records = getRecords();
  const filteredRecords = filterRecordsByRange(records, selectedRange);

  const incomeTotal = calculateIncome(filteredRecords);
  const expenseTotal = calculateExpense(filteredRecords);
  const balance = incomeTotal - expenseTotal;

  rangeIncome.textContent = formatYen(incomeTotal);
  rangeExpense.textContent = formatYen(expenseTotal);
  rangeBalance.textContent = formatYen(balance);

  rangeDateText.textContent = getRangeDateText();

  rangeBalance.classList.remove("income", "expense");

  if (balance > 0) {
    rangeBalance.classList.add("income");
  }

  if (balance < 0) {
    rangeBalance.classList.add("expense");
  }
}

function renderBudget() {
  const records = getRecords();
  const monthRecords = filterThisMonth(records);

  const budget = getMonthlyBudget();
  const expense = calculateExpense(monthRecords);
  const remaining = budget - expense;

  monthlyBudgetInput.value = budget > 0 ? budget : "";

  budgetAmount.textContent = formatYen(budget);
  monthExpense.textContent = formatYen(expense);
  remainingBudget.textContent = formatYen(remaining);

  remainingBudget.classList.remove("income", "expense");

  if (remaining >= 0) {
    remainingBudget.classList.add("income");
  } else {
    remainingBudget.classList.add("expense");
  }

  budgetProgress.classList.remove("warning", "danger");

  if (budget <= 0) {
    budgetProgress.style.width = "0%";
    budgetMessage.textContent = "今月の予算を設定すると、残り金額が見れます。";
    return;
  }

  const percent = Math.min((expense / budget) * 100, 100);

  budgetProgress.style.width = `${percent}%`;

  if (percent >= 100) {
    budgetProgress.classList.add("danger");
    budgetMessage.textContent = "予算を超えています。使いすぎに注意。";
    return;
  }

  if (percent >= 80) {
    budgetProgress.classList.add("warning");
    budgetMessage.textContent = "予算の80%以上を使っています。";
    return;
  }

  budgetMessage.textContent = "今月の予算内におさまっています。";
}

function renderHistory() {
  const records = getRecords();

  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
  });

  historyList.innerHTML = "";

  if (sortedRecords.length === 0) {
    historyList.innerHTML = `<p class="small-text">まだ記録がありません。</p>`;
    return;
  }

  sortedRecords.forEach((record) => {
    const card = document.createElement("div");
    const amountClass = record.type === "income" ? "income" : "expense";
    const borderClass = record.type === "income" ? "income-border" : "expense-border";
    const sign = record.type === "income" ? "+" : "-";
    const typeText = record.type === "income" ? "収入" : "支出";

    card.className = `history-card ${borderClass}`;

    card.innerHTML = `
      <div class="history-card-top">
        <div>
          <div class="history-category">
            ${getCategoryIcon(record.category)} ${escapeHtml(record.category)}
          </div>

          <div class="history-memo">
            ${record.memo ? escapeHtml(record.memo) : "メモなし"}
          </div>
        </div>

        <div class="history-amount ${amountClass}">
          ${sign}${formatYen(record.amount)}
        </div>
      </div>

      <div class="history-card-bottom">
        <div class="history-meta">
          ${escapeHtml(record.date)} ・ ${typeText} ・ ${escapeHtml(record.paymentMethod)}
        </div>

        <button class="delete-button" data-id="${record.id}">
          削除
        </button>
      </div>
    `;

    historyList.appendChild(card);
  });

  const deleteButtons = document.querySelectorAll(".delete-button");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      deleteRecord(button.dataset.id);
    });
  });
}

function renderMainChart() {
  const records = getRecords();
  const filteredRecords = filterRecordsByRange(records, selectedRange);

  if (mainChart) {
    mainChart.destroy();
  }

  if (selectedChartType === "bar") {
    renderBarChart(filteredRecords);
    return;
  }

  renderPieChart(filteredRecords);
}

function renderBarChart(records) {
  const incomeTotal = calculateIncome(records);
  const expenseTotal = calculateExpense(records);

  chartTitle.textContent = "収入と支出の比較";
  chartDescription.textContent = getChartDescription("bar");
  chartEmptyText.textContent = "";

  mainChart = new Chart(mainChartCanvas, {
    type: "bar",
    data: {
      labels: ["収入", "支出"],
      datasets: [
        {
          label: "金額",
          data: [incomeTotal, expenseTotal],
          backgroundColor: ["#16a34a", "#dc2626"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderPieChart(records) {
  const expenseRecords = records.filter((record) => {
    return record.type === "expense";
  });

  const categoryTotals = {};

  expenseRecords.forEach((record) => {
    if (!categoryTotals[record.category]) {
      categoryTotals[record.category] = 0;
    }

    categoryTotals[record.category] += Number(record.amount);
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  chartTitle.textContent = "カテゴリー別支出";
  chartDescription.textContent = getChartDescription("pie");

  if (labels.length === 0) {
    chartEmptyText.textContent = "この期間の支出データがありません。";

    mainChart = new Chart(mainChartCanvas, {
      type: "doughnut",
      data: {
        labels: ["データなし"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e5e7eb"]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return;
  }

  chartEmptyText.textContent = "";

  mainChart = new Chart(mainChartCanvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "カテゴリー別支出",
          data: values
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function getChartDescription(chartType) {
  const rangeLabel = getRangeLabel();

  if (chartType === "bar") {
    return `${rangeLabel}の収入・支出を棒グラフで表示します。`;
  }

  return `${rangeLabel}のカテゴリー別支出を円グラフで表示します。`;
}

function getRangeLabel() {
  if (selectedRange === "day") {
    return "今日";
  }

  if (selectedRange === "week") {
    return "今週";
  }

  if (selectedRange === "month") {
    return "今月";
  }

  if (selectedRange === "custom") {
    return `${customStartDateInput.value} 〜 ${customEndDateInput.value}`;
  }

  return "選択中の期間";
}

function getRangeDateText() {
  const range = getCurrentRangeDates();

  return `表示期間：${formatDisplayDate(range.start)} 〜 ${formatDisplayDate(range.end)}`;
}

function getCurrentRangeDates() {
  const today = new Date();

  if (selectedRange === "day") {
    const start = new Date(today);
    const end = new Date(today);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
      start,
      end
    };
  }

  if (selectedRange === "week") {
    return {
      start: getStartOfWeek(today),
      end: getEndOfWeek(today)
    };
  }

  if (selectedRange === "month") {
    return {
      start: getStartOfMonth(today),
      end: getEndOfMonth(today)
    };
  }

  if (selectedRange === "custom" && isCustomRangeValid(false)) {
    return {
      start: new Date(`${customStartDateInput.value}T00:00:00`),
      end: new Date(`${customEndDateInput.value}T23:59:59`)
    };
  }

  const fallback = new Date(today);
  fallback.setHours(0, 0, 0, 0);

  return {
    start: fallback,
    end: fallback
  };
}

function deleteRecord(id) {
  const records = getRecords();
  const nextRecords = records.filter((record) => record.id !== id);

  saveRecords(nextRecords);
  render();
}

function calculateIncome(records) {
  return records
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + Number(record.amount), 0);
}

function calculateExpense(records) {
  return records
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + Number(record.amount), 0);
}

function filterRecordsByRange(records, range) {
  if (range === "day") {
    return filterToday(records);
  }

  if (range === "week") {
    return filterThisWeek(records);
  }

  if (range === "month") {
    return filterThisMonth(records);
  }

  if (range === "custom") {
    return filterCustomRange(records);
  }

  return records;
}

function filterToday(records) {
  const today = getTodayDateString();

  return records.filter((record) => record.date === today);
}

function filterThisWeek(records) {
  const today = new Date();
  const start = getStartOfWeek(today);
  const end = getEndOfWeek(today);

  return records.filter((record) => {
    const date = new Date(`${record.date}T00:00:00`);
    return date >= start && date <= end;
  });
}

function filterThisMonth(records) {
  const today = new Date();
  const start = getStartOfMonth(today);
  const end = getEndOfMonth(today);

  return records.filter((record) => {
    const date = new Date(`${record.date}T00:00:00`);
    return date >= start && date <= end;
  });
}

function filterCustomRange(records) {
  if (!isCustomRangeValid(false)) {
    return [];
  }

  const start = new Date(`${customStartDateInput.value}T00:00:00`);
  const end = new Date(`${customEndDateInput.value}T23:59:59`);

  return records.filter((record) => {
    const date = new Date(`${record.date}T00:00:00`);
    return date >= start && date <= end;
  });
}

function isCustomRangeValid(showAlert = true) {
  const startDate = customStartDateInput.value;
  const endDate = customEndDateInput.value;

  if (!startDate || !endDate) {
    if (showAlert) {
      alert("開始日と終了日を入力してください");
    }

    return false;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (start > end) {
    if (showAlert) {
      alert("開始日は終了日より前にしてください");
    }

    return false;
  }

  return true;
}

function updateCustomRangeStatus() {
  if (!customStartDateInput.value || !customEndDateInput.value) {
    customRangeStatus.textContent = "開始日と終了日を指定してください。";
    return;
  }

  if (!isCustomRangeValid(false)) {
    customRangeStatus.textContent = "開始日が終了日より後になっています。";
    return;
  }

  customRangeStatus.textContent = `${customStartDateInput.value} 〜 ${customEndDateInput.value} の記録を表示中です。`;
}

function getStartOfWeek(date) {
  const copiedDate = new Date(date);
  const day = copiedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copiedDate.setDate(copiedDate.getDate() + diff);
  copiedDate.setHours(0, 0, 0, 0);

  return copiedDate;
}

function getEndOfWeek(date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);

  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return end;
}

function getStartOfMonth(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getEndOfMonth(date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return end;
}

function getTodayDateString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function getMonthlyBudget() {
  const value = Number(localStorage.getItem(BUDGET_KEY));

  if (Number.isNaN(value)) {
    return 0;
  }

  return value;
}

function loadBudgetSetting() {
  const budget = getMonthlyBudget();

  if (budget > 0) {
    monthlyBudgetInput.value = budget;
  }
}

function exportCsv() {
  const records = getRecords();

  if (records.length === 0) {
    dataStatus.textContent = "CSVエクスポートできる記録がありません。";
    return;
  }

  const header = [
    "日付",
    "収支",
    "金額",
    "カテゴリー",
    "支払い方法",
    "メモ",
    "作成日時"
  ];

  const rows = records.map((record) => {
    return [
      record.date,
      record.type === "income" ? "収入" : "支出",
      record.amount,
      record.category,
      record.paymentMethod,
      record.memo,
      record.createdAt
    ];
  });

  const csvText = [
    header,
    ...rows
  ]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvText], {
    type: "text/csv;charset=utf-8"
  });

  const fileName = `okozukai-records-${getTodayDateString()}.csv`;

  downloadBlob(blob, fileName);

  dataStatus.textContent = "CSVをエクスポートしました。";
}

function importCsv(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const csvText = String(reader.result).replace(/^\uFEFF/, "");
      const rows = parseCsv(csvText);

      if (rows.length < 2) {
        dataStatus.textContent = "CSVに読み込めるデータがありません。";
        importCsvInput.value = "";
        return;
      }

      const header = rows[0];
      const dataRows = rows.slice(1);

      const records = dataRows
        .map((row) => csvRowToRecord(header, row))
        .filter(isValidRecord);

      if (records.length === 0) {
        dataStatus.textContent = "読み込める記録がありませんでした。";
        importCsvInput.value = "";
        return;
      }

      const ok = confirm(
        `CSVから${records.length}件読み込みます。現在の記録に追加しますか？`
      );

      if (!ok) {
        importCsvInput.value = "";
        return;
      }

      const currentRecords = getRecords();
      const mergedRecords = [...currentRecords, ...records];

      saveRecords(mergedRecords);
      render();

      dataStatus.textContent = `CSVから${records.length}件インポートしました。`;
      importCsvInput.value = "";
    } catch {
      dataStatus.textContent = "CSVの読み込みに失敗しました。";
      importCsvInput.value = "";
    }
  };

  reader.readAsText(file);
}

function exportJsonBackup() {
  const backupData = {
    appName: "おこづかいメモ",
    version: 1,
    exportedAt: new Date().toISOString(),
    records: getRecords(),
    settings: {
      monthlyBudget: getMonthlyBudget(),
      reminderTime: localStorage.getItem(REMINDER_KEY) || ""
    }
  };

  const jsonText = JSON.stringify(backupData, null, 2);

  const blob = new Blob([jsonText], {
    type: "application/json;charset=utf-8"
  });

  const fileName = `okozukai-backup-${getTodayDateString()}.json`;

  downloadBlob(blob, fileName);

  dataStatus.textContent = "JSONをエクスポートしました。";
}

function importJsonBackup(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!data || !Array.isArray(data.records)) {
        dataStatus.textContent = "読み込めないJSONファイルです。";
        importJsonInput.value = "";
        return;
      }

      const ok = confirm(
        "現在の記録をJSONファイルの内容で置き換えます。よろしいですか？"
      );

      if (!ok) {
        importJsonInput.value = "";
        return;
      }

      const cleanRecords = data.records
        .filter(isValidRecord)
        .map((record) => {
          return {
            id: record.id || crypto.randomUUID(),
            type: record.type,
            amount: Number(record.amount),
            category: record.category,
            paymentMethod: record.paymentMethod,
            date: record.date,
            memo: record.memo || "",
            createdAt: record.createdAt || new Date().toISOString()
          };
        });

      saveRecords(cleanRecords);

      if (data.settings) {
        if (typeof data.settings.monthlyBudget === "number") {
          localStorage.setItem(BUDGET_KEY, String(data.settings.monthlyBudget));
        }

        if (typeof data.settings.reminderTime === "string") {
          localStorage.setItem(REMINDER_KEY, data.settings.reminderTime);
          reminderTimeInput.value = data.settings.reminderTime;

          if (data.settings.reminderTime) {
            scheduleDailyReminder(data.settings.reminderTime);
          }
        }
      }

      loadBudgetSetting();
      loadReminderSetting();
      render();

      dataStatus.textContent = "JSONをインポートしました。";
      importJsonInput.value = "";
    } catch {
      dataStatus.textContent = "JSONファイルの読み込みに失敗しました。";
      importJsonInput.value = "";
    }
  };

  reader.readAsText(file);
}

function csvRowToRecord(header, row) {
  const date = getCsvValue(header, row, "日付");
  const typeText = getCsvValue(header, row, "収支");
  const amount = Number(getCsvValue(header, row, "金額"));
  const category = getCsvValue(header, row, "カテゴリー");
  const paymentMethod = getCsvValue(header, row, "支払い方法");
  const memo = getCsvValue(header, row, "メモ");
  const createdAt = getCsvValue(header, row, "作成日時");

  const type = typeText === "収入" || typeText === "income" ? "income" : "expense";

  return {
    id: crypto.randomUUID(),
    type: type,
    amount: amount,
    category: category,
    paymentMethod: paymentMethod,
    date: date,
    memo: memo,
    createdAt: createdAt || new Date().toISOString()
  };
}

function getCsvValue(header, row, name) {
  const index = header.indexOf(name);

  if (index === -1) {
    return "";
  }

  return row[index] || "";
}

function parseCsv(csvText) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }

      currentRow.push(currentValue);

      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);

  if (currentRow.some((value) => value.trim() !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

function isValidRecord(record) {
  if (!record) {
    return false;
  }

  if (record.type !== "income" && record.type !== "expense") {
    return false;
  }

  if (!record.amount || Number(record.amount) <= 0) {
    return false;
  }

  if (!record.category || typeof record.category !== "string") {
    return false;
  }

  if (!record.paymentMethod || typeof record.paymentMethod !== "string") {
    return false;
  }

  if (!record.date || typeof record.date !== "string") {
    return false;
  }

  return true;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes("\n") ||
    text.includes('"')
  ) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

function getCategoryIcon(categoryName) {
  const allCategories = [...expenseCategories, ...incomeCategories];
  const found = allCategories.find((category) => category.name === categoryName);

  return found ? found.icon : "📝";
}

function formatYen(value) {
  return `${value.toLocaleString()}円`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("このブラウザは通知に対応していません。");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();

  return permission === "granted";
}

function showNotification(title, body) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration) {
      registration.showNotification(title, {
        body: body,
        icon: "icon.png",
        badge: "icon.png"
      });
    } else {
      new Notification(title, {
        body: body
      });
    }
  });
}

function loadReminderSetting() {
  const savedTime = localStorage.getItem(REMINDER_KEY);

  if (!savedTime) {
    reminderStatus.textContent = "まだ通知時間は設定されていません。";
    return;
  }

  reminderTimeInput.value = savedTime;
  reminderStatus.textContent = `毎日 ${savedTime} に通知する設定中です。`;
  scheduleDailyReminder(savedTime);
}

function scheduleDailyReminder(time) {
  if (reminderTimerId) {
    clearTimeout(reminderTimerId);
  }

  const delay = getDelayUntilNextTime(time);

  reminderTimerId = setTimeout(() => {
    showNotification(
      "おこづかいメモ",
      "今日使ったお金を記録しよう！"
    );

    scheduleDailyReminder(time);
  }, delay);
}

function getDelayUntilNextTime(time) {
  const [hour, minute] = time.split(":").map(Number);

  const now = new Date();
  const next = new Date();

  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}