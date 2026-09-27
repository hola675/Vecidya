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
