#!/bin/bash

echo "🚀 Starting ZYCARE Services..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Kill existing processes on ports
echo "🧹 Cleaning up existing processes..."
if check_port 5000; then
    echo "  Killing process on port 5000..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
fi

if check_port 8000; then
    echo "  Killing process on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
fi

sleep 2

# Start Backend
echo -e "${BLUE}📱 Starting Backend Server...${NC}"
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"
cd ..

sleep 3

# Start AI Engine
echo -e "${BLUE}🤖 Starting AI Engine...${NC}"
cd ai-engine
source venv/bin/activate
python main.py > ../logs/ai-engine.log 2>&1 &
AI_ENGINE_PID=$!
echo "  AI Engine PID: $AI_ENGINE_PID"
cd ..

sleep 3

# Check if services are running
echo ""
echo "🔍 Checking services..."

if check_port 5000; then
    echo -e "  ${GREEN}✅ Backend running on http://192.168.137.14:5000${NC}"
else
    echo -e "  ${RED}❌ Backend failed to start${NC}"
fi

if check_port 8000; then
    echo -e "  ${GREEN}✅ AI Engine running on http://0.0.0.0:8000${NC}"
else
    echo -e "  ${RED}❌ AI Engine failed to start${NC}"
fi

echo ""
echo "📋 Process IDs:"
echo "  Backend: $BACKEND_PID"
echo "  AI Engine: $AI_ENGINE_PID"
echo ""
echo "📝 Logs:"
echo "  Backend: logs/backend.log"
echo "  AI Engine: logs/ai-engine.log"
echo ""
echo "⚠️  To stop services, run: ./stop-services.sh"
echo "📊 To view logs, run: tail -f logs/*.log"
