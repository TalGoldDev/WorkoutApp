import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/shared/Layout';
import { Button } from '../components/shared/Button';

export const Admin = () => {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [logs, setLogs] = useState([]);
  const [testTimerActive, setTestTimerActive] = useState(false);
  const [testTimerCount, setTestTimerCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      id: crypto.randomUUID(),
      timestamp,
      message,
      type
    }, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const requestPermission = async () => {
    addLog('Requesting notification permission...', 'info');
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        addLog(`Permission result: ${permission}`, permission === 'granted' ? 'success' : 'error');
      } catch (error) {
        addLog(`Error requesting permission: ${error.message}`, 'error');
      }
    } else {
      addLog('Notification API not available', 'error');
    }
  };

  const testNotificationImmediate = () => {
    addLog('Testing immediate notification...', 'info');

    if (!('Notification' in window)) {
      addLog('Notification API not supported', 'error');
      return;
    }

    if (Notification.permission !== 'granted') {
      addLog('Permission not granted. Current: ' + Notification.permission, 'error');
      return;
    }

    try {
      const notification = new Notification('Test Notification! 🔔', {
        body: 'This is a test notification from the admin panel.',
      });
      addLog('Notification created successfully', 'success');

      notification.onclick = () => {
        addLog('Notification clicked!', 'info');
      };

      notification.onerror = (error) => {
        addLog('Notification error: ' + JSON.stringify(error), 'error');
      };
    } catch (error) {
      addLog(`Error creating notification: ${error.message}`, 'error');
    }
  };

  const startTestTimer = () => {
    if (testTimerActive) {
      addLog('Timer already running', 'error');
      return;
    }

    addLog('Starting 5-second test timer...', 'info');
    setTestTimerActive(true);
    setTestTimerCount(5);

    timerRef.current = setInterval(() => {
      setTestTimerCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTestTimerActive(false);

          addLog('Timer complete! Sending notification...', 'info');

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notification = new Notification('Rest Complete! 💪', {
                body: "Time to crush your next set! Let's go!",
                vibrate: [200, 100, 200],
              });
              addLog('Timer notification sent successfully', 'success');

              notification.onerror = (error) => {
                addLog('Timer notification error: ' + JSON.stringify(error), 'error');
              };
            } catch (error) {
              addLog(`Error sending timer notification: ${error.message}`, 'error');
            }
          } else {
            addLog('Cannot send notification - permission not granted', 'error');
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all app data?')) {
      localStorage.clear();
      addLog('localStorage cleared - reload page to reset app', 'success');
    }
  };

  const viewLocalStorage = () => {
    const keys = Object.keys(localStorage);
    addLog(`localStorage has ${keys.length} keys`, 'info');
    keys.forEach(key => {
      if (key.startsWith('workout_tracker_')) {
        const data = localStorage.getItem(key);
        addLog(`${key}: ${data.length} characters`, 'info');
      }
    });
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-red-700">Admin / Debug Panel</h1>
            <p className="text-sm text-red-600 mt-1">For testing and debugging only</p>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3">System Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Notification API:</span>
                <span className={('Notification' in window) ? 'text-green-600' : 'text-red-600'}>
                  {('Notification' in window) ? '✓ Supported' : '✗ Not Supported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Permission Status:</span>
                <span className={`font-semibold ${
                  notificationPermission === 'granted' ? 'text-green-600' :
                  notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {notificationPermission}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Browser:</span>
                <span>{navigator.userAgent.split(' ').pop()}</span>
              </div>
            </div>
          </div>

          {/* Notification Tests */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3">Notification Tests</h2>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={requestPermission}
                disabled={notificationPermission === 'granted'}
              >
                {notificationPermission === 'granted' ? '✓ Permission Granted' : 'Request Notification Permission'}
              </Button>

              <Button
                variant="success"
                fullWidth
                onClick={testNotificationImmediate}
                disabled={notificationPermission !== 'granted'}
              >
                Test Notification (Immediate)
              </Button>

              <div className="border-t pt-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={startTestTimer}
                  disabled={testTimerActive || notificationPermission !== 'granted'}
                >
                  {testTimerActive ? `Timer: ${testTimerCount}s` : 'Start 5-Second Test Timer'}
                </Button>
                {testTimerActive && (
                  <div className="mt-2 text-center">
                    <div className="text-3xl font-bold text-primary">{testTimerCount}</div>
                    <p className="text-sm text-gray-600">Notification will fire at 0</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3">Data Management</h2>
            <div className="space-y-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={viewLocalStorage}
              >
                View localStorage Info
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={clearLocalStorage}
              >
                Clear All App Data
              </Button>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Activity Logs</h2>
              <button
                onClick={clearLogs}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No logs yet. Run a test to see logs.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="text-xs font-mono border-l-2 border-gray-300 pl-2 py-1">
                    <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
