import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  Alert 
} from 'react-native';
import axios from 'axios';

const PartnerDashboard = ({ navigation, route }) => {
  const { user } = route.params;
  const [pairingCode, setPairingCode] = useState('');
  const [pairedAthlete, setPairedAthlete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [athleteMoods, setAthleteMoods] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [athleteSchedules, setAthleteSchedules] = useState([]);
  const [todaySchedulesCount, setTodaySchedulesCount] = useState(0);
  const [completedSchedulesCount, setCompletedSchedulesCount] = useState(0);

  useEffect(() => {
    if (pairedAthlete) {
      loadAthleteMoods();
      loadAthleteSchedules();
      // Set up interval to refresh data every 30 seconds
      const interval = setInterval(() => {
        loadAthleteMoods();
        loadAthleteSchedules();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [pairedAthlete]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Yakin mau logout? 💕',
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

  const handlePairing = async () => {
    if (!pairingCode.trim()) {
      Alert.alert('Error', 'Masukkan kode pairing terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://192.168.1.10:3000/api/auth/pair', {
        partnerId: user.id,
        pairingCode: pairingCode.toUpperCase()
      });

      setPairedAthlete(response.data.athlete);
      Alert.alert(
        'Pairing Berhasil! 🎉',
        `Anda sekarang terhubung dengan ${response.data.athlete.name}`,
        [{ text: 'OK' }]
      );
      setPairingCode('');
      
      // Load athlete's moods after successful pairing
      loadAthleteMoods();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Kode pairing tidak valid atau sudah digunakan');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAthleteMoods = async () => {
    try {
      const response = await axios.get(`http://192.168.1.10:3000/api/mood/partner/${user.id}`);
      if (response.data.moods) {
        setAthleteMoods(response.data.moods);
        // Set today's mood if available
        const today = new Date().toISOString().split('T')[0];
        const todaysMood = response.data.moods.find(mood => 
          mood.created_date.split('T')[0] === today
        );
        setTodayMood(todaysMood || null);
      }
    } catch (error) {
      console.error('Error loading athlete moods:', error);
    }
  };

  const loadAthleteSchedules = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.10:3000/api/schedule/athlete/${pairedAthlete.id}/today`
      );
      setAthleteSchedules(response.data);
      setTodaySchedulesCount(response.data.length);
      
      const completed = response.data.filter(schedule => schedule.is_completed).length;
      setCompletedSchedulesCount(completed);
    } catch (error) {
      console.error('Error loading athlete schedules:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F0F8F0" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Halo, {user.name}! 💕</Text>
            <Text style={styles.subtitle}>Monitor kesehatan atlet kesayanganmu</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {!pairedAthlete ? (
          // Pairing Section
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hubungkan dengan Atlet 🔗</Text>
            <Text style={styles.pairingDescription}>
              Masukkan kode pairing yang diberikan oleh atlet untuk memulai monitoring
            </Text>
            
            <View style={styles.pairingInputContainer}>
              <TextInput
                style={styles.pairingInput}
                placeholder="Masukkan kode pairing"
                value={pairingCode}
                onChangeText={setPairingCode}
                autoCapitalize="characters"
                maxLength={6}
              />
              <TouchableOpacity 
                style={[styles.pairingButton, isLoading && styles.pairingButtonDisabled]}
                onPress={handlePairing}
                disabled={isLoading}
              >
                <Text style={styles.pairingButtonText}>
                  {isLoading ? 'Menghubungkan...' : 'Hubungkan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Partner Dashboard Content
          <>
            {/* Today's Mood */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mood Hari Ini 💝</Text>
              {todayMood ? (
                <View style={styles.moodDisplay}>
                  <Text style={styles.moodEmoji}>{todayMood.mood_emoji}</Text>
                  <View style={styles.moodContent}>
                    <Text style={styles.moodText}>
                      "{todayMood.mood_text || 'Tidak ada catatan'}"
                    </Text>
                    <Text style={styles.moodTime}>
                      {new Date(todayMood.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noMoodContainer}>
                  <Text style={styles.noMoodEmoji}>🤔</Text>
                  <Text style={styles.noMoodText}>
                    {pairedAthlete.name} belum update mood hari ini
                  </Text>
                </View>
              )}
            </View>

            {/* Athlete Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Atlet Terhubung 🏀</Text>
              <View style={styles.athleteInfo}>
                <Text style={styles.athleteName}>{pairedAthlete.name}</Text>
                <Text style={styles.athleteStatus}>🟢 Aktif</Text>
              </View>
            </View>

            
         

            {/* Today's Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ringkasan Hari Ini 📊</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>🍎</Text>
                  <Text style={styles.summaryNumber}>1,200</Text>
                  <Text style={styles.summaryLabel}>Kalori</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>💧</Text>
                  <Text style={styles.summaryNumber}>1.5L</Text>
                  <Text style={styles.summaryLabel}>Air</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>🏋️</Text>
                  <Text style={styles.summaryNumber}>{todaySchedulesCount}</Text>
                  <Text style={styles.summaryLabel}>Latihan</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>✅</Text>
                  <Text style={styles.summaryNumber}>{completedSchedulesCount}/{todaySchedulesCount}</Text>
                  <Text style={styles.summaryLabel}>Selesai</Text>
                </View>
              </View>
            </View>

            {/* Live Activity Feed */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Aktivitas Latihan Hari Ini 📱</Text>
              <View style={styles.activityFeed}>
                {athleteSchedules.length > 0 ? (
                  athleteSchedules.map((schedule, index) => (
                    <ActivityItem 
                      key={schedule.id}
                      time={schedule.start_time ? schedule.start_time.substring(0, 5) : 'N/A'}
                      action={schedule.activity_description}
                      calories={schedule.is_completed ? "Selesai ✅" : "Belum selesai ⏳"}
                      icon={schedule.is_completed ? "✅" : "⏰"}
                      isCompleted={schedule.is_completed}
                    />
                  ))
                ) : (
                  <View style={styles.noActivityContainer}>
                    <Text style={styles.noActivityEmoji}>🤔</Text>
                    <Text style={styles.noActivityText}>
                      Belum ada jadwal latihan hari ini
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Aksi Partner 💕</Text>
              <View style={styles.partnerActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>💌</Text>
                  <Text style={styles.actionText}>Kirim Motivasi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>⏰</Text>
                  <Text style={styles.actionText}>Set Reminder</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📊</Text>
                  <Text style={styles.actionText}>Lihat Laporan</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>🍽️</Text>
                  <Text style={styles.actionText}>Saran Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const ActivityItem = ({ time, action, calories, icon, isCompleted }) => (
  <View style={[styles.activityItem, isCompleted && styles.activityItemCompleted]}>
    <Text style={styles.activityIcon}>{icon}</Text>
    <View style={styles.activityContent}>
      <Text style={[styles.activityAction, isCompleted && styles.activityActionCompleted]}>
        {action}
      </Text>
      <Text style={styles.activityTime}>{time} • {calories}</Text>
    </View>
  </View>
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
  pairingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  pairingInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pairingInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pairingButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  pairingButtonDisabled: {
    backgroundColor: '#888',
  },
  pairingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  athleteInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  athleteName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  athleteStatus: {
    fontSize: 14,
    color: '#2E8B57',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityFeed: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  partnerActions: {
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
  // Mood Display Styles
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: 15,
  },
  moodContent: {
    flex: 1,
  },
  moodText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  moodTime: {
    fontSize: 12,
    color: '#666',
  },
  noMoodContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noMoodEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  noMoodText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  moodHistory: {
    gap: 10,
  },
  moodHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 10,
  },
  moodHistoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  moodHistoryContent: {
    flex: 1,
  },
  moodHistoryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 2,
  },
  moodHistoryText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  activityItemCompleted: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activityActionCompleted: {
    textDecorationLine: 'line-through',
    color: '#4CAF50',
  },
  noActivityContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noActivityEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  noActivityText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default PartnerDashboard;
