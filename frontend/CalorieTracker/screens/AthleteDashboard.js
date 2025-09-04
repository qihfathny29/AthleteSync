import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Alert 
} from 'react-native';
import axios from 'axios';
import MoodCheckModal from '../components/MoodCheckModal';
import CustomModal from '../components/CustomModal';

const AthleteDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [todayCalories, setTodayCalories] = useState(0);
  const [targetCalories] = useState(2500); // Default untuk atlet basket
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [hasMoodToday, setHasMoodToday] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedTask, setCompletedTask] = useState(null);

  useEffect(() => {
    checkMoodStatus();
    loadTodaySchedules();
  }, []);

  const loadTodaySchedules = async () => {
    try {
      const response = await axios.get(`http://192.168.1.10:3000/api/schedule/today/${user.id}`);
      setTodaySchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      // Set empty array jika ada error
      setTodaySchedules([]);
    }
  };

  const checkMoodStatus = async () => {
    try {
      const response = await axios.get(`http://192.168.1.10:3000/api/mood/today/${user.id}`);
      
      if (!response.data.hasMoodToday) {
        // Show mood modal if user hasn't logged mood today
        setTimeout(() => {
          setShowMoodModal(true);
        }, 1000); // Delay 1 second for better UX
      } else {
        setHasMoodToday(true);
      }
    } catch (error) {
      console.error('Error checking mood status:', error);
      // Show modal anyway if there's an error
      setTimeout(() => {
        setShowMoodModal(true);
      }, 1000);
    }
  };

  const handleMoodSubmitted = () => {
    setHasMoodToday(true);
    setShowMoodModal(false);
  };

  const completeSchedule = async (scheduleId, taskName) => {
    try {
      await axios.put(`http://192.168.1.10:3000/api/schedule/complete/${scheduleId}`);
      
      // Set task info and show modal
      setCompletedTask(taskName);
      setShowCompletionModal(true);
      
      // Reload schedules to update UI
      loadTodaySchedules();
    } catch (error) {
      console.error('Error completing schedule:', error);
      Alert.alert('Error', 'Gagal menyelesaikan tugas. Coba lagi ya!');
    }
  };

  const showPairingCode = () => {
    Alert.alert(
      'Kode Pairing Anda 🔗',
      `${user.pairing_code}\n\nBerikan kode ini kepada partner Anda!`,
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Yakin mau logout sayang? 💕',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya, Logout',
          onPress: () => {
            // Clear any stored tokens/data if needed
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F0F8F0" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Halo, {user.name}! 🏀</Text>
            <Text style={styles.subtitle}>Mari jaga performa atletmu hari ini</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.pairingButton} onPress={showPairingCode}>
          <Text style={styles.pairingButtonText}>🔗 Kode Pairing</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Calorie Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kalori Hari Ini 🍎</Text>
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieNumber}>{todayCalories}</Text>
            <Text style={styles.calorieTarget}>/ {targetCalories} kal</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(todayCalories / targetCalories) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aksi Cepat ⚡</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🍽️</Text>
              <Text style={styles.actionText}>Tambah Makanan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ScheduleScreen', { user })}
            >
              <Text style={styles.actionIcon}>🏋️</Text>
              <Text style={styles.actionText}>Jadwal Harian</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💧</Text>
              <Text style={styles.actionText}>Catat Minum</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>😴</Text>
              <Text style={styles.actionText}>Tidur & Recovery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tugas Hari Ini ✅</Text>
          <View style={styles.taskList}>
            {todaySchedules.length > 0 ? (
              todaySchedules.map((schedule, index) => (
                <ScheduleTaskItem 
                  key={index}
                  schedule={schedule} 
                  onComplete={() => completeSchedule(schedule.id, schedule.activity_description)}
                />
              ))
            ) : (
              <View style={styles.noTasksContainer}>
                <Text style={styles.noTasksText}>Belum ada jadwal hari ini 📅</Text>
                <TouchableOpacity 
                  style={styles.addScheduleButton}
                  onPress={() => navigation.navigate('ScheduleScreen', { user })}
                >
                  <Text style={styles.addScheduleButtonText}>+ Tambah Jadwal</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Mood Check Modal */}
      <MoodCheckModal
        visible={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        user={user}
        onMoodSubmitted={handleMoodSubmitted}
      />

      {/* Task Completion Modal */}
      <CustomModal
        visible={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="🎉 Selamat Sayang!"
        message={`Kamu sudah menyelesaikan "${completedTask}"! Lanjut ke kegiatan berikutnya yaa! 💪✨`}
        buttonText="Siap! ❤️"
      />
    </View>
  );
};

const ScheduleTaskItem = ({ schedule, onComplete }) => {
  const formatTime = (timeString) => {
    if (!timeString) return '00:00';
    
    // Jika timeString adalah Date object yang aneh dari database
    if (timeString.includes && timeString.includes('1970')) {
      try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          // Use UTC methods to avoid timezone conversion
          return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
        }
      } catch (error) {
        console.log('Error parsing time:', error);
      }
    }
    
    // Jika sudah format HH:MM:SS atau HH:MM, ambil HH:MM saja  
    if (timeString.includes && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    
    return timeString;
  };

  const formatScheduleDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => !schedule.is_completed && onComplete()}
    >
      <Text style={styles.taskIcon}>
        {schedule.is_completed ? '✅' : '⭕'}
      </Text>
      <View style={styles.taskDetails}>
        <Text style={styles.taskDate}>
          {formatScheduleDate(schedule.schedule_date)}
        </Text>
        <Text style={styles.taskTime}>
          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
        </Text>
        <Text style={[
          styles.taskText, 
          schedule.is_completed && styles.taskCompleted
        ]}>
          {schedule.activity_description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const TaskItem = ({ title, completed }) => (
  <TouchableOpacity style={styles.taskItem}>
    <Text style={styles.taskIcon}>{completed ? '✅' : '⭕'}</Text>
    <Text style={[styles.taskText, completed && styles.taskCompleted]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 18,
    color: 'white',
  },
  pairingButton: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  pairingButtonText: {
    color: '#2E8B57',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 15,
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  calorieTarget: {
    fontSize: 18,
    color: '#666',
    marginLeft: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E8B57',
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  taskList: {
    gap: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  taskIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  taskDetails: {
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 2,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  noTasksContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noTasksText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  addScheduleButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addScheduleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AthleteDashboard;
