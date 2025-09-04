import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const SimpleScheduleScreen = ({ navigation, route }) => {
  const { user } = route.params;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0, 0);
    return defaultStart;
  });
  const [endTime, setEndTime] = useState(() => {
    const defaultEnd = new Date();
    defaultEnd.setHours(10, 0, 0, 0);
    return defaultEnd;
  });
  const [activityDescription, setActivityDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Picker visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Load today's schedules when component mounts
  useEffect(() => {
    loadTodaySchedules();
  }, []);

  const loadTodaySchedules = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.10:3000/api/schedule/today/${user.id}`);
      setTodaySchedules(response.data.schedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeFromDB = (timeString) => {
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

  // Format functions for display  
  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatTimeForAPI = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Handle picker changes
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  const onStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
  };

  const onEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };

  const handleSubmit = async () => {
    if (!activityDescription.trim()) {
      Alert.alert('Error', 'Mohon isi deskripsi aktivitas!');
      return;
    }

    const startTimeMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endTimeMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (startTimeMinutes >= endTimeMinutes) {
      Alert.alert('Error', 'Waktu mulai harus lebih awal dari waktu selesai!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://192.168.1.10:3000/api/schedule/add', {
        userId: user.id,
        scheduleDate: formatDateForAPI(selectedDate),
        startTime: formatTimeForAPI(startTime),
        endTime: formatTimeForAPI(endTime),
        activityDescription: activityDescription.trim()
      });

      if (response.data.success) {
        // Reset form
        setActivityDescription('');
        const defaultStart = new Date();
        defaultStart.setHours(9, 0, 0, 0);
        setStartTime(defaultStart);
        const defaultEnd = new Date();
        defaultEnd.setHours(10, 0, 0, 0);
        setEndTime(defaultEnd);
        
        // Reload schedules to show the new one
        await loadTodaySchedules();
        
        Alert.alert(
          '🎉 Berhasil!',
          'Jadwal berhasil ditambahkan! Semangat latihan sayang! 💪'
        );
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', 'Gagal menambahkan jadwal. Coba lagi ya!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F0F8F0" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jadwal Harian 📅</Text>
        <Text style={styles.headerSubtitle}>Atur jadwal latihan dan aktivitas</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Tanggal</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerButtonText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.pickerIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Time Inputs */}
        <View style={styles.timeRow}>
          <View style={styles.timeGroup}>
            <Text style={styles.label}>⏰ Waktu Mulai</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.pickerButtonText}>{formatTime(startTime)}</Text>
              <Text style={styles.pickerIcon}>⏰</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeGroup}>
            <Text style={styles.label}>⏰ Waktu Selesai</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.pickerButtonText}>{formatTime(endTime)}</Text>
              <Text style={styles.pickerIcon}>⏰</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📝 Deskripsi Aktivitas</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={activityDescription}
              onChangeText={setActivityDescription}
              placeholder="Contoh: Latihan shooting 3-point, Gym cardio, Recovery massage..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Menyimpan... ⏳' : 'Tambah Jadwal 🎯'}
          </Text>
        </TouchableOpacity>

        {/* Jadwal Hari Ini */}
        <View style={styles.schedulesContainer}>
          <Text style={styles.schedulesTitle}>� Jadwal Hari Ini</Text>
          {isLoading ? (
            <Text style={styles.loadingText}>Memuat jadwal...</Text>
          ) : todaySchedules.length > 0 ? (
            todaySchedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text style={styles.scheduleDateText}>
                  {formatScheduleDate(schedule.schedule_date)}
                </Text>
                <View style={styles.scheduleTimeContainer}>
                  <Text style={styles.scheduleTime}>
                    {formatTimeFromDB(schedule.start_time)} - {formatTimeFromDB(schedule.end_time)}
                  </Text>
                  <Text style={styles.scheduleStatus}>
                    {schedule.is_completed ? '✅ Selesai' : '⏰ Belum'}
                  </Text>
                </View>
                <Text style={styles.scheduleActivity}>{schedule.activity_description}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Belum ada jadwal untuk hari ini</Text>
          )}
        </View>
      </ScrollView>

      {/* DateTimePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={onStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={onEndTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F0',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeGroup: {
    flex: 0.48,
  },
  submitButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  schedulesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
  },
  schedulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 15,
  },
  scheduleItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  scheduleDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 8,
    textAlign: 'center',
  },
  scheduleTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
  },
  scheduleStatus: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  scheduleActivity: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pickerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pickerIcon: {
    fontSize: 18,
  },
});

export default SimpleScheduleScreen;
