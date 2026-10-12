const form = document.querySelector("#scheduler-form");
const algorithmSelect = document.querySelector("#algorithm");
const quantumFields = document.querySelectorAll(".quantum-field");
const processList = document.querySelector("#process-list");
const errorMessage = document.querySelector("#error-message");
const resultBody = document.querySelector("#result-body");
const averageWT = document.querySelector("#average-wt");
const resultTitle = document.querySelector("#result-title");
const executionOrder = document.querySelector("#execution-order");

const defaultProcesses = [
  { id: "P1", arrivalTime: 0, burstTime: 5 },
  { id: "P2", arrivalTime: 0, burstTime: 3 },
  { id: "P3", arrivalTime: 0, burstTime: 8 }
];

function addProcessRow(process = { id: `P${processList.children.length + 1}`, arrivalTime: 0, burstTime: 1 }) {
  const row = document.createElement("div");
  row.className = "process-row";
  row.innerHTML = `
    <input class="process-id" aria-label="Process ID" value="${process.id}">
    <input class="arrival-time" aria-label="Arrival Time" type="number" min="0" step="1" value="${process.arrivalTime}">
    <input class="burst-time" aria-label="Burst Time" type="number" min="1" step="1" value="${process.burstTime}">
    <button type="button" class="button remove-button" aria-label="ลบโปรเซส">×</button>
  `;
  row.querySelector(".remove-button").addEventListener("click", () => {
    if (processList.children.length > 1) row.remove();
  });
  processList.append(row);
}

function setAlgorithmFields() {
  const isRoundRobin = algorithmSelect.value === "rr";
  quantumFields.forEach((field) => field.classList.toggle("is-hidden", !isRoundRobin));
}

function readProcesses() {
  return [...processList.children].map((row) => ({
    id: row.querySelector(".process-id").value.trim(),
    arrivalTime: Number(row.querySelector(".arrival-time").value),
    burstTime: Number(row.querySelector(".burst-time").value)
  }));
}

function calculate() {
  errorMessage.textContent = "";
  try {
    const processes = readProcesses();
    const algorithm = algorithmSelect.value;
    const result = algorithm === "fcfs"
      ? Scheduler.fcfs(processes)
      : algorithm === "sjf"
        ? Scheduler.sjf(processes)
        : Scheduler.roundRobin(processes, Number(document.querySelector("#quantum").value));

    resultTitle.textContent = `${result.algorithm} result`;
    averageWT.textContent = result.AVG_WT.toFixed(2);
    executionOrder.textContent = result.executionOrder
      ? result.executionOrder.join(" → ")
      : result.processes.map((process) => process.id).join(" → ");
    resultBody.replaceChildren(...result.processes.map((process) => {
      const row = document.createElement("tr");
      [process.id, process.arrivalTime, process.burstTime, process.ST, process.CT, process.TAT, process.WT]
        .forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        });
      return row;
    }));
  } catch (error) {
    errorMessage.textContent = error.message;
    resultBody.replaceChildren();
    averageWT.textContent = "-";
    executionOrder.textContent = "-";
  }
}

document.querySelector("#add-process").addEventListener("click", () => addProcessRow());
document.querySelector("#reset-button").addEventListener("click", () => {
  processList.replaceChildren();
  defaultProcesses.forEach(addProcessRow);
  algorithmSelect.value = "fcfs";
  document.querySelector("#quantum").value = 3;
  setAlgorithmFields();
  calculate();
});
algorithmSelect.addEventListener("change", setAlgorithmFields);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

defaultProcesses.forEach(addProcessRow);
setAlgorithmFields();
calculate();
