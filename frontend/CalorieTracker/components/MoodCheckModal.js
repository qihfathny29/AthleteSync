import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const MoodCheckModal = ({ visible, onClose, user, onMoodSubmitted }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [moodText, setMoodText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { emoji: '😡', label: 'Marah', color: '#FF6B6B' },
    { emoji: '😢', label: 'Sedih', color: '#4ECDC4' },
    { emoji: '😐', label: 'Biasa', color: '#95A5A6' },
    { emoji: '😊', label: 'Senang', color: '#F39C12' },
    { emoji: '😍', label: 'Sangat Bahagia', color: '#2ECC71' }
  ];

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Oops!', 'Pilih mood kamu dulu sayang 💕');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://192.168.1.10:3000/api/mood/log', {
        userId: user.id,
        moodEmoji: selectedMood,
        moodText: moodText.trim()
      });

      Alert.alert(
        'Berhasil! 🎉',
        'Mood hari ini sudah tersimpan. Partner kamu akan tahu! 💕',
        [{ text: 'OK', onPress: () => {
          onMoodSubmitted?.();
          onClose();
        }}]
      );
    } catch (error) {
      console.error('Error submitting mood:', error);
      Alert.alert('Error', 'Gagal menyimpan mood. Coba lagi ya sayang!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Mood Check?',
      'Yakin mau skip? Partner kamu pengen tau gimana kabar kamu hari ini 🥺',
      [
        { text: 'Tetap Skip', onPress: onClose },
        { text: 'Isi Mood', style: 'cancel' }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Gimana kabar hari ini? 💕</Text>
            <Text style={styles.subtitle}>Cerita ke partner kamu yuk!</Text>
          </View>

          {/* Mood Selector */}
          <View style={styles.moodGrid}>
            {moods.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === mood.emoji && { 
                    backgroundColor: mood.color, 
                    transform: [{ scale: 1.1 }] 
                  }
                ]}
                onPress={() => setSelectedMood(mood.emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  selectedMood === mood.emoji && { color: 'white', fontWeight: 'bold' }
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input */}
          <View style={styles.textSection}>
            <Text style={styles.textLabel}>Cerita dong apa yang terjadi hari ini:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Misalnya: Latihan basket hari ini seru banget! 🏀"
              placeholderTextColor="#999"
              value={moodText}
              onChangeText={setMoodText}
              multiline={true}
              numberOfLines={3}
              maxLength={500}
            />
            <Text style={styles.charCount}>{moodText.length}/500</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleSkip}
              disabled={isSubmitting}
            >
              <Text style={styles.skipButtonText}>Skip dulu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!selectedMood || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedMood || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Menyimpan...' : 'Kirim ke Partner 💕'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  textSection: {
    marginBottom: 25,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 0.4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 0.55,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#2E8B57',
    alignItems: 'center',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MoodCheckModal;
