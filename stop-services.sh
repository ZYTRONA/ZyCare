#!/bin/bash

echo "🛑 Stopping ZYCARE Services..."

# Kill processes on ports
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "  Stopping Backend (port 5000)..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    echo "  ✅ Backend stopped"
else
    echo "  ℹ️  Backend not running"
fi

if lsof -ti:8000 > /dev/null 2>&1; then
    echo "  Stopping AI Engine (port 8000)..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "  ✅ AI Engine stopped"
else
    echo "  ℹ️  AI Engine not running"
fi

echo ""
echo "✅ All services stopped"
