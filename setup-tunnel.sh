#!/bin/bash
# setup-tunnel.sh - Set up tunneling for Expo development

echo "🔧 ZYCARE Tunnel Setup"
echo "====================="
echo ""
echo "Choose connection method:"
echo "1. Ngrok Tunnel (works from anywhere)"
echo "2. ADB Reverse (Android emulator only)"
echo "3. Check current network IP"
echo "4. Test backend/AI engine connectivity"
echo ""

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo "📡 Setting up ngrok tunnels..."
        
        # Start tunnels for backend and AI engine
        echo "Starting tunnel for Backend (port 5000)..."
        ngrok http 5000 --log=stdout > /tmp/ngrok-backend.log 2>&1 &
        NGROK_BACKEND_PID=$!
        
        echo "Starting tunnel for AI Engine (port 8000)..."
        ngrok http 8000 --log=stdout > /tmp/ngrok-ai.log 2>&1 &
        NGROK_AI_PID=$!
        
        sleep 3
        
        # Extract URLs from ngrok logs
        BACKEND_URL=$(grep -oP 'https://[a-z0-9]+\.ngrok\.io' /tmp/ngrok-backend.log | head -1)
        AI_URL=$(grep -oP 'https://[a-z0-9]+\.ngrok\.io' /tmp/ngrok-ai.log | head -1)
        
        if [ -z "$BACKEND_URL" ] || [ -z "$AI_URL" ]; then
            echo "❌ Failed to get ngrok URLs"
            echo "Make sure you have ngrok installed and authenticated"
            exit 1
        fi
        
        echo "✅ Tunnels created!"
        echo ""
        echo "Update your .env file with:"
        echo "EXPO_PUBLIC_API_URL=$BACKEND_URL"
        echo "EXPO_PUBLIC_SOCKET_URL=$BACKEND_URL"
        echo "EXPO_PUBLIC_AI_ENGINE_URL=$AI_URL"
        echo ""
        echo "Keeping tunnels open (press Ctrl+C to stop)..."
        wait
        ;;
    2)
        echo "📱 Setting up ADB reverse port forwarding..."
        
        if ! command -v adb &> /dev/null; then
            echo "❌ ADB not found. Install Android SDK tools."
            exit 1
        fi
        
        echo "Connected devices:"
        adb devices
        echo ""
        
        echo "Setting up port forwarding..."
        adb reverse tcp:5000 tcp:5000
        adb reverse tcp:8000 tcp:8000
        
        echo "✅ Port forwarding configured!"
        echo ""
        echo "Update your .env file with:"
        echo "EXPO_PUBLIC_API_URL=http://localhost:5000"
        echo "EXPO_PUBLIC_SOCKET_URL=http://localhost:5000"
        echo "EXPO_PUBLIC_AI_ENGINE_URL=http://localhost:8000"
        ;;
    3)
        echo "🌐 Network Information:"
        echo ""
        echo "Local IP address:"
        ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d'/' -f1
        echo ""
        echo "Make sure your mobile device is on the same WiFi network!"
        ;;
    4)
        echo "🧪 Testing connectivity..."
        echo ""
        echo "Backend (5000):"
        curl -s http://10.56.198.1:5000/ | python3 -m json.tool || echo "❌ Connection failed"
        echo ""
        echo "AI Engine (8000):"
        curl -s http://10.56.198.1:8000/health | python3 -m json.tool || echo "❌ Connection failed"
        echo ""
        echo "Try from your phone's browser:"
        echo "http://10.56.198.1:5000/"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac
