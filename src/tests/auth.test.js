import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";
import prisma from "../lib/prisma.js";

const server = app.listen(0);

async function request(path, options = {}) {
  const address = server.address();
  return fetch(`http://127.0.0.1:${address.port}${path}`, options);
}

test("GET /api/health повертає статус ok", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.equal(body.status, "ok");
});

test("GET /api/auth/me без токена повертає 401", async () => {
  const response = await request("/api/auth/me");
  assert.equal(response.status, 401);
});

test("POST /api/auth/register відхиляє некоректні дані", async () => {
  const response = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "A",
      email: "invalid-email",
      password: "123"
    })
  });

  assert.equal(response.status, 400);
});

test("POST /api/auth/register створює користувача", async () => {
  const email = `lab2-${Date.now()}@example.com`;

  const response = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Lab Two Tester",
      email,
      password: "StrongPass123!"
    })
  });

  assert.equal(response.status, 201);

  const body = await response.json();
  assert.equal(body.user.email, email);
  assert.ok(body.accessToken);
  assert.ok(body.refreshToken);
  assert.equal(body.user.passwordHash, undefined);
});

test("POST /api/auth/login відхиляє неправильний пароль", async () => {
  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "nonexistent-lab2@example.com",
      password: "WrongPass123!"
    })
  });

  assert.equal(response.status, 401);
});

test("POST /api/auth/refresh відхиляє недійсний токен", async () => {
  const response = await request("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: "invalid-refresh-token"
    })
  });

  assert.equal(response.status, 401);
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });

  await prisma.$disconnect();
});
