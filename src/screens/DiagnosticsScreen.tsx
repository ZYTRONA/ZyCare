import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function DiagnosticsScreen() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [aiEngineStatus, setAIEngineStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [localIP, setLocalIP] = useState('10.56.198.1');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    checkConnectivity();
  }, []);

  const checkConnectivity = async () => {
    setBackendStatus('checking');
    setAIEngineStatus('checking');

    // Check backend
    try {
      await axios.get(`http://${localIP}:5000/`, { timeout: 5000 });
      setBackendStatus('online');
    } catch (error) {
      setBackendStatus('offline');
    }

    // Check AI engine
    try {
      await axios.get(`http://${localIP}:8000/health`, { timeout: 5000 });
      setAIEngineStatus('online');
    } catch (error) {
      setAIEngineStatus('offline');
    }

    // Get API URL from environment
    try {
      const response = await axios.get('http://localhost:8081/debug-info');
      setApiUrl(response.data?.apiUrl || 'Unknown');
    } catch (error) {
      setApiUrl('Unable to detect');
    }
  };

  const StatusBadge = ({ status }: { status: 'checking' | 'online' | 'offline' }) => {
    if (status === 'checking') {
      return <ActivityIndicator size="small" color="#FFB800" />;
    }
    return (
      <View
        style={[
          styles.statusBadge,
          status === 'online' ? styles.online : styles.offline,
        ]}
      >
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>🔧 Network Diagnostics</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Server (Port 5000)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <StatusBadge status={backendStatus} />
          </View>
          <Text style={styles.info}>URL: http://{localIP}:5000</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Engine (Port 8000)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <StatusBadge status={aiEngineStatus} />
          </View>
          <Text style={styles.info}>URL: http://{localIP}:8000</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Text style={styles.info}>API URL: {apiUrl || 'Loading...'}</Text>
          <Text style={styles.info}>Local IP: {localIP}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          <Text style={styles.help}>
            If services show "OFFLINE":

            1. Ensure your phone is on the SAME WiFi as your computer
            2. Check router doesn't have AP Isolation enabled
            3. Test in phone browser: http://{localIP}:5000
            4. Try Solution 3 or 4 from NETWORK_SETUP.md

            To view NETWORK_SETUP.md:
            See the file in project root for detailed instructions.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={checkConnectivity}>
          <Text style={styles.buttonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  help: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FFB800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
