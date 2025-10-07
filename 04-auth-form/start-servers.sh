#!/bin/bash

# Express 서버 시작 (백그라운드)
npm run server &
SERVER_PID=$!

# 서버 시작 대기
sleep 2

# SvelteKit 개발 서버 시작 (백그라운드)
npm run dev &
DEV_PID=$!

echo "Express server PID: $SERVER_PID"
echo "SvelteKit dev server PID: $DEV_PID"

# 서버 준비 대기
sleep 5

# 종료 시그널 처리
trap "kill $SERVER_PID $DEV_PID 2>/dev/null; exit" INT TERM

# 백그라운드 프로세스 대기
wait
