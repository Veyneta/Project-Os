const form = document.querySelector("#scheduler-form");
const processList = document.querySelector("#process-list");
const processCount = document.querySelector("#process-count");
const errorMessage = document.querySelector("#error-message");
const quantum = document.querySelector("#quantum");
const emptyResult = document.querySelector("#empty-result");
const previewContent = document.querySelector("#preview-content");
const resultsContent = document.querySelector("#results-content");
const resultsStatus = document.querySelector("#results-status");
const ganttChart = document.querySelector("#gantt-chart");
const comparisonContent = document.querySelector("#comparison-content");
const bestAlgorithm = document.querySelector("#best-algorithm");
const guideDialog = document.querySelector("#guide-dialog");

const colors = ["#4c8dff", "#13c797", "#f3a400", "#c77dff", "#ff687d"];
let processes = [
  { id: "P1", arrivalTime: 0, burstTime: 5 },
  { id: "P2", arrivalTime: 0, burstTime: 3 },
  { id: "P3", arrivalTime: 0, burstTime: 8 }
];

function selectedAlgorithm() {
  return document.querySelector('input[name="algorithm"]:checked').value;
}

function renderProcesses() {
  processCount.textContent = `${processes.length} / 10`;
  processList.replaceChildren(...processes.map((process, index) => {
    const row = document.createElement("div");
    row.className = "process-row";
    row.innerHTML = `
      <span class="process-name"><i class="dot" style="background:${colors[index % colors.length]}"></i>${process.id}</span>
      <input class="arrival-input" type="number" min="0" step="1" value="${process.arrivalTime}" aria-label="${process.id} Arrival Time">
      <input class="burst-input" type="number" min="1" step="1" value="${process.burstTime}" aria-label="${process.id} Burst Time">
    `;
    row.querySelector(".arrival-input").addEventListener("input", (event) => {
      processes[index].arrivalTime = Number(event.target.value);
    });
    row.querySelector(".burst-input").addEventListener("input", (event) => {
      processes[index].burstTime = Number(event.target.value);
    });
    return row;
  }));
}

function updateAlgorithmCards() {
  document.querySelectorAll(".algorithm-card").forEach((card) => {
    const isSelected = card.querySelector("input").checked;
    card.classList.toggle("selected", isSelected);
    card.querySelector(".check")?.remove();
    if (isSelected) {
      const check = document.createElement("span");
      check.className = "check";
      check.textContent = "✓";
      card.append(check);
    }
  });
}

function renderResults(result) {
  const rows = result.processes;
  const order = result.executionOrder || rows.map((process) => process.id);
  const safe = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
  const table = `
    <div class="result-meta">Execution order: <strong>${order.map(safe).join(" → ")}</strong> · Average WT: <strong class="avg">${result.AVG_WT.toFixed(2)}</strong></div>
    <div class="table-wrap">
      <table class="results-table">
        <thead><tr><th>โปรเซส</th><th>AT</th><th>BT</th><th>ST</th><th>CT</th><th>TAT</th><th>WT</th></tr></thead>
        <tbody>${rows.map((process) => `
          <tr><td>${safe(process.id)}</td><td>${process.arrivalTime}</td><td>${process.burstTime}</td><td>${process.ST}</td><td>${process.CT}</td><td>${process.TAT}</td><td class="avg">${process.WT}</td></tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
  resultsContent.innerHTML = table;
  resultsStatus.textContent = `${result.algorithm} · AVG WT ${result.AVG_WT.toFixed(2)}`;
  renderGantt(result);
  emptyResult.classList.add("hidden");
  previewContent.classList.remove("hidden");
  previewContent.innerHTML = `<div class="preview-summary"><span>${safe(result.algorithm)}</span><strong>AVG WT ${result.AVG_WT.toFixed(2)}</strong><small>${order.map(safe).join(" → ")}</small></div>`;
}

function renderGantt(result) {
  const timeline = result.timeline || [];
  if (timeline.length === 0) {
    ganttChart.textContent = "ไม่พบช่วงเวลาการทำงาน";
    return;
  }
  ganttChart.classList.remove("gantt-empty");
  const totalTime = Math.max(...timeline.map((item) => item.end), 1);
  const segments = [];
  let cursor = 0;
  timeline.forEach((item, index) => {
    if (item.start > cursor) {
      segments.push({ id: "Idle", start: cursor, end: item.start, idle: true });
    }
    segments.push({ ...item, colorIndex: index });
    cursor = item.end;
  });
  const tickStep = totalTime <= 20 ? 1 : Math.ceil(totalTime / 20);
  const ticks = [];
  for (let time = 0; time <= totalTime; time += tickStep) ticks.push(time);
  if (ticks[ticks.length - 1] !== totalTime) ticks.push(totalTime);
  const pixelsPerUnit = totalTime <= 20 ? 42 : 32;
  const timelineWidth = totalTime * pixelsPerUnit;
  ganttChart.innerHTML = `
    <div class="gantt-label">CPU timeline</div>
    <div class="gantt-navigation">
      <button type="button" class="gantt-nav-button gantt-left" aria-label="เลื่อน Gantt Chart ไปทางซ้าย">‹</button>
      <div class="gantt-scroll" tabindex="0" aria-label="Gantt Chart เลื่อนซ้ายขวา">
      <div class="gantt-track" style="width:${timelineWidth}px">${segments.map((item) => `
        <div class="gantt-block ${item.id === "Idle" ? "gantt-idle" : ""}" style="width:${(item.end - item.start) * pixelsPerUnit}px;background:${item.id === "Idle" ? "" : colors[item.colorIndex % colors.length]}" title="${item.id}: ${item.start} - ${item.end}">
          <strong>${item.id}</strong><small>${item.start}–${item.end}</small>
        </div>
      `).join("")}</div>
      <div class="gantt-scale" style="width:${timelineWidth}px">${ticks.map((time) => `<span style="left:${time * pixelsPerUnit}px">${time}</span>`).join("")}</div>
      </div>
      <button type="button" class="gantt-nav-button gantt-right" aria-label="เลื่อน Gantt Chart ไปทางขวา">›</button>
    </div>
  `;
  const scrollContainer = ganttChart.querySelector(".gantt-scroll");
  ganttChart.querySelector(".gantt-left").addEventListener("click", () => {
    scrollContainer.scrollBy({ left: -320, behavior: "smooth" });
  });
  ganttChart.querySelector(".gantt-right").addEventListener("click", () => {
    scrollContainer.scrollBy({ left: 320, behavior: "smooth" });
  });
  scrollContainer.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      scrollContainer.scrollLeft += event.deltaY;
    }
  }, { passive: false });
}

function renderComparison(results) {
  const best = results.reduce((winner, result) => result.AVG_WT < winner.AVG_WT ? result : winner);
  const maxAverage = Math.max(...results.map((result) => result.AVG_WT), 1);
  bestAlgorithm.textContent = `ดีที่สุด: ${best.algorithm}`;
  comparisonContent.innerHTML = `
    <div class="metric-chart" aria-label="กราฟเปรียบเทียบ Average Waiting Time">
      ${results.map((result) => `<div class="metric-bar-row"><span>${result.algorithm}</span><div class="metric-bar-track"><i style="width:${(result.AVG_WT / maxAverage) * 100}%"></i></div><strong>${result.AVG_WT.toFixed(2)}</strong></div>`).join("")}
    </div>
    <div class="table-wrap"><table class="results-table comparison-table">
      <thead><tr><th>Algorithm</th><th>Average WT</th><th>Average TAT</th><th>Execution order</th><th>สถานะ</th></tr></thead>
      <tbody>${results.map((result) => {
        const averageTAT = result.processes.reduce((sum, process) => sum + process.TAT, 0) / result.processes.length;
        const isBest = result === best;
        return `<tr class="${isBest ? "best-row" : ""}">
          <td>${result.algorithm}</td><td class="avg">${result.AVG_WT.toFixed(2)}</td>
          <td>${averageTAT.toFixed(2)}</td><td>${(result.executionOrder || result.processes.map((process) => process.id)).join(" → ")}</td>
          <td>${isBest ? "★ ดีที่สุด" : "เปรียบเทียบแล้ว"}</td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>
  `;
  return best;
}

function clearResults() {
  resultsContent.textContent = "ไม่สามารถคำนวณผลลัพธ์ได้";
  resultsStatus.textContent = "ยังไม่มีผลลัพธ์";
  ganttChart.textContent = "เริ่มจำลองเพื่อดู Gantt Chart";
  ganttChart.classList.add("gantt-empty");
  comparisonContent.textContent = "กด “เปรียบเทียบทั้งหมด” เพื่อดูผลลัพธ์";
  bestAlgorithm.textContent = "ยังไม่ได้เปรียบเทียบ";
  previewContent.replaceChildren();
  previewContent.classList.add("hidden");
  emptyResult.classList.remove("hidden");
}

function calculate() {
  errorMessage.textContent = "";
  try {
    const result = Scheduler.runScheduler(selectedAlgorithm(), processes, Number(quantum.value));
    renderResults(result);
  } catch (error) {
    errorMessage.textContent = error.message;
    clearResults();
  }
}

document.querySelectorAll('input[name="algorithm"]').forEach((input) => {
  input.addEventListener("change", updateAlgorithmCards);
});
document.querySelector("#add-process").addEventListener("click", () => {
  if (processes.length < 10) {
    processes.push({ id: `P${processes.length + 1}`, arrivalTime: 0, burstTime: 1 });
    renderProcesses();
  }
});
document.querySelector("#remove-process").addEventListener("click", () => {
  if (processes.length > 1) {
    processes.pop();
    renderProcesses();
  }
});
document.querySelector("#sort-burst").addEventListener("click", () => {
  processes = processes.map((process) => ({
    ...process,
    arrivalTime: Math.floor(Math.random() * 6),
    burstTime: Math.floor(Math.random() * 9) + 1
  }));
  renderProcesses();
});
document.querySelector("#compare-button").addEventListener("click", () => {
  try {
    const results = [
      Scheduler.fcfs(processes),
      Scheduler.sjf(processes),
      Scheduler.roundRobin(processes, Number(quantum.value))
    ];
    const best = renderComparison(results);
    renderResults(best);
    resultsStatus.textContent = `เปรียบเทียบแล้ว · ดีที่สุด ${best.algorithm}`;
    errorMessage.textContent = "";
  } catch (error) {
    errorMessage.textContent = error.message;
    clearResults();
  }
});
document.querySelector("#guide-button").addEventListener("click", () => guideDialog.showModal());
document.querySelector("#footer-guide-button").addEventListener("click", (event) => {
  event.preventDefault();
  guideDialog.showModal();
});
document.querySelector("#close-guide").addEventListener("click", () => guideDialog.close());
document.querySelector("#guide-start").addEventListener("click", () => guideDialog.close());
guideDialog.addEventListener("click", (event) => {
  if (event.target === guideDialog) guideDialog.close();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

renderProcesses();
updateAlgorithmCards();
