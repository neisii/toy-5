#!/bin/bash

###############################################################################
# Kill Development Servers Script
# 
# 목적: 좀비 상태의 npm/node 개발 서버 프로세스들을 정리
# 사용: ./kill-dev-servers.sh [--dry-run] [--port PORT]
###############################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 플래그
DRY_RUN=false
SPECIFIC_PORT=""

# 인자 파싱
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --port)
      SPECIFIC_PORT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run       Show what would be killed without actually killing"
      echo "  --port PORT     Kill only processes using specific port"
      echo "  --help          Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                    # Kill all dev servers"
      echo "  $0 --dry-run          # Show processes without killing"
      echo "  $0 --port 5173        # Kill only port 5173"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Dev Server Process Cleanup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 포트 점유 프로세스 확인
echo -e "${YELLOW}📍 Checking port usage...${NC}"
echo ""

PORTS=(5173 5174 5175 3000 3001 8080)
KILLED_COUNT=0

if [ -n "$SPECIFIC_PORT" ]; then
  PORTS=($SPECIFIC_PORT)
fi

for PORT in "${PORTS[@]}"; do
  PIDS=$(lsof -ti :$PORT 2>/dev/null || true)
  
  if [ -n "$PIDS" ]; then
    echo -e "${YELLOW}Port $PORT is in use by:${NC}"
    for PID in $PIDS; do
      PROC_INFO=$(ps -p $PID -o pid,ppid,command | tail -1)
      echo "  PID $PID: $PROC_INFO"
      
      if [ "$DRY_RUN" = false ]; then
        kill -9 $PID 2>/dev/null || true
        echo -e "  ${GREEN}✓ Killed PID $PID${NC}"
        ((KILLED_COUNT++))
      else
        echo -e "  ${BLUE}[DRY-RUN] Would kill PID $PID${NC}"
      fi
    done
    echo ""
  fi
done

# 2. 좀비 npm 프로세스 정리
echo -e "${YELLOW}🧟 Checking zombie npm processes...${NC}"
echo ""

# 오래된 npm run dev 프로세스 찾기 (1일 이상)
OLD_NPM_PIDS=$(ps -eo pid,etime,command | grep "npm run dev\|npm exec\|npm run server" | grep -v grep | awk '{
  # etime 형식: [[DD-]HH:]MM:SS
  split($2, time, "-")
  if (length(time) > 1) {
    # DD-HH:MM:SS 형식 (1일 이상)
    print $1
  } else {
    split($2, hms, ":")
    if (length(hms) > 2 && hms[1] > 0) {
      # HH:MM:SS 형식에서 HH > 0 (1시간 이상)
      print $1
    }
  }
}' || true)

if [ -n "$OLD_NPM_PIDS" ]; then
  echo -e "${YELLOW}Found old npm processes:${NC}"
  for PID in $OLD_NPM_PIDS; do
    PROC_INFO=$(ps -p $PID -o pid,etime,command 2>/dev/null | tail -1 || echo "Process not found")
    echo "  $PROC_INFO"
    
    if [ "$DRY_RUN" = false ]; then
      # npm 프로세스와 자식 프로세스 모두 종료
      pkill -9 -P $PID 2>/dev/null || true
      kill -9 $PID 2>/dev/null || true
      echo -e "  ${GREEN}✓ Killed PID $PID and children${NC}"
      ((KILLED_COUNT++))
    else
      echo -e "  ${BLUE}[DRY-RUN] Would kill PID $PID${NC}"
    fi
  done
  echo ""
else
  echo -e "${GREEN}No old npm processes found${NC}"
  echo ""
fi

# 3. 좀비 node 프로세스 정리 (vite, next, json-server)
echo -e "${YELLOW}🔍 Checking zombie node processes...${NC}"
echo ""

# 1시간 이상 실행 중인 vite/next 프로세스
OLD_NODE_PIDS=$(ps -eo pid,etime,command | grep -E "node.*/(vite|next|json-server)" | grep -v grep | awk '{
  split($2, time, "-")
  if (length(time) > 1) {
    print $1
  } else {
    split($2, hms, ":")
    if (length(hms) > 2 && hms[1] > 0) {
      print $1
    }
  }
}' || true)

if [ -n "$OLD_NODE_PIDS" ]; then
  echo -e "${YELLOW}Found old node dev server processes:${NC}"
  for PID in $OLD_NODE_PIDS; do
    PROC_INFO=$(ps -p $PID -o pid,etime,command 2>/dev/null | tail -1 || echo "Process not found")
    echo "  $PROC_INFO"
    
    if [ "$DRY_RUN" = false ]; then
      kill -9 $PID 2>/dev/null || true
      echo -e "  ${GREEN}✓ Killed PID $PID${NC}"
      ((KILLED_COUNT++))
    else
      echo -e "  ${BLUE}[DRY-RUN] Would kill PID $PID${NC}"
    fi
  done
  echo ""
else
  echo -e "${GREEN}No old node processes found${NC}"
  echo ""
fi

# 요약
echo -e "${BLUE}========================================${NC}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${BLUE}DRY-RUN MODE: No processes were killed${NC}"
else
  echo -e "${GREEN}✓ Cleanup completed!${NC}"
  echo -e "${GREEN}  Killed $KILLED_COUNT processes${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

# 현재 상태 확인
echo -e "${YELLOW}📊 Current port status:${NC}"
for PORT in 5173 5174 5175 3000 3001; do
  if lsof -ti :$PORT >/dev/null 2>&1; then
    echo -e "  Port $PORT: ${RED}IN USE${NC}"
  else
    echo -e "  Port $PORT: ${GREEN}FREE${NC}"
  fi
done
echo ""

exit 0
