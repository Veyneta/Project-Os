const assert = require("node:assert/strict");
const { fcfs, sjf, roundRobin } = require("./scheduler");

assert.throws(
  () => fcfs([]),
  /processes must contain at least one process/
);
assert.throws(
  () => fcfs([{ id: "P1", burstTime: 0 }]),
  /positive integer burstTime/
);
assert.throws(
  () => fcfs([{ id: "P1", burstTime: 1.5 }]),
  /positive integer burstTime/
);
assert.throws(
  () => roundRobin([{ id: "P1", burstTime: 1 }], 0),
  /positive integer/
);
assert.throws(
  () => roundRobin([{ id: "P1", burstTime: 1 }], 1.5),
  /positive integer/
);

const processes = [
  { id: "P1", burstTime: 5 },
  { id: "P2", burstTime: 3 },
  { id: "P3", burstTime: 8 }
];

const fcfsResult = fcfs(processes);
assert.deepEqual(
  fcfsResult.processes.map(({ id, ST, CT, TAT, WT }) => ({
    id, ST, CT, TAT, WT
  })),
  [
    { id: "P1", ST: 0, CT: 5, TAT: 5, WT: 0 },
    { id: "P2", ST: 5, CT: 8, TAT: 8, WT: 5 },
    { id: "P3", ST: 8, CT: 16, TAT: 16, WT: 8 }
  ]
);
assert.equal(fcfsResult.avgWT, 13 / 3);

const sjfResult = sjf(processes);
assert.deepEqual(sjfResult.processes.map((process) => process.id), ["P2", "P1", "P3"]);
assert.deepEqual(
  sjfResult.processes.map(({ ST, CT, WT }) => ({ ST, CT, WT })),
  [
    { ST: 0, CT: 3, WT: 0 },
    { ST: 3, CT: 8, WT: 3 },
    { ST: 8, CT: 16, WT: 8 }
  ]
);
assert.equal(sjfResult.avgWT, 11 / 3);

const rrResult = roundRobin(processes, 3);
assert.deepEqual(rrResult.executionOrder, ["P1", "P2", "P3", "P1", "P3", "P3"]);
assert.deepEqual(
  rrResult.processes
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(({ id, ST, CT, TAT, WT }) => ({ id, ST, CT, TAT, WT })),
  [
    { id: "P1", ST: 0, CT: 11, TAT: 11, WT: 6 },
    { id: "P2", ST: 3, CT: 6, TAT: 6, WT: 3 },
    { id: "P3", ST: 6, CT: 16, TAT: 16, WT: 8 }
  ]
);
assert.equal(rrResult.avgWT, 17 / 3);

console.log("scheduler tests passed");
