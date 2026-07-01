import { NextResponse } from "next/server";

export const preReviewBoundary = {
  mode: "pre_review_only",
  blockerCode: "GATES_NOT_PASSED",
  disbursementAllowed: false,
} as const;

export type ChainTraceBoundary = typeof preReviewBoundary;

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  boundary: ChainTraceBoundary;
};

export type ApiFailure = {
  ok: false;
  error: string;
  message: string;
  boundary: ChainTraceBoundary;
};

function topLevelData(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({
    ok: true,
    data,
    boundary: preReviewBoundary,
    ...topLevelData(data),
  }, init);
}

export function apiError(error: string, message: string, init?: ResponseInit) {
  return NextResponse.json<ApiFailure>({ ok: false, error, message, boundary: preReviewBoundary }, init);
}

export function apiUnknownError(error: unknown, fallbackMessage: string, init: ResponseInit = { status: 500 }) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return apiError("INTERNAL_ERROR", message || fallbackMessage, init);
}
