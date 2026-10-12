/**
 * CPU scheduling algorithms.
 *
 * A process can be written as:
 *   { id: "P1", burstTime: 5, arrivalTime: 0 }
 *
 * `arrivalTime` is optional and defaults to 0. The returned process rows
 * contain ST (first start time), CT (completion time), TAT and WT.
 */

function getId(process, index) {
  return process.id ?? process.name ?? `P${index + 1}`;
}

function getBurstTime(process) {
  const burstTime = process.burstTime ?? process.bt;
  if (!Number.isInteger(burstTime) || burstTime <= 0) {
    throw new TypeError("Each process must have a positive integer burstTime.");
  }
  return burstTime;
}

function getArrivalTime(process) {
  const arrivalTime = process.arrivalTime ?? process.at ?? 0;
  if (!Number.isFinite(arrivalTime) || arrivalTime < 0) {
    throw new TypeError("Each process must have a non-negative arrivalTime.");
  }
  return arrivalTime;
}

function normalizeProcesses(processes) {
  if (!Array.isArray(processes)) {
    throw new TypeError("processes must be an array.");
  }
  if (processes.length === 0) {
    throw new RangeError("processes must contain at least one process.");
  }

  return processes.map((process, index) => ({
    ...process,
    id: getId(process, index),
    burstTime: getBurstTime(process),
    arrivalTime: getArrivalTime(process),
    originalIndex: index
  }));
}

/**
 * Calculates metrics for a completed schedule.
 *
 * The input must be in execution order and may provide `startTime` and
 * `completionTime`. If they are absent, the function schedules each row
 * consecutively, respecting arrivalTime.
 */
function calculateMetrics(processes) {
  const normalized = normalizeProcesses(processes);
  let currentTime = 0;

  const rows = normalized.map((process) => {
    const startTime = Number.isFinite(process.startTime)
      ? process.startTime
      : Math.max(currentTime, process.arrivalTime);
    const completionTime = Number.isFinite(process.completionTime)
      ? process.completionTime
      : startTime + process.burstTime;

    if (
      startTime < process.arrivalTime ||
      completionTime < startTime ||
      completionTime < startTime + process.burstTime
    ) {
      throw new RangeError(`Invalid schedule for process ${process.id}.`);
    }

    currentTime = completionTime;
    return {
      ...process,
      ST: startTime,
      CT: completionTime,
      TAT: completionTime - process.arrivalTime,
      WT: completionTime - process.arrivalTime - process.burstTime
    };
  });

  const avgWT = rows.length === 0
    ? 0
    : rows.reduce((sum, process) => sum + process.WT, 0) / rows.length;

  return { processes: rows, avgWT };
}

function result(algorithm, metrics, executionOrder) {
  return {
    algorithm,
    processes: metrics.processes.map(
      ({
        originalIndex,
        remainingTime,
        startTime,
        completionTime,
        ...process
      }) => process
    ),
    avgWT: metrics.avgWT,
    AVG_WT: metrics.avgWT,
    ...(executionOrder ? { executionOrder } : {})
  };
}

/**
 * First-Come, First-Served. The supplied process order is preserved.
 */
function fcfs(processes) {
  const normalized = normalizeProcesses(processes);
  const metrics = calculateMetrics(normalized);
  return result("FCFS", metrics);
}

/**
 * Non-preemptive Shortest Job First.
 *
 * Among processes that have arrived, the shortest burst is selected. Ties
 * retain the original input order.
 */
function sjf(processes) {
  const pending = normalizeProcesses(processes);
  const scheduled = [];
  let currentTime = 0;

  while (pending.length > 0) {
    const available = pending.filter(
      (process) => process.arrivalTime <= currentTime
    );

    if (available.length === 0) {
      currentTime = Math.min(...pending.map((process) => process.arrivalTime));
      continue;
    }

    available.sort(
      (a, b) => a.burstTime - b.burstTime || a.originalIndex - b.originalIndex
    );
    const next = available[0];
    pending.splice(pending.indexOf(next), 1);
    next.startTime = currentTime;
    next.completionTime = currentTime + next.burstTime;
    currentTime = next.completionTime;
    scheduled.push(next);
  }

  return result("SJF", calculateMetrics(scheduled));
}

/**
 * Preemptive time-sharing Round Robin.
 *
 * ST is the first time a process runs and CT is the time its final quantum
 * completes. `executionOrder` contains the process id for every time slice.
 */
function roundRobin(processes, quantum) {
  if (!Number.isInteger(quantum) || quantum <= 0) {
    throw new TypeError("quantum must be a positive integer.");
  }

  const pending = normalizeProcesses(processes).map((process) => ({
    ...process,
    remainingTime: process.burstTime,
    startTime: undefined,
    completionTime: undefined
  }));
  const ordered = [...pending].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.originalIndex - b.originalIndex
  );
  const queue = [];
  const executionOrder = [];
  let nextArrival = 0;
  let currentTime = 0;
  let completed = 0;

  const addArrivals = () => {
    while (
      nextArrival < ordered.length &&
      ordered[nextArrival].arrivalTime <= currentTime
    ) {
      queue.push(ordered[nextArrival]);
      nextArrival += 1;
    }
  };

  while (completed < pending.length) {
    addArrivals();
    if (queue.length === 0) {
      currentTime = ordered[nextArrival].arrivalTime;
      addArrivals();
    }

    const process = queue.shift();
    const slice = Math.min(quantum, process.remainingTime);
    if (process.startTime === undefined) {
      process.startTime = currentTime;
    }
    currentTime += slice;
    process.remainingTime -= slice;
    executionOrder.push(process.id);
    addArrivals();

    if (process.remainingTime > 0) {
      queue.push(process);
    } else {
      process.completionTime = currentTime;
      completed += 1;
    }
  }

  const metrics = calculateMetrics(pending);
  return result("Round Robin", metrics, executionOrder);
}

const Scheduler = { fcfs, sjf, roundRobin, calculateMetrics };

if (typeof module !== "undefined" && module.exports) {
  module.exports = Scheduler;
}

if (typeof window !== "undefined") {
  window.Scheduler = Scheduler;
}
