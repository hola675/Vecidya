import assert from "node:assert/strict";
import { test } from "node:test";

import { ANALYTICS_QUEUE_FLUSH_INTERVAL_MS, ANALYTICS_QUEUE_FLUSH_SIZE, ANALYTICS_QUEUE_MAX_PENDING, AnalyticsEventQueue } from "../../../app/features/diagnostic/analytics-queue.ts";

function makeQueue(overrides: Partial<{ nextId: () => string }> = {}) {
  let counter = 0;
  return new AnalyticsEventQueue({ generateId: overrides.nextId ?? (() => `event-${counter++}`) });
}

test("enqueue assigns a generated eventUuid and never mutates the caller's input", () => {
  const queue = makeQueue();
  const input = { eventType: "QUESTION_SHOWN" as const, questionId: "profile" as const, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: 1, questionsAnswered: 0, applicableQuestions: 5 };
  queue.enqueue(input);
  const drained = queue.drain(50);
  assert.equal(drained.length, 1);
  assert.equal(drained[0].eventType, "QUESTION_SHOWN");
  assert.equal(typeof drained[0].eventUuid, "string");
  assert.equal("eventUuid" in input, false);
});

test("shouldFlush is true once the size threshold is reached", () => {
  const queue = makeQueue();
  for (let index = 0; index < ANALYTICS_QUEUE_FLUSH_SIZE; index += 1) {
    queue.enqueue({ eventType: "QUESTION_SHOWN", questionId: null, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  }
  assert.equal(queue.shouldFlush(0), true);
});

test("shouldFlush is true once the interval has elapsed, even with one event", () => {
  const queue = makeQueue();
  queue.enqueue({ eventType: "SECTION_ENTERED", questionId: null, sectionId: "contexto", answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  assert.equal(queue.shouldFlush(ANALYTICS_QUEUE_FLUSH_INTERVAL_MS), true);
});

test("shouldFlush is false with one event and no elapsed time", () => {
  const queue = makeQueue();
  queue.enqueue({ eventType: "SECTION_ENTERED", questionId: null, sectionId: "contexto", answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  assert.equal(queue.shouldFlush(0), false);
});

test("drain never returns more than MAX_ANALYTICS_EVENTS_PER_BATCH events and keeps the remainder pending", () => {
  const queue = makeQueue();
  for (let index = 0; index < 30; index += 1) {
    queue.enqueue({ eventType: "QUESTION_SHOWN", questionId: null, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  }
  const first = queue.drain(25);
  assert.equal(first.length, 25);
  const second = queue.drain(25);
  assert.equal(second.length, 5);
});

test("requeue puts failed events back at the front for the next flush attempt", () => {
  const queue = makeQueue();
  queue.enqueue({ eventType: "QUESTION_SHOWN", questionId: null, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  const drained = queue.drain(25);
  queue.requeue(drained);
  assert.equal(queue.size(), 1);
});

test("the queue caps total pending events and drops the oldest ones under sustained failure (spec §30/§65)", () => {
  const queue = makeQueue();
  for (let index = 0; index < ANALYTICS_QUEUE_MAX_PENDING + 10; index += 1) {
    queue.enqueue({ eventType: "QUESTION_SHOWN", questionId: null, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  }
  assert.equal(queue.size(), ANALYTICS_QUEUE_MAX_PENDING);
});

test("size() reflects pending events accurately after enqueue/drain", () => {
  const queue = makeQueue();
  assert.equal(queue.size(), 0);
  queue.enqueue({ eventType: "QUESTION_SHOWN", questionId: null, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  assert.equal(queue.size(), 1);
  queue.drain(25);
  assert.equal(queue.size(), 0);
});

test("requeue-induced overflow drops oldest (requeued) events, not newest (fresh enqueued) ones (spec §30/§65)", () => {
  let idCounter = 0;
  const queue = new AnalyticsEventQueue({ generateId: () => `event-${idCounter++}` });

  // Fill queue: 160 events (event-0 through event-159)
  for (let index = 0; index < 160; index += 1) {
    queue.enqueue({ eventType: "QUESTION_SHOWN", questionId: null, sectionId: null, answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  }
  assert.equal(queue.size(), 160);

  // Drain 80 events (event-0 through event-79) to simulate a failed flush
  const drained = queue.drain(80);
  assert.equal(drained.length, 80);
  assert.equal(queue.size(), 80);
  const drainedIds = new Set(drained.map(e => e.eventUuid));

  // Enqueue 100 new fresh events while the failed batch is in-flight
  // Total will be 80 (old) + 100 (new) = 180, still under cap
  for (let index = 0; index < 100; index += 1) {
    queue.enqueue({ eventType: "SECTION_ENTERED", questionId: null, sectionId: "contexto", answerKind: null, routeSignature: null, questionsSeen: null, questionsAnswered: null, applicableQuestions: null });
  }
  assert.equal(queue.size(), 180); // 80 old + 100 new

  // Requeue the failed batch: unshift 80 events at the front, pushing total to 260
  // After overflow trim to 200 (60 removed from front), we verify old requeued events are dropped
  queue.requeue(drained);
  assert.equal(queue.size(), ANALYTICS_QUEUE_MAX_PENDING);

  // Verify the OLDEST requeued events were dropped, but fresh ones remain
  // This is the critical check: under the wrong implementation (using .length = cap),
  // fresh events would be dropped from the end. Under the correct implementation (using splice from front),
  // oldest (requeued) events are dropped.
  const remaining = queue.drain(ANALYTICS_QUEUE_MAX_PENDING);
  const remainingIds = new Set(remaining.map(e => e.eventUuid));

  // The oldest 60 requeued events (event-0 through event-59) should be gone
  for (let i = 0; i < 60; i += 1) {
    assert.equal(remainingIds.has(`event-${i}`), false, `event-${i} should have been dropped during requeue overflow`);
  }

  // But the newest 20 requeued events (event-60 through event-79) should still be there
  for (let i = 60; i < 80; i += 1) {
    assert.equal(remainingIds.has(`event-${i}`), true, `event-${i} should remain after requeue overflow`);
  }

  // And all fresh events (event-160 through event-259) should definitely still be there
  for (let i = 160; i < 260; i += 1) {
    assert.equal(remainingIds.has(`event-${i}`), true, `event-${i} (fresh) should remain after requeue overflow`);
  }
});
